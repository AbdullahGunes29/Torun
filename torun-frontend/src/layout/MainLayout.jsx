import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ActionPanel from '../components/ActionPanel';
// --- DOSYA YOLLARINI SENİN KLASÖR YAPINA (components/views) GÖRE DÜZELTTİK ---
import ProfileView from '../components/views/ProfileView'; 
import ProductManagementView from '../components/views/ProductManagementView';
import { Send, Loader2, PanelLeftOpen } from 'lucide-react';

const MainLayout = () => {
  // --- MEVCUT DURUMLAR (DOKUNULMADI) ---
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [activeAction, setActiveAction] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [analysisData, setAnalysisData] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // --- SIDEBAR İÇİN GEREKLİ YENİ DURUMLAR ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'profile', 'products'

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const refreshProducts = async () => {
    try {
      const res = await api.get('/list');
      setProducts(res.data.products || []);
    } catch (err) { console.error("Liste yenilenemedi."); }
  };

  useEffect(() => { refreshProducts(); }, []);

  const playVoice = async (text) => {
    try {
      const res = await api.get('/asistan-sesli', { params: { soru: text }, responseType: 'blob' });
      const audio = new Audio(URL.createObjectURL(res.data));
      audio.play().catch(() => console.log("Ses hatası"));
    } catch (err) { console.error("Ses hatası"); }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const userText = inputText;
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInputText("");
    setIsLoading(true);

    try {
      let query = userText;
      const context = selectedProduct || analysisData;
      if (context) query += `\n\n[SİSTEM BİLGİSİ: ${JSON.stringify(context)}]`;

      const response = await api.get('/asistan', { params: { soru: query } });
      let botResponse = response.data.torun_yaniti;

      if (botResponse.includes('|||')) {
        const parts = botResponse.split('|||');
        botResponse = parts[0].trim();
        const cmd = JSON.parse(parts[1]);

        if (cmd.command === "list") {
          await refreshProducts();
          setActiveAction('product-list');
          setSelectedProduct(null);
        } else if (cmd.command === "add") {
          setAnalysisData(null);
          setSelectedProduct(null);
          setActiveAction('product-add');
        } else if (cmd.command === "execute" && cmd.action === "save") {
          await api.post('/confirm', analysisData || selectedProduct);
          await refreshProducts();
          setActiveAction('product-list');
          setSelectedProduct(null);
        } else if (cmd.command === "execute" && cmd.action === "delete") {
          const arananIsim = (cmd.product_name || "").toLowerCase().trim();
          const bulunanUrun = products.find(p => p.product_name.toLowerCase().includes(arananIsim));
          if (bulunanUrun) {
            setSelectedProduct(bulunanUrun);
            setActiveAction('product-list');
          }
        } else if (cmd.product_name || cmd.price) {
          const found = products.find(p => p.product_name.toLowerCase().includes(cmd.product_name?.toLowerCase()));
          if (found) {
            setSelectedProduct({ ...found, ...cmd });
            setActiveAction('product-list');
          } else {
            setAnalysisData(prev => ({ ...prev, ...cmd }));
          }
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      playVoice(botResponse);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Torun biraz yoruldu amca.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);     
    setActiveAction(null);    
    setSelectedProduct(null);
  };
  
  
  const handleNewChat = () => {
    setMessages([]);          
    setActiveAction(null);    
    setSelectedProduct(null); 
    setCurrentView('chat');   
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileView />;
      case 'products':
        return <ProductManagementView />;
      default:
        return (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="max-w-2xl mx-auto py-10">
                {messages.length === 0 && (
                  <div className="text-center py-20">
                    <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-6">Merhaba</h1>
                    <p className="text-xl text-gray-500 italic text-center">"Torun'a Ürünlerimi listeler misin?" diyerek başlayabilirsin.</p>
                  </div>
                )}
                <div className="space-y-6">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-lg ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#2b2c2e] text-gray-200 border border-gray-700/50 rounded-tl-none'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#2b2c2e] px-5 py-3 rounded-2xl flex items-center gap-3 border border-gray-700 shadow-md">
                        <Loader2 size={18} className="animate-spin text-blue-400" />
                        <span className="text-sm text-gray-400 font-medium">Torun düşünüyor...</span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </div>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 bg-[#131314]">
              <div className="max-w-2xl mx-auto relative">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Torun'a sor amca..." className="w-full bg-[#1e1f20] border border-gray-800 rounded-full py-4 px-6 pr-16 outline-none focus:border-blue-500 transition-all shadow-2xl" />
                <button type="submit" className="absolute right-2 top-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-all shadow-lg flex items-center justify-center">
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView={currentView} 
        setCurrentView={handleNavigate} 
        clearChat={handleNewChat}       
      />
      
      <main className="flex-1 flex relative">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-5 left-5 z-50 p-2 bg-[#1e1f20] hover:bg-gray-800 rounded-lg border border-gray-800 text-gray-400 transition-all"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}

        <section className={`flex flex-col h-full transition-all duration-500 ${activeAction ? 'w-1/2 border-r border-gray-800' : 'w-full'}`}>
          {renderContent()}
        </section>

        {currentView === 'chat' && (
          <ActionPanel 
            activeAction={activeAction} 
            closePanel={() => { setActiveAction(null); setSelectedProduct(null); }} 
            products={products} 
            setProducts={setProducts} 
            selectedProduct={selectedProduct} 
            setSelectedProduct={setSelectedProduct} 
            analysisData={analysisData} 
            setAnalysisData={setAnalysisData} 
            setMessages={setMessages}      
            setActiveAction={setActiveAction}
          />
        )}
      </main>
    </div>
  );
};

export default MainLayout;