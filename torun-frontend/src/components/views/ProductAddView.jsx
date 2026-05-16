import React, { useState, useRef } from 'react';
import api from '../../api/axios';
import { Loader2, PackageCheck, UploadCloud } from 'lucide-react';

const ProductAddView = ({ analysisData, setAnalysisData, setProducts, setMessages, setActiveAction }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisData(res.data);
    } catch (err) {
      alert("Fotoğraf analiz edilemedi amca.");
      setPreviewImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };


const handleAddToShop = async () => {
  if (!analysisData || isSaving) return;
  
  setIsSaving(true);
  try {
    await api.post('/confirm', analysisData);
    
    const res = await api.get('/list');
    if (setProducts) setProducts(res.data.products || []);
    
    setAnalysisData(null);
    if (setPreviewImage) setPreviewImage(null);

    if (typeof setMessages === 'function') {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Hayırlı olsun amca, ürünü dükkana ekledim.", 
        sender: 'bot' 
      }]);
    }

    if (setActiveAction) {
      setActiveAction('product-list');
    }

  } catch (error) {
    console.error("Hata:", error);
    alert("Dükkana eklerken bir sorun çıktı amca.");
  } finally {
    setIsSaving(false);
  }
};
  if (!analysisData) {
    return (
      <div 
        onClick={() => !isAnalyzing && fileInputRef.current.click()}
        className={`relative w-full h-80 border-2 border-dashed rounded-3xl overflow-hidden transition-all flex flex-col items-center justify-center 
          ${isAnalyzing ? 'border-blue-500' : 'border-gray-800 hover:border-blue-500 hover:bg-blue-500/5 cursor-pointer'}`}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        {isAnalyzing ? (
          <>
            <img src={previewImage} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="onizleme" />
            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <Loader2 className="animate-spin mb-4 text-blue-400" size={48} />
              <p className="font-bold text-white text-lg">Torun fotoğrafı inceliyor...</p>
            </div>
          </>
        ) : (
          <>
            <UploadCloud size={48} className="mb-4 text-gray-600" />
            <p className="font-bold text-lg text-gray-400">Ürün Fotoğrafı Yükle</p>
            <p className="text-sm text-gray-500">Tıkla ve bir resim seç amca.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
        <img src={`http://127.0.0.1:8000/${analysisData.image_path}`} className="w-full h-64 object-contain bg-[#131314] p-2" alt="ürün" />
      </div>
      <div className="bg-[#1e1f20] p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
        <input value={analysisData.product_name} onChange={e => setAnalysisData({...analysisData, product_name: e.target.value})} className="w-full bg-[#131314] p-3 rounded-xl border border-gray-800 text-white" />
        <input value={analysisData.price} onChange={e => setAnalysisData({...analysisData, price: e.target.value})} className="w-full bg-[#131314] p-3 rounded-xl border border-gray-800 text-white" />
        <textarea rows="3" value={analysisData.description} onChange={e => setAnalysisData({...analysisData, description: e.target.value})} className="w-full bg-[#131314] p-3 rounded-xl border border-gray-800 text-white resize-none text-sm" />
        <button onClick={handleAddToShop} disabled={isSaving} className="w-full p-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          {isSaving ? <Loader2 className="animate-spin" size={20}/> : <PackageCheck size={20}/>}
          {isSaving ? "Dükkana Ekleniyor..." : "Dükkana Ekle"}
        </button>
      </div>
    </div>
  );
};

export default ProductAddView;