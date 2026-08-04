import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('github_scanner_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setSessionId(session.sessionId);
      setAccessToken(session.accessToken);
      setUser(session.user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData, sessionId, accessToken) => {
    setUser(userData);
    setSessionId(sessionId);
    setAccessToken(accessToken);
    setIsAuthenticated(true);
    
    // Save session
    localStorage.setItem('github_scanner_session', JSON.stringify({
      sessionId,
      accessToken,
      user: userData
    }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setSessionId(null);
    setAccessToken(null);
    localStorage.removeItem('github_scanner_session');
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard 
          user={user} 
          sessionId={sessionId}
          accessToken={accessToken}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;