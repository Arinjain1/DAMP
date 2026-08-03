import React, { useState, useEffect } from 'react';
import BrokmateAdminApp from './Components/BrokmateAdminApp';
import Login from './Components/Login';
import { setAuthHeader } from './utils/api';

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Set the initial auth header on mount if token is found
  useEffect(() => {
    if (token) {
      setAuthHeader(token);
    }
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAuthHeader(null);
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <BrokmateAdminApp user={user} onLogout={handleLogout} />;
};

export default App;
