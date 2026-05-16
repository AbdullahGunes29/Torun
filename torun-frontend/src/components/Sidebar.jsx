import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PanelLeftClose, MessageSquarePlus, History, 
  User, Package, LogOut 
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, currentView, setCurrentView, clearChat }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full bg-[#1e1f20] border-r border-gray-800/50 flex flex-col overflow-hidden z-30"
        >
          <div className="p-6 flex items-center justify-between">
            <span className="font-bold text-blue-400 text-xl tracking-tighter">TORUN</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="px-4 mb-6">
            <button 
              onClick={() => { clearChat(); setCurrentView('chat'); }}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 font-bold"
            >
              <MessageSquarePlus size={20} />
              <span>Yeni Sohbet</span>
            </button>
          </div>
          <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest px-2 mb-4 flex items-center gap-2">
              <History size={12}/> Geçmiş Sohbetler
            </div>
            <div className="space-y-1">
              <button className="w-full text-left p-3 rounded-xl text-sm text-gray-400 hover:bg-gray-800 transition-all truncate border border-transparent hover:border-gray-700">
                • Ürün listeleme ve fiyat...
              </button>
            </div>
          </div>
          <div className="p-4 space-y-2 border-t border-gray-800/50">
            <button 
              onClick={() => setCurrentView('products')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === 'products' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-gray-800 text-gray-400'}`}
            >
              <Package size={18} /> <span className="text-sm font-medium">Ürünlerim</span>
            </button>

            <button 
              onClick={() => setCurrentView('profile')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === 'profile' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-gray-800 text-gray-400'}`}
            >
              <User size={18} /> <span className="text-sm font-medium">Profilim</span>
            </button>

            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-2 group">
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
              <span className="text-sm font-medium">Çıkış Yap</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;