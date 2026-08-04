import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Github } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGitHubLogin = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'repo read:user';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleCallback = async (code) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/github', { code });
      const { access_token, session_id, user } = response.data;
      onLogin(user, session_id, access_token);
    } catch (err) {
      setError('Failed to authenticate with GitHub. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check for OAuth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleCallback(code);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <Shield size={48} color="#667eea" />
          <h1>Automated Vulnerability Scanner by: Mukhallad Obomeghie</h1>
          <p>AI-powered security scanning for your repositories</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          className="github-login-btn"
          onClick={handleGitHubLogin}
          disabled={loading}
        >
          <Github size={20} />
          <span>{loading ? 'Connecting...' : 'Sign in with GitHub'}</span>
        </button>
        
        <div className="login-features">
          <h3>Features:</h3>
          <ul>
            <li>🔍 Scan for dependency vulnerabilities</li>
            <li>🔒 Detect exposed secrets and API keys</li>
            <li>📝 Code security analysis</li>
            <li>🤖 AI-powered fix suggestions</li>
            <li>📊 Comprehensive security reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;