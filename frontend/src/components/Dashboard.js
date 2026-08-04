import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Scanner from './Scanner';
import Results from './Results';
import { LogOut, User, Shield, Activity, RotateCcw, Loader } from 'lucide-react';

const Dashboard = ({ user, sessionId, accessToken, onLogout }) => {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/repos', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Session-ID': sessionId
        }
      });
      setRepositories(response.data.repositories);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    }
  };

  const simulateProgress = () => {
    const stages = [
      { progress: 10, stage: 'Initializing scanner...' },
      { progress: 25, stage: 'Cloning repository...' },
      { progress: 40, stage: 'Scanning dependencies...' },
      { progress: 55, stage: 'Analyzing code security...' },
      { progress: 70, stage: 'Checking for exposed secrets...' },
      { progress: 85, stage: 'Reviewing configurations...' },
      { progress: 95, stage: 'Generating AI suggestions...' }
    ];

    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < stages.length) {
        setScanProgress(stages[currentIndex].progress);
        setScanStage(stages[currentIndex].stage);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return interval;
  };

  const handleScan = async (repoUrl) => {
    setScanning(true);
    setScanResults(null);
    setScanProgress(0);
    setScanStage('Starting scan...');
    
    // Start progress simulation
    const progressInterval = simulateProgress();
    
    try {
      const response = await axios.post('http://localhost:5000/api/scan', 
        { repo_url: repoUrl },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Session-ID': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Complete the progress
      setScanProgress(100);
      setScanStage('Scan completed!');
      
      // Small delay to show 100% before showing results
      setTimeout(() => {
        setScanResults(response.data);
        setActiveTab('results');
        clearInterval(progressInterval);
        setScanProgress(0);
        setScanStage('');
      }, 500);
      
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Failed to scan repository. Please try again.');
      clearInterval(progressInterval);
      setScanProgress(0);
      setScanStage('');
    } finally {
      setTimeout(() => {
        setScanning(false);
      }, 1000);
    }
  };

  const handleClearResults = () => {
    setScanResults(null);
    setActiveTab('scan');
    setSelectedRepo(null);
    setScanProgress(0);
    setScanStage('');
  };

  const handleNewScan = () => {
    setScanResults(null);
    setActiveTab('scan');
    setSelectedRepo(null);
    setScanProgress(0);
    setScanStage('');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">
          <Shield size={24} />
          <span>AVS Tool v1.1.3</span>
        </div>
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <Activity size={18} />
            Scan Repository
          </button>
          {scanResults && (
            <button 
              className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Results ({scanResults.total_count})
            </button>
          )}
          {scanResults && (
            <button 
              onClick={handleNewScan} 
              className="nav-tab new-scan-btn"
              title="Start New Scan"
            >
              <RotateCcw size={18} />
              New Scan
            </button>
          )}
        </div>
        
        <div className="user-info">
          <img src={user.avatar_url} alt={user.login} className="avatar" />
          <span>{user.login}</span>
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      
      {/* Progress Bar Component */}
      {scanning && scanProgress > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar-wrapper">
            <div className="progress-header">
              <div className="progress-stage">
                <Loader className="spinning" size={16} />
                <span>{scanStage}</span>
              </div>
              <div className="progress-percentage">{scanProgress}%</div>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${scanProgress}%` }}
              >
                <div className="progress-bar-shine"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="dashboard-content">
        {activeTab === 'scan' && (
          <Scanner 
            repositories={repositories}
            onScan={handleScan}
            scanning={scanning}
            onClear={handleClearResults}
            onNewScan={handleNewScan}
          />
        )}
        
        {activeTab === 'results' && scanResults && (
          <Results 
            results={scanResults} 
            onNewScan={handleNewScan}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;