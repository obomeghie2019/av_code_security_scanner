from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import requests
import os
from config import Config
from scanner.vulnerability_scanner import VulnerabilityScanner
from scanner.ai_suggester_gemini import GeminiAISuggester
#from scanner.ai_suggester import AISuggester
from functools import wraps
import secrets

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)

# Store user sessions (in production, use Redis or database)
user_tokens = {}

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No access token provided'}), 401
        
        token = auth_header.split(' ')[1]
        session_id = request.headers.get('X-Session-ID')
        
        if not session_id or session_id not in user_tokens:
            return jsonify({'error': 'Invalid session'}), 401
            
        if user_tokens[session_id] != token:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/auth/github', methods=['POST'])
def github_auth():
    """Exchange GitHub code for access token"""
    data = request.json
    code = data.get('code')
    
    if not code:
        return jsonify({'error': 'No code provided'}), 400
    
    # Exchange code for access token
    response = requests.post(
        Config.GITHUB_TOKEN_URL,
        headers={'Accept': 'application/json'},
        data={
            'client_id': Config.GITHUB_CLIENT_ID,
            'client_secret': Config.GITHUB_CLIENT_SECRET,
            'code': code
        }
    )
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to get access token'}), 400
    
    token_data = response.json()
    access_token = token_data.get('access_token')
    
    if not access_token:
        return jsonify({'error': 'No access token received'}), 400
    
    # Generate session ID
    session_id = secrets.token_urlsafe(32)
    user_tokens[session_id] = access_token
    
    # Get user info
    user_response = requests.get(
        'https://api.github.com/user',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    user_data = user_response.json() if user_response.status_code == 200 else {}
    
    return jsonify({
        'access_token': access_token,
        'session_id': session_id,
        'user': user_data
    })

@app.route('/api/scan', methods=['POST'])
@require_auth
def scan_repository():
    """Scan a GitHub repository for vulnerabilities"""
    data = request.json
    repo_url = data.get('repo_url')
    session_id = request.headers.get('X-Session-ID')
    
    if not repo_url:
        return jsonify({'error': 'No repository URL provided'}), 400
    
    access_token = user_tokens.get(session_id)
    if not access_token:
        return jsonify({'error': 'Invalid session'}), 401
    
    try:
        # Initialize scanner
        scanner = VulnerabilityScanner(access_token)
        
        # Scan repository
        vulnerabilities = scanner.scan_repository(repo_url)
        
        # Generate AI suggestions
        if Config.GOOGLE_API_KEY:
            try:
                ai_suggester = GeminiAISuggester(Config.GOOGLE_API_KEY)
                vulnerabilities = ai_suggester.generate_suggestions(vulnerabilities)
                summary = ai_suggester.generate_summary(vulnerabilities)
            except Exception as e:
                print(f"Gemini AI Error: {e}")
                summary = "AI summary temporarily unavailable. Please check your Google API key configuration."
        else:
            summary = "💡 **AI Features Disabled**\n\nTo enable AI-powered suggestions, add your Google API key to the `.env` file.\n\nGet a free key at: https://aistudio.google.com/"
        
        return jsonify({
            'success': True,
            'vulnerabilities': vulnerabilities,
            'summary': summary,
            'total_count': len(vulnerabilities)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/repos', methods=['GET'])
@require_auth
def get_user_repos():
    """Get user's repositories"""
    session_id = request.headers.get('X-Session-ID')
    access_token = user_tokens.get(session_id)
    
    if not access_token:
        return jsonify({'error': 'Invalid session'}), 401
    
    response = requests.get(
        'https://api.github.com/user/repos',
        headers={'Authorization': f'Bearer {access_token}'},
        params={'per_page': 100, 'sort': 'updated'}
    )
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch repositories'}), 400
    
    repos = response.json()
    return jsonify({'repositories': repos})

if __name__ == '__main__':
    app.run(debug=True, port=5000)