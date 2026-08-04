import openai
import json

class AISuggester:
    def __init__(self, api_key):
        openai.api_key = api_key
        
    def generate_suggestions(self, vulnerabilities):
        """Generate AI-powered suggestions for vulnerabilities"""
        if not vulnerabilities:
            return []
        
        suggestions = []
        
        for vuln in vulnerabilities:
            prompt = self._create_prompt(vuln)
            
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a security expert. Provide specific, actionable solutions to fix code vulnerabilities."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                
                ai_suggestion = response.choices[0].message.content
                vuln['ai_suggestion'] = ai_suggestion
                suggestions.append(vuln)
                
            except Exception as e:
                print(f"Error generating AI suggestion: {e}")
                vuln['ai_suggestion'] = vuln.get('suggestion', 'Manual review recommended')
                suggestions.append(vuln)
                
        return suggestions
    
    def _create_prompt(self, vulnerability):
        """Create prompt for AI based on vulnerability type"""
        prompt = f"""
        Vulnerability Type: {vulnerability.get('type', 'unknown')}
        Severity: {vulnerability.get('severity', 'unknown')}
        Title: {vulnerability.get('title', 'No title')}
        Description: {vulnerability.get('description', 'No description')}
        
        Please provide:
        1. A clear explanation of why this is a security risk
        2. Step-by-step instructions to fix it
        3. Code example of the fix (if applicable)
        4. Best practices to prevent similar issues
        
        Keep the response concise but informative.
        """
        return prompt
    
    def generate_summary(self, vulnerabilities):
        """Generate an AI-powered summary of all vulnerabilities"""
        if not vulnerabilities:
            return "No vulnerabilities found. Your repository appears to be secure!"
        
        summary_prompt = f"""
        I have found {len(vulnerabilities)} security vulnerabilities in a code repository.
        
        Breakdown by severity:
        - High: {sum(1 for v in vulnerabilities if v.get('severity') == 'high')}
        - Medium: {sum(1 for v in vulnerabilities if v.get('severity') == 'medium')}
        - Low: {sum(1 for v in vulnerabilities if v.get('severity') == 'low')}
        
        Please provide:
        1. A brief executive summary of the security posture
        2. Top 3 most critical issues to address first
        3. General recommendations for improving security
        
        Keep it professional and actionable.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a security consultant providing actionable insights."},
                    {"role": "user", "content": summary_prompt}
                ],
                max_tokens=500,
                temperature=0.5
            )
            return response.choices[0].message.content
        except:
            return "Unable to generate AI summary. Please review the individual vulnerabilities manually."