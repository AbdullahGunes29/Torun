import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Save } from 'lucide-react';

const ProfileView = () => {
  const [profile, setProfile] = useState({ name: "Abdullah Güneş", role: "Dükkan Sahibi", email: "abdullah@torun.com" });

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <User className="text-blue-500" /> Profil Bilgileri
      </h2>
      <div className="bg-[#1e1f20] p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-gray-800">A</div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Ad Soyad</label>
            <input type="text" value={profile.name} onChange={(e)=>setProfile({...profile, name: e.target.value})} className="w-full bg-[#131314] border border-gray-700 p-3 rounded-xl focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-Posta</label>
            <input type="email" value={profile.email} className="w-full bg-[#131314] border border-gray-700 p-3 rounded-xl opacity-50 cursor-not-allowed" disabled />
          </div>
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
          <Save size={20} /> Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
};
export default ProfileView;