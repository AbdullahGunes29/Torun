import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Package, Trash2, Save, Loader2, X, Plus, Image as ImageIcon, Upload, AlertTriangle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductManagementView = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null); 
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState(null); 

  const [newProduct, setNewProduct] = useState({
    product_name: '',
    price: '',
    description: '',
    image: null
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/list');
      setProducts(res.data.products || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  
  useEffect(() => { setError(null); setDeleteConfirm(false); }, [selected, isAddPanelOpen]);

  const openAddPanel = () => { setSelected(null); setIsAddPanelOpen(true); };
  const openEditPanel = (p) => { setIsAddPanelOpen(false); setSelected(p); };


  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setIsActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('product_name', newProduct.product_name);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      if (newProduct.image) formData.append('file', newProduct.image); 

      await api.post('/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchProducts(); 
      setIsAddPanelOpen(false); 
      setNewProduct({ product_name: '', price: '', description: '', image: null });
    } catch (err) {
      setError("Ürün eklenemedi!");
    } finally { setIsActionLoading(false); }
  };
  const handleUpdate = async () => {
    setError(null);
    setIsActionLoading(true);
    try {
      await api.put(`/update/${selected.id}`, selected);
      await fetchProducts();
      setSelected(null);
    } catch (e) {
      setError("Güncellenemedi amca.");
    } finally { setIsActionLoading(false); }
  };

  const confirmDelete = async () => {
    setError(null);
    setIsActionLoading(true);
    try {
      await api.delete(`/delete-confirm/${selected.id}`);
      await fetchProducts();
      setSelected(null);
    } catch (e) {
      setError("Silinemedi amca.");
    } finally { setIsActionLoading(false); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={40}/></div>;

  return (
    <div className="flex-1 flex h-full overflow-hidden animate-in fade-in">
      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-2xl text-purple-400"><Package size={30} /></div>
            <h2 className="text-4xl font-bold">Ürün Yönetimi</h2>
          </div>
          <button onClick={openAddPanel} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95">
            <Plus size={20} /> Yeni Ürün
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <motion.div key={p.id} layout onClick={() => openEditPanel(p)} className={`bg-[#1e1f20] p-4 rounded-3xl border transition-all cursor-pointer group shadow-xl ${selected?.id === p.id ? 'border-blue-500' : 'border-gray-800'}`}>
              <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-[#131314]">
                <img src={`http://127.0.0.1:8000/${p.image_path}`} className="w-full h-full object-contain" alt="ürün" />
              </div>
              <h3 className="font-bold text-lg truncate group-hover:text-blue-400">{p.product_name}</h3>
              <p className="text-blue-400 font-black mt-1">{p.price} TL</p>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {(isAddPanelOpen || selected) && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="w-112.5 bg-[#0a0a0a] border-l border-gray-800 flex flex-col z-20 shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#131314]">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold uppercase text-[11px] tracking-widest">
                  {isAddPanelOpen ? "Yeni Ürün Ekle" : "Ürün Detayı"}
                </span>
              </div>
              <button onClick={() => { setIsAddPanelOpen(false); setSelected(null); }} className="p-2 hover:bg-gray-800 rounded-full text-gray-500"><X size={20} /></button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle size={18} /> {error}
                </div>
              )}

              {isAddPanelOpen ? (
                <div className="space-y-6">
                   <div className="relative aspect-video bg-[#131314] rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500 transition-all">
                      {newProduct.image ? <img src={URL.createObjectURL(newProduct.image)} className="w-full h-full object-contain" /> : <><Upload className="text-gray-600 mb-2" size={30}/><span className="text-xs text-gray-600">Görsel Yükle</span></>}
                      <input type="file" onChange={e => setNewProduct({...newProduct, image: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   <div className="space-y-4">
                      <input placeholder="Ürün Adı" value={newProduct.product_name} onChange={e => setNewProduct({...newProduct, product_name: e.target.value})} className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white focus:border-blue-500 outline-none" />
                      <input placeholder="Fiyat" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white focus:border-blue-500 outline-none" />
                      <textarea rows="4" placeholder="Açıklama" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white resize-none focus:border-blue-500 outline-none" />
                   </div>
                   <button onClick={handleCreate} disabled={isActionLoading} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition-all shadow-lg">
                      {isActionLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Ürünü Kaydet
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-full h-64 bg-[#131314] rounded-2xl border border-gray-800 overflow-hidden flex items-center justify-center p-2">
                    <img src={`http://127.0.0.1:8000/${selected.image_path}`} className="max-w-full max-h-full object-contain rounded-xl" alt="ürün"/>
                  </div>
                  <div className="space-y-4">
                    <input value={selected.product_name} onChange={e => setSelected({...selected, product_name: e.target.value})} className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white focus:border-blue-500 outline-none" />
                    <input value={selected.price} onChange={e => setSelected({...selected, price: e.target.value})} className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white focus:border-blue-500 outline-none" />
                    <textarea rows="4" value={selected.description} onChange={e => setSelected({...selected, description: e.target.value})} className="w-full bg-[#131314] p-4 rounded-2xl border border-gray-800 text-white resize-none focus:border-blue-500 outline-none" />
                  </div>
                  <div className="pt-4">
                    {!deleteConfirm ? (
                      <div className="flex gap-3">
                        <button onClick={handleUpdate} disabled={isActionLoading} className="flex-1 bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white">
                          {isActionLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Güncelle
                        </button>
                        <button onClick={() => setDeleteConfirm(true)} className="p-4 bg-red-900/20 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={24}/></button>
                      </div>
                    ) : (
                      <div className="p-5 bg-red-900/10 border border-red-500/30 rounded-2xl space-y-4">
                        <p className="text-sm text-red-400 text-center font-medium">Bu ürünü silmek istiyor musun amca?</p>
                        <div className="flex gap-2">
                          <button onClick={confirmDelete} disabled={isActionLoading} className="flex-1 bg-red-600 p-3 rounded-xl font-bold text-sm text-white">Sil</button>
                          <button onClick={() => setDeleteConfirm(false)} className="flex-1 bg-gray-800 p-3 rounded-xl font-bold text-sm text-white">Vazgeç</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagementView;