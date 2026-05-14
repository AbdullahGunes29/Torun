import React, { useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    birth_date_str: '',
    gender: 'seç' // Backend'deki GenderEnum ('erkek', 'kız', 'seç')
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Backend'in beklediği tarih formatı kontrolü (Örn: 29.01.2004)
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(formData.birth_date_str)) {
      setError("Tarihi Gün.Ay.Yıl formatında girmelisin (Örn: 29.01.2004)");
      setIsLoading(false);
      return;
    }

    if (formData.gender === 'seç') {
      setError("Lütfen bir cinsiyet seçiniz.");
      setIsLoading(false);
      return;
    }

    try {
      // Backend Query parametresi beklediği için 'params' kullanıyoruz
      const response = await api.post('/register', null, { params: formData });
      
      setSuccess(response.data.message || "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      
      // 2 saniye sonra otomatik olarak giriş ekranına at
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Kayıt olurken bir sorun çıktı amcacığım.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#131314] font-sans p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#1e1f20] p-8 rounded-3xl border border-gray-800 shadow-2xl overflow-y-auto max-h-screen custom-scrollbar"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Aramıza Katıl</h1>
          <p className="text-gray-400 mt-2 text-sm">Torun sistemine kayıt ol</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-xl mb-4 text-sm text-center">{success}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-xs mb-1 ml-1 uppercase tracking-wider">Ad</label>
              <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 text-xs mb-1 ml-1 uppercase tracking-wider">Soyad</label>
              <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1 ml-1 uppercase tracking-wider">E-posta</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1 ml-1 uppercase tracking-wider">Şifre <span className="text-[10px] lowercase text-gray-600">(Min 6, 1 büyük harf, 1 rakam)</span></label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-xs mb-1 ml-1 uppercase tracking-wider">Doğum Tarihi</label>
              <input type="text" name="birth_date_str" required placeholder="29.01.2004" value={formData.birth_date_str} onChange={handleChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 text-xs mb-1 ml-1 uppercase tracking-wider">Cinsiyet</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                <option value="seç">Seçiniz</option>
                <option value="erkek">Erkek</option>
                <option value="kız">Kadın</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-medium transition-all shadow-lg mt-2 disabled:opacity-50">
            {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Zaten dükkanın var mı?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Giriş Yap
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;