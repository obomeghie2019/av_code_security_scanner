import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, Shield, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const Results = ({ results }) => {
  const [expandedVuln, setExpandedVuln] = useState(null);
  const [filter, setFilter] = useState('all');

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return <AlertTriangle size={20} color="#dc2626" />;
      case 'medium': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'low': return <CheckCircle size={20} color="#10b981" />;
      default: return <Info size={20} color="#6b7280" />;
    }
  };

  const filteredVulnerabilities = results.vulnerabilities.filter(vuln => {
    if (filter === 'all') return true;
    return vuln.severity?.toLowerCase() === filter;
  });

  const stats = {
    high: results.vulnerabilities.filter(v => v.severity?.toLowerCase() === 'high').length,
    medium: results.vulnerabilities.filter(v => v.severity?.toLowerCase() === 'medium').length,
    low: results.vulnerabilities.filter(v => v.severity?.toLowerCase() === 'low').length
  };

  return (
    <div className="results-container fade-in">
      <div className="summary-card">
        <h2>Scan Results</h2>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value">{results.total_count}</div>
            <div className="stat-label">Total Vulnerabilities</div>
          </div>
          <div className="stat">
            <div className="stat-value" style={{color: '#dc2626'}}>{stats.high}</div>
            <div className="stat-label">High Severity</div>
          </div>
          <div className="stat">
            <div className="stat-value" style={{color: '#f59e0b'}}>{stats.medium}</div>
            <div className="stat-label">Medium Severity</div>
          </div>
          <div className="stat">
            <div className="stat-value" style={{color: '#10b981'}}>{stats.low}</div>
            <div className="stat-label">Low Severity</div>
          </div>
        </div>
      </div>

      {results.summary && (
        <div className="ai-summary">
          <h3>🤖 AI Security Summary</h3>
          <ReactMarkdown>{results.summary}</ReactMarkdown>
        </div>
      )}

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn high ${filter === 'high' ? 'active' : ''}`}
          onClick={() => setFilter('high')}
        >
          High ({stats.high})
        </button>
        <button 
          className={`filter-btn medium ${filter === 'medium' ? 'active' : ''}`}
          onClick={() => setFilter('medium')}
        >
          Medium ({stats.medium})
        </button>
        <button 
          className={`filter-btn low ${filter === 'low' ? 'active' : ''}`}
          onClick={() => setFilter('low')}
        >
          Low ({stats.low})
        </button>
      </div>

      <div className="vulnerabilities-list">
        {filteredVulnerabilities.map((vuln, index) => (
          <div key={index} className="vulnerability-card">
            <div 
              className="vulnerability-header"
              onClick={() => setExpandedVuln(expandedVuln === index ? null : index)}
              style={{borderLeftColor: getSeverityColor(vuln.severity)}}
            >
              <div className="vuln-info">
                {getSeverityIcon(vuln.severity)}
                <div>
                  <h4>{vuln.title}</h4>
                  <div className="vuln-meta">
                    <span className="vuln-type">{vuln.type}</span>
                    {vuln.file && <span className="vuln-file">📁 {vuln.file}</span>}
                    {vuln.line && <span className="vuln-line">📍 Line {vuln.line}</span>}
                  </div>
                </div>
              </div>
              <div className="vuln-expand">
                <span className={`severity-badge ${vuln.severity?.toLowerCase()}`}>
                  {vuln.severity}
                </span>
                {expandedVuln === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedVuln === index && (
              <div className="vulnerability-details">
                <div className="detail-section">
                  <strong>Description:</strong>
                  <p>{vuln.description}</p>
                </div>
                
                <div className="detail-section suggestion">
                  <strong>💡 Suggested Fix:</strong>
                  <p>{vuln.suggestion}</p>
                </div>
                
                {vuln.ai_suggestion && vuln.ai_suggestion !== vuln.suggestion && (
                  <div className="detail-section ai-suggestion">
                    <strong>🤖 AI-Powered Solution:</strong>
                    <ReactMarkdown>{vuln.ai_suggestion}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {filteredVulnerabilities.length === 0 && (
          <div className="no-results">
            <Shield size={48} color="#10b981" />
            <h3>No vulnerabilities found!</h3>
            <p>Your repository appears to be secure based on our scan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;