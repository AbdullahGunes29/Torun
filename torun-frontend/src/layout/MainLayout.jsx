import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ActionPanel from '../components/ActionPanel';

// Diğer Sayfalar (Eğer dosyaların hazırsa import et, yoksa boş div dönerler)
import ProfileView from '../components/views/ProfileView';
import SettingsView from '../components/views/SettingsView';
import ProductManagementView from '../components/views/ProductManagementView';

const MainLayout = () => {
  const [currentView, setCurrentView] = useState('chat'); // chat, profile, settings, products
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [analysisData, setAnalysisData] = useState(null); 
  
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText.toLowerCase();
    setInputText("");
    setIsLoading(true);

    let isAddProductInit = (currentInput.includes("ekle") || currentInput.includes("yükle")) && !currentInput.includes("onay");

    try {
      if (isAddProductInit) {
        setActiveAction('product-add');
        setAnalysisData(null); 
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Tabii amca, fotoğrafı sağa yükler misin?", sender: 'bot' }]);
      } else {
        let finalQuery = currentInput;
        if (activeAction === 'product-add' && analysisData) {
          finalQuery = `${currentInput}\n\n[GİZLİ VERİ: Adı="${analysisData.product_name}", Fiyat="${analysisData.price}", Açıklama="${analysisData.description}", Fotoğraf="${analysisData.image_path}"]`;
        }

        const response = await api.get('/asistan', { params: { soru: finalQuery } });
        let botResponse = response.data.torun_yaniti;

        if (botResponse.includes('|||')) {
          const parts = botResponse.split('|||');
          botResponse = parts[0].trim();
          const cmd = JSON.parse(parts[1]);
          if (cmd.command === "list") { setActiveAction('product-list'); }
          else if (cmd.command === "execute" && cmd.action === "save") {
            await api.post('/confirm', analysisData);
            setActiveAction('product-list');
            const res = await api.get('/list'); setProducts(res.data.products);
          } else if (cmd.product_name) { setAnalysisData(cmd); }
        }
        setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Bağlantı koptu amca.", sender: 'bot' }]);
    } finally { setIsLoading(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/delete-confirm/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  // --- SAYFA İÇERİĞİNİ YÖNETEN FONKSİYON ---
  const renderContent = () => {
    switch (currentView) {
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      case 'products': return <ProductManagementView products={products} />;
      default:
        return (
          <div className="flex h-full w-full">
            {/* SOL TARAF: SOHBET */}
            <section className={`flex flex-col h-full transition-all duration-500 ${activeAction ? 'w-1/2 border-r border-gray-800' : 'w-full'}`}>
              <div className="flex-1 overflow-y-auto px-4 py-10">
                <div className="max-w-2xl mx-auto space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center mt-20">
                      <h1 className="text-5xl font-medium bg-linear-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent mb-4">Merhaba</h1>
                      <p className="text-gray-500 italic text-lg">"Yeni bir ürün ekle amca" diyebilirsin.</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-[15px] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-[#2b2c2e] text-gray-200 border border-gray-700/50'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="pb-8 px-4 flex justify-center">
                <div className="w-full max-w-2xl bg-[#1e1f20] rounded-full p-2 flex items-center gap-2 border border-gray-800 shadow-2xl">
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Torun'a sor..." className="bg-transparent flex-1 outline-none px-6 py-3" />
                  <button type="submit" className="p-3 bg-blue-600 rounded-full text-white hover:scale-105 transition-all"><Send size={20} /></button>
                </div>
              </form>
            </section>

            {/* SAĞ TARAF: AKSİYON PANELİ */}
            <AnimatePresence mode="wait">
              {activeAction && (
                <ActionPanel 
                  activeAction={activeAction} 
                  closePanel={() => setActiveAction(null)} 
                  products={products} setProducts={setProducts}
                  handleDelete={handleDelete} setMessages={setMessages}
                  analysisData={analysisData} setAnalysisData={setAnalysisData}
                />
              )}
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] overflow-hidden">
      <Sidebar 
        onNavigate={(view) => {
          setCurrentView(view);
          if (view !== 'chat') setActiveAction(null); // Sohbetten çıkınca paneli kapat
        }}
        activeView={currentView}
        clearChat={() => setMessages([])}
      />
      <main className="flex-1 flex flex-col relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainLayout;