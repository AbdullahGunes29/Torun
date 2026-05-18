import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Trash2, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ProductAddView from './views/ProductAddView';

const ActionPanel = ({ 
  activeAction, 
  closePanel, 
  products, 
  setProducts, 
  selectedProduct, 
  setSelectedProduct, 
  analysisData, 
  setAnalysisData,
  setMessages, 
  setActiveAction 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setDeleteConfirm(false);
  }, [selectedProduct, activeAction]);

  if (!activeAction) return null;

  const handleUpdate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await api.put(`/update/${selectedProduct.id}`, selectedProduct);
      const res = await api.get('/list');
      setProducts(res.data.products || []);
      
      if (typeof setMessages === 'function') {
        setMessages(prev => [...prev, { id: Date.now(), text: "Ürün bilgileri başarıyla güncellendi.", sender: 'bot' }]);
      }
    } catch (e) {
      setError("Bilgiler güncellenirken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await api.delete(`/delete-confirm/${selectedProduct.id}`);
      
      const res = await api.get('/list');
      if (setProducts) setProducts(res.data.products || []);

      if (typeof setMessages === 'function') {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: `"${selectedProduct.product_name}" ürünü dükkandan kaldırıldı.`, 
          sender: 'bot' 
        }]);
      }

      setSelectedProduct(null);
      setDeleteConfirm(false);
      
    } catch (e) {
      setError("Ürün silinemedi, lütfen bağlantınızı kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} className="w-1/2 h-full bg-[#0a0a0a] border-l border-gray-800 flex flex-col z-20">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#131314]">
        <div className="flex items-center gap-2">
          {selectedProduct && (
            <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-800 rounded-full text-blue-400">
              <ChevronLeft size={20}/>
            </button>
          )}
          <h2 className="text-blue-400 font-bold uppercase text-[11px] tracking-widest">
            {selectedProduct ? "Ürün Detayı" : "Dükkan Listesi"}
          </h2>
        </div>
        <button onClick={closePanel} className="p-2 hover:bg-gray-800 rounded-full text-gray-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {activeAction === 'product-add' && (
          <ProductAddView 
            analysisData={analysisData} 
            setAnalysisData={setAnalysisData} 
            setProducts={setProducts}
            setMessages={setMessages}
            setActiveAction={setActiveAction}
          />
        )}

        {activeAction === 'product-list' && (
          selectedProduct ? (
            <div className="space-y-6">
              <div className="w-full h-64 bg-[#131314] rounded-2xl border border-gray-800 overflow-hidden flex items-center justify-center p-2">
                <img src={`http://127.0.0.1:8000/${selectedProduct.image_path}`} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="ürün"/>
              </div>
              
              <div className="bg-[#1e1f20] p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
                <div>
                  <label className="text-[10px] font-bold text-blue-500 uppercase ml-1">Ürün Adı</label>
                  <input value={selectedProduct.product_name} onChange={e => setSelectedProduct({...selectedProduct, product_name: e.target.value})} className="w-full bg-[#131314] p-3 rounded-xl border border-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-500 uppercase ml-1">Fiyat (TL)</label>
                  <input value={selectedProduct.price} onChange={e => setSelectedProduct({...selectedProduct, price: e.target.value})} className="w-full bg-[#131314] p-3 rounded-xl border border-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-500 uppercase ml-1">Açıklama</label>
                  <textarea rows="3" value={selectedProduct.description} onChange={e => setSelectedProduct({...selectedProduct, description: e.target.value})} className="w-full bg-[#131314] p-3 rounded-xl border border-gray-800 text-white resize-none text-sm mt-1" />
                </div>
                
                <AnimatePresence mode="wait">
                  {!deleteConfirm ? (
                    <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 pt-2">
                      <button onClick={handleUpdate} disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50">
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Güncelle
                      </button>
                      <button onClick={() => setDeleteConfirm(true)} className="p-4 bg-red-900/20 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={20}/>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-4 bg-red-900/10 border border-red-500/30 rounded-xl space-y-4">
                      <p className="text-sm text-red-400 text-center font-medium">Bu ürünü silmek istediğinize emin misiniz?</p>
                      <div className="flex gap-2">
                        <button onClick={confirmDelete} disabled={isLoading} className="flex-1 bg-red-600 hover:bg-red-500 p-3 rounded-lg font-bold text-sm transition-all">
                          {isLoading ? "Siliyor..." : "Evet, Sil"}
                        </button>
                        <button onClick={() => setDeleteConfirm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg font-bold text-sm transition-all">
                          Vazgeç
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-20 text-gray-600 italic font-medium">Dükkanda henüz ürün bulunmuyor.</div>
              ) : (
                products.map(p => (
                  <motion.div 
                    key={p.id} 
                    layout
                    onClick={() => setSelectedProduct(p)} 
                    className="bg-[#1e1f20] p-4 rounded-xl border border-gray-800 flex gap-4 cursor-pointer hover:border-blue-500 transition-all group"
                  >
                    <img src={`http://127.0.0.1:8000/${p.image_path}`} className="w-16 h-16 object-cover rounded-lg border border-gray-700" alt="thumb" />
                    <div className="flex-1">
                      <h3 className="font-bold group-hover:text-blue-400 transition-colors">{p.product_name}</h3>
                      <p className="text-blue-400 text-sm font-bold">{p.price} TL</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )
        )}
      </div>
    </motion.aside>
  );
};

export default ActionPanel;