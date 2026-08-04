import google.generativeai as genai
import os

class GeminiAISuggester:
    def __init__(self, api_key):
        """Initialize Gemini AI Suggester"""
        genai.configure(api_key=api_key)
        
        # Use gemini-2.0-flash-lite (fast, free, and efficient)
        self.model = genai.GenerativeModel('gemini-2.0-flash-lite')
        
    def generate_summary(self, vulnerabilities):
        """Generate an AI-powered summary of all vulnerabilities"""
        if not vulnerabilities:
            return "✅ No vulnerabilities found! Your repository appears to be secure."
        
        # Count severity levels
        high_count = sum(1 for v in vulnerabilities if v.get('severity') == 'high')
        medium_count = sum(1 for v in vulnerabilities if v.get('severity') == 'medium')
        low_count = sum(1 for v in vulnerabilities if v.get('severity') == 'low')
        
        prompt = f"""
        You are a security expert analyzing a code repository scan.
        
        SCAN RESULTS:
        - Total vulnerabilities: {len(vulnerabilities)}
        - High severity: {high_count}
        - Medium severity: {medium_count}
        - Low severity: {low_count}
        
        Vulnerabilities summary:
        {self._format_vulnerabilities_summary(vulnerabilities)}
        
        Please provide a comprehensive security report with:
        1. EXECUTIVE SUMMARY: Brief overview of the security posture (2-3 sentences)
        2. CRITICAL ISSUES: Top 3 most urgent vulnerabilities to fix first, with explanation why
        3. RECOMMENDATIONS: General security best practices for this codebase
        
        Keep the response professional, actionable, and concise (under 500 words).
        Use markdown formatting with headers and bullet points.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return self._generate_mock_summary(vulnerabilities)
    
    def generate_suggestions(self, vulnerabilities):
        """Generate AI-powered suggestions for each vulnerability"""
        enhanced_vulnerabilities = []
        
        for vuln in vulnerabilities:
            try:
                prompt = f"""
                Security Vulnerability:
                - Title: {vuln.get('title')}
                - Description: {vuln.get('description')}
                - Type: {vuln.get('type')}
                - Severity: {vuln.get('severity')}
                - File: {vuln.get('file', 'Unknown')}
                
                Provide a detailed fix solution including:
                1. Why this is a security risk
                2. Step-by-step instructions to fix it
                3. Code example of the fix (if applicable)
                4. Prevention tips
                
                Keep it concise (max 200 words).
                """
                
                response = self.model.generate_content(prompt)
                vuln['ai_suggestion'] = response.text
                
            except Exception as e:
                print(f"Error generating suggestion for {vuln.get('title')}: {e}")
                vuln['ai_suggestion'] = vuln.get('suggestion', 'Manual review recommended')
            
            enhanced_vulnerabilities.append(vuln)
        
        return enhanced_vulnerabilities
    
    def _format_vulnerabilities_summary(self, vulnerabilities):
        """Format vulnerabilities for the prompt"""
        summary = []
        for vuln in vulnerabilities[:10]:  # Limit to first 10 to avoid token limits
            summary.append(f"- [{vuln.get('severity', 'unknown').upper()}] {vuln.get('title')}: {vuln.get('description', 'No description')[:100]}")
        
        if len(vulnerabilities) > 10:
            summary.append(f"... and {len(vulnerabilities) - 10} more vulnerabilities")
        
        return '\n'.join(summary)
    
    def _generate_mock_summary(self, vulnerabilities):
        """Fallback mock summary when API fails"""
        high_count = sum(1 for v in vulnerabilities if v.get('severity') == 'high')
        medium_count = sum(1 for v in vulnerabilities if v.get('severity') == 'medium')
        low_count = sum(1 for v in vulnerabilities if v.get('severity') == 'low')
        
        return f"""## 📊 Security Scan Summary

### Overview
Found **{len(vulnerabilities)}** potential security issues in your repository.

### Severity Breakdown
- 🔴 **High Severity:** {high_count} issues (fix immediately)
- 🟡 **Medium Severity:** {medium_count} issues (fix soon)
- 🟢 **Low Severity:** {low_count} issues (consider fixing)

### Top Recommendations
1. **Prioritize high-severity issues** - These pose immediate security risks
2. **Update vulnerable dependencies** to their latest secure versions
3. **Remove any exposed secrets** found in your code

---
⚠️ **Note:** AI-powered summary temporarily unavailable. The vulnerability details below are complete and accurate.
"""