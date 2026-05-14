import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle, Loader2, ImagePlus, ChevronLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

// ==========================================
// 1. BİLEŞEN: ÜRÜN EKLEME VE ANALİZ EKRANI
// ==========================================
const ProductAddView = ({ setMessages, setProducts, closePanel, analysisData, setAnalysisData }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAnalysisData(null); 
      
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("file", selected);

      try {
        const res = await api.post('/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setAnalysisData(res.data);
        setMessages(prev => [...prev, { id: Date.now(), text: res.data.voice_text, sender: 'bot' }]);
      } catch (error) {
        console.error("Analiz hatası:", error);
        setMessages(prev => [...prev, { id: Date.now(), text: "Amcacığım fotoğrafı incelerken bir hata oldu, başka bir fotoğraf dener misin?", sender: 'bot' }]);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await api.post('/confirm', analysisData);
      setMessages(prev => [...prev, { id: Date.now(), text: res.data.voice_text, sender: 'bot' }]);
      const listRes = await api.get('/list');
      setProducts(listRes.data.products);
      closePanel();
    } catch (error) {
      console.error("Kaydetme hatası:", error);
    }
  };

  const handleInputChange = (e) => {
    setAnalysisData({ ...analysisData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div 
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${isAnalyzing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${preview ? 'border-gray-700 bg-[#131314]' : 'border-gray-700 hover:border-blue-500 hover:bg-[#1e1f20]'}`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
        ) : (
          <>
            <UploadCloud size={40} className="text-gray-500 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Fotoğraf Seç veya Sürükle</p>
          </>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>

      {isAnalyzing && (
        <div className="w-full bg-blue-600/20 border border-blue-500/50 text-blue-400 p-4 rounded-2xl font-medium shadow-lg flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          Yapay Zeka İnceliyor...
        </div>
      )}

      {analysisData && (
        <div className="bg-[#1e1f20] p-5 rounded-2xl border border-blue-500/30 space-y-4 shadow-lg">
          <div>
            <label className="block text-xs text-blue-400 font-bold uppercase tracking-wider mb-1 ml-1">Ürün Adı</label>
            <input type="text" name="product_name" value={analysisData.product_name} onChange={handleInputChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-xs text-blue-400 font-bold uppercase tracking-wider mb-1 ml-1">Fiyat (TL)</label>
            <input type="text" name="price" value={analysisData.price} onChange={handleInputChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-xs text-blue-400 font-bold uppercase tracking-wider mb-1 ml-1">Açıklama</label>
            <textarea name="description" value={analysisData.description} onChange={handleInputChange} className="w-full bg-[#131314] text-white p-3 rounded-xl border border-gray-800 focus:border-blue-500 outline-none text-sm min-h-20 transition-all" />
          </div>
          <button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-500 text-white p-4 rounded-xl font-medium transition-all shadow-lg mt-2">
            Onayla ve Kaydet
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. BİLEŞEN: ÜRÜN LİSTELEME VE DETAY EKRANI
// ==========================================
const ProductListView = ({ products, handleDelete }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Güvenlik: products boş gelirse çökmeyi engelle
  const safeProducts = products || [];

  if (safeProducts.length === 0) {
    return (
      <div className="bg-[#1e1f20] p-5 rounded-2xl border border-gray-800 text-center italic text-gray-400 text-sm">
        Şu an dükkanda listelenecek ürün görünmüyor amcacığım.
      </div>
    );
  }

  // --- DETAY EKRANI ---
  if (selectedProduct) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-all mb-4">
          <ChevronLeft size={18} /> Ürün Listesine Dön
        </button>

        <div className="w-full h-64 bg-[#131314] rounded-2xl overflow-hidden border border-gray-800 shadow-lg p-2">
           {selectedProduct.image_path ? (
             <img src={`http://127.0.0.1:8000/${selectedProduct.image_path}`} alt="Ürün" className="w-full h-full object-contain rounded-xl" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-600">Görsel Yok</div>
           )}
        </div>

        <div className="bg-[#1e1f20] p-6 rounded-2xl border border-gray-800 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-white">{selectedProduct.product_name}</h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold">{selectedProduct.price}</span>
          </div>
          <div className="h-px w-full bg-gray-800 my-4"></div>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{selectedProduct.description}</p>
        </div>
      </motion.div>
    );
  }

  // --- LİSTE EKRANI ---
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {safeProducts.map(item => (
        <div key={item.id} className="bg-[#1e1f20] p-4 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all group shadow-lg flex gap-4">
          
          <div className="flex-1 flex gap-4 cursor-pointer" onClick={() => setSelectedProduct(item)}>
            <div className="w-24 h-24 shrink-0 bg-[#131314] rounded-xl overflow-hidden border border-gray-700/50 flex items-center justify-center group-hover:scale-105 transition-transform">
              {item.image_path ? <img src={`http://127.0.0.1:8000/${item.image_path}`} alt="Ürün" className="w-full h-full object-cover" /> : <span className="text-gray-600 text-xs">Görsel Yok</span>}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">{item.product_name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              <span className="inline-block mt-2 text-xs font-bold bg-gray-800 text-blue-400 px-2 py-1 rounded-lg">{item.price}</span>
            </div>
          </div>
          
          <div className="flex flex-col justify-between items-end border-l border-gray-800 pl-4 w-28 shrink-0">
             <AnimatePresence mode="wait">
              {deletingId === item.id ? (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-2 w-full">
                  <button onClick={() => { handleDelete(item.id); setDeletingId(null); }} className="w-full py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-all">SİL</button>
                  <button onClick={() => setDeletingId(null)} className="w-full py-2 bg-gray-700 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-600 transition-all">VAZGEÇ</button>
                </motion.div>
              ) : (
                <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center">
                  <button onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      ))}
    </motion.div>
  );
};

// ==========================================
// 3. ANA BİLEŞEN: ÇERÇEVE (WRAPPER)
// ==========================================
const ActionPanel = ({ activeAction, closePanel, products, setProducts, handleDelete, setMessages, analysisData, setAnalysisData }) => {
  if (!activeAction) return null;

  return (
    <motion.aside 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="w-1/2 h-full bg-[#0a0a0a] border-l border-gray-800 shadow-2xl flex flex-col z-20"
    >
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#131314]">
        <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase flex items-center gap-2">
          {activeAction === 'product-add' ? <ImagePlus size={18}/> : <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
          {activeAction === 'product-add' ? 'Yeni Ürün Analizi' : 'Ürün Listesi / Detay'}
        </h2>
        <button onClick={closePanel} className="p-2 hover:bg-gray-800 rounded-full transition-all text-gray-500 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {activeAction === 'product-add' && (
          <ProductAddView 
            setMessages={setMessages} 
            setProducts={setProducts} 
            closePanel={closePanel} 
            analysisData={analysisData} 
            setAnalysisData={setAnalysisData} 
          />
        )}
        
        {activeAction === 'product-list' && (
          <ProductListView 
            products={products} 
            handleDelete={handleDelete} 
          />
        )}
      </div>
    </motion.aside>
  );
};

export default ActionPanel;