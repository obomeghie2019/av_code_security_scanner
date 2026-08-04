import React, { useState } from 'react';
import { Search, Loader, Github } from 'lucide-react';

const Scanner = ({ repositories, onScan, scanning }) => {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleScan = () => {
    const urlToScan = useCustom ? customUrl : selectedUrl;
    if (urlToScan) {
      onScan(urlToScan);
    }
  };

  return (
    <div className="scanner-container fade-in">
      <div className="scanner-card">
        <h2>Security Scanner</h2>
        <p>Select a repository to scan for vulnerabilities</p>
        
        <div className="scan-options">
          <label className="radio-label">
            <input
              type="radio"
              checked={!useCustom}
              onChange={() => setUseCustom(false)}
            />
            Select from your repositories
          </label>
          
          <label className="radio-label">
            <input
              type="radio"
              checked={useCustom}
              onChange={() => setUseCustom(true)}
            />
            Enter custom repository URL
          </label>
        </div>
        
        {!useCustom ? (
          <div className="repo-select">
            <Github size={20} />
            <select 
              value={selectedUrl} 
              onChange={(e) => setSelectedUrl(e.target.value)}
              className="repo-dropdown"
            >
              <option value="">Select a repository...</option>
              {repositories.map(repo => (
                <option key={repo.id} value={repo.html_url}>
                  {repo.full_name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="custom-url-input">
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="url-input"
            />
          </div>
        )}
        
        <button 
          onClick={handleScan} 
          disabled={scanning || (!useCustom && !selectedUrl) || (useCustom && !customUrl)}
          className="scan-button"
        >
          {scanning ? (
            <>
              <Loader className="spinning" size={20} />
              Scanning...
            </>
          ) : (
            <>
              <Search size={20} />
              Start Scan
            </>
          )}
        </button>
        
        {scanning && (
          <div className="scanning-status">
            <div className="loader"></div>
            <p>Analyzing repository for security issues...</p>
            <small>This may take a few moments</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;