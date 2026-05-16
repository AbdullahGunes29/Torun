import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Save, Loader2, UserCircle, Mail, ShieldCheck, Calendar, Users, CheckCircle, AlertTriangle } from 'lucide-react';

const ProfileView = () => {
  const [profile, setProfile] = useState({ 
    first_name: '', 
    last_name: '', 
    birth_date: '', 
    gender: '', 
    email: '' 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    api.get('/profile')
      .then(res => { 
        setProfile({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          birth_date: res.data.birth_date || '',
          gender: res.data.gender || '',
          email: res.data.email || ''
        });
        setLoading(false); 
      })
      .catch((err) => {
        console.error("Profil verileri çekilemedi amca:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await api.put('/profile/update', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        birth_date: profile.birth_date,
        gender: profile.gender
      });
      
      setSuccessMessage("Profil bilgilerini başarıyla güncelledim amca!");
      setTimeout(() => setSuccessMessage(null), 4000);
      
    } catch (err) {
      setErrorMessage("Güncellenirken bir hata oluştu amca.");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="flex-1 p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-10 text-white">
        <div className="p-4 bg-blue-600/20 rounded-3xl text-blue-400">
          <UserCircle size={40}/>
        </div>
        <div>
          <h2 className="text-4xl font-bold">Hesap Bilgileri</h2>
          <p className="text-gray-500">Kayıt olurken girdiğin gerçek veritabanı bilgilerin burada amca.</p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-2xl text-green-400 text-sm flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-2 animate-in fade-in duration-300">
          <AlertTriangle size={18} /> {errorMessage}
        </div>
      )}

      <div className="bg-[#1e1f20] border border-gray-800 rounded-3xl p-8 space-y-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-blue-500 uppercase ml-1 tracking-widest flex items-center gap-2">
              <UserCircle size={12}/> AD
            </label>
            <input 
              value={profile.first_name} 
              onChange={e => setProfile({...profile, first_name: e.target.value})} 
              className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-blue-500 uppercase ml-1 tracking-widest flex items-center gap-2">
              <UserCircle size={12}/> SOYAD
            </label>
            <input 
              value={profile.last_name} 
              onChange={e => setProfile({...profile, last_name: e.target.value})} 
              className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-blue-500 uppercase ml-1 tracking-widest flex items-center gap-2">
              <Calendar size={12}/> DOĞUM TARİHİ
            </label>
            <input 
              type="date"
              value={profile.birth_date} 
              onChange={e => setProfile({...profile, birth_date: e.target.value})} 
              className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-blue-500 uppercase ml-1 tracking-widest flex items-center gap-2">
              <Users size={12}/> CİNSİYET
            </label>
            <select
              value={profile.gender}
              onChange={e => setProfile({...profile, gender: e.target.value})}
              className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white outline-none focus:border-blue-500 transition-all shadow-inner"
            >
              <option value="">Seçiniz</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest flex items-center gap-2">
              <Mail size={12}/> E-POSTA ADRESİ
            </label>
            <div className="relative">
              <input 
                value={profile.email} 
                disabled 
                className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-gray-500 cursor-not-allowed opacity-60 font-medium" 
              />
              <ShieldCheck size={18} className="absolute right-4 top-4 text-green-500" />
            </div>
          </div>

        </div>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
          Bilgileri Güncelle
        </button>
      </div>
    </div>
  );
};

export default ProfileView;