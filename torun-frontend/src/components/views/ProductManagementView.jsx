import React, { useState } from 'react';
import { Package, Calendar, Eye, EyeOff } from 'lucide-react';

const ProductManagementView = ({ products }) => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Package className="text-blue-500" /> Ürün Yönetimi
      </h2>
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#1e1f20]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2b2c2e] text-gray-400 text-xs uppercase tracking-widest font-bold">
              <th className="p-4">Ürün</th>
              <th className="p-4">İlan Tarihi</th>
              <th className="p-4">Fiyat</th>
              <th className="p-4">Durum</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#131314] rounded-lg overflow-hidden border border-gray-700">
                    <img src={`http://127.0.0.1:8000/${product.image_path}`} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium text-gray-200">{product.product_name}</span>
                </td>
                <td className="p-4 text-sm text-gray-500 font-mono">14 Mayıs 2026</td>
                <td className="p-4 font-bold text-blue-400">{product.price}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">Satışta</span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-all">
                    <EyeOff size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ProductManagementView;