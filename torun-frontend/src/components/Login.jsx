import React, { useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('torun_token', response.data.access_token);
      localStorage.setItem('torun_user', response.data.user_name);
      
      onLoginSuccess();
    } catch (err) {
      setError('E-posta veya şifre hatalı amcacığım.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#131314] font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1e1f20] p-8 rounded-3xl border border-gray-800 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#4285f4] to-[#d96570] bg-clip-text text-transparent">Torun</h1>
          <p className="text-gray-400 mt-2">Dükkanına Hoş Geldin</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-sm mb-2 ml-1">E-posta</label>
            <input 
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#131314] text-white p-4 rounded-2xl border border-gray-800 focus:border-blue-500 outline-none transition-all"
              placeholder="amca@ornek.com"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2 ml-1">Şifre</label>
            <input 
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#131314] text-white p-4 rounded-2xl border border-gray-800 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-medium transition-all shadow-lg disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Dükkanı Aç'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Henüz dükkanı açmadın mı?{' '}
          <button onClick={onSwitchToRegister} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Kayıt Ol
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;