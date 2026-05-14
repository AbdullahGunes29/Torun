import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, MessageSquare, History, User, Settings, LogOut, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ messages, clearChat, onNavigate, activeView }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ width: isOpen ? '260px' : '80px' }}
      className="h-full bg-[#1e1f20] border-r border-gray-800 flex flex-col transition-all duration-300 relative z-30"
    >
      {/* ÜST KISIM: Logo ve Gizleme */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {isOpen && <h1 className="text-xl font-bold text-blue-500 tracking-wider">TORUN</h1>}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all mx-auto"
        >
          {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      {/* YENİ SOHBET BUTONU (onNavigate buraya eklendi) */}
      <div className="p-4">
        <button 
          onClick={() => {
            onNavigate('chat'); // Sohbet ekranına git
            clearChat();        // Sohbeti temizle (isteğe bağlı)
          }} 
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all border ${
            activeView === 'chat' 
              ? 'bg-blue-600 text-white border-blue-500' 
              : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border-blue-500/20'
          }`}
        >
          <MessageSquare size={18} />
          {isOpen && <span className="font-medium text-sm">Yeni Sohbet</span>}
        </button>
      </div>

      {/* GEÇMİŞ SOHBETLER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
        {isOpen && <p className="text-xs font-bold text-gray-500 mb-3 px-2 mt-2 uppercase">Geçmiş</p>}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#2b2c2e] text-gray-400 transition-all text-left">
             <History size={18} className="shrink-0" />
             {isOpen && <span className="text-sm truncate">Ürün listeleme ve fiyat...</span>}
          </button>
        </div>
      </div>

      {/* ALT KISIM: Profil ve Açılır Menü (onNavigate buraya eklendi) */}
      <div className="p-4 border-t border-gray-800 relative">
        {showProfileMenu && isOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#2b2c2e] border border-gray-700 rounded-xl p-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            
            <button 
              onClick={() => { onNavigate('profile'); setShowProfileMenu(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${activeView === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'}`}
            >
              <User size={16} /> Profilimi Düzenle
            </button>

            <button 
              onClick={() => { onNavigate('products'); setShowProfileMenu(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${activeView === 'products' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'}`}
            >
              <Package size={16} /> Ürünlerimi Yönet
            </button>

            <button 
              onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${activeView === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'}`}
            >
              <Settings size={16} /> Uygulama Ayarları
            </button>

            <div className="h-px bg-gray-700 my-1"></div>
            
            <button className="w-full flex items-center gap-3 p-3 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-all">
              <LogOut size={16} /> Çıkış Yap
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center ${isOpen ? 'justify-start gap-3' : 'justify-center'} p-2 hover:bg-[#2b2c2e] rounded-xl transition-all ${showProfileMenu ? 'bg-[#2b2c2e]' : ''}`}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
            A
          </div>
          {isOpen && (
            <div className="text-left flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Abdullah Güneş</p>
              <p className="text-xs text-gray-400">Dükkan Sahibi</p>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;