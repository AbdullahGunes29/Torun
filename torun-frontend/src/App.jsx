import React, { useState, useEffect } from 'react';
import MainLayout from './layout/MainLayout';
import Login from './components/Login';
import Register from './components/Register'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [authView, setAuthView] = useState('login'); 

  useEffect(() => {
    const token = localStorage.getItem('torun_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) return <div className="h-screen bg-[#131314]"></div>;


  if (isAuthenticated) {
    return <MainLayout />;
  }

  if (authView === 'register') {
    return <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  return (
    <Login 
      onLoginSuccess={() => setIsAuthenticated(true)} 
      onSwitchToRegister={() => setAuthView('register')} 
    />
  );
}

export default App;