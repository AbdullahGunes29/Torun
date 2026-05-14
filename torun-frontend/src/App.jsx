import React, { useState, useEffect } from 'react';
import MainLayout from './layout/MainLayout';
import Login from './components/Login';
import Register from './components/Register'; // Register'ı ekledik

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' veya 'register'

  useEffect(() => {
    const token = localStorage.getItem('torun_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) return <div className="h-screen bg-[#131314]"></div>;

  // Giriş yapılmışsa Torun'u aç
  if (isAuthenticated) {
    return <MainLayout />;
  }

  // Giriş yapılmamışsa ve authView 'register' ise Kayıt ekranını aç
  if (authView === 'register') {
    return <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  // Varsayılan olarak Giriş ekranını aç
  return (
    <Login 
      onLoginSuccess={() => setIsAuthenticated(true)} 
      onSwitchToRegister={() => setAuthView('register')} 
    />
  );
}

export default App;