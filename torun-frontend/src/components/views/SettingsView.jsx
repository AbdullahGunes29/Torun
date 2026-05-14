import React from 'react';
import { Settings, Moon, Type, Palette } from 'lucide-react';

const SettingsView = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Settings className="text-blue-500" /> Uygulama Ayarları
      </h2>
      <div className="space-y-4">
        <div className="bg-[#1e1f20] p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl"><Moon size={24}/></div>
            <div>
              <p className="font-bold text-gray-200">Koyu Tema</p>
              <p className="text-xs text-gray-500">Gözlerinizi yormayan gece modu</p>
            </div>
          </div>
          <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
        </div>

        <div className="bg-[#1e1f20] p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/10 text-purple-500 rounded-xl"><Type size={24}/></div>
            <div>
              <p className="font-bold text-gray-200">Yazı Boyutu</p>
              <p className="text-xs text-gray-500">Torun'un konuşma fontunu ayarla</p>
            </div>
          </div>
          <input type="range" className="w-full accent-blue-600" min="12" max="24" defaultValue="16" />
        </div>
      </div>
    </div>
  );
};
export default SettingsView;