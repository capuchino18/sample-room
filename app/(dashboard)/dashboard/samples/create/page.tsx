'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CreateSamplePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'ROMAN',
    series: '',
    size: '',
    color: '',
    rack_number: '',
    shelf_number: '',
  });

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('samples').insert([
      {
        name: formData.name || 'Draft Sampel Tanpa Nama',
        brand: formData.brand,
        series: formData.series,
        size: formData.size,
        color: formData.color,
        rack_number: formData.rack_number,
        shelf_number: formData.shelf_number,
        lifecycle_status: 'DRAFT',
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Gagal menyimpan draft: ' + error.message);
    } else {
      alert('Sampel & lokasi rak berhasil disimpan!');
      router.push('/dashboard/samples');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-xs border border-slate-200">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Input Sampel & Lokasi Rak</h2>
      <form onSubmit={handleSaveDraft} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Brand</label>
          <select 
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
          >
            <option value="ROMAN">ROMAN</option>
            <option value="QUADRA">QUADRA</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Nama Sampel / Seri</label>
          <input 
            type="text" 
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
            placeholder="Contoh: Marble White Luxury"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Ukuran</label>
            <input 
              type="text" 
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="Contoh: 60x60 cm"
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Warna</label>
            <input 
              type="text" 
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="Contoh: Putih"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
            />
          </div>
        </div>

        {/* Input Manual Lokasi Rak & Tingkat */}
        <div className="border-t border-slate-200 pt-4 mt-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Lokasi Rak Penyimpanan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">No. Rak</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Contoh: Rak 01"
                value={formData.rack_number}
                onChange={(e) => setFormData({...formData, rack_number: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">No. Tingkat / Ambalan</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Contoh: Tingkat 3"
                value={formData.shelf_number}
                onChange={(e) => setFormData({...formData, shelf_number: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Sampel & Lokasi'}
          </button>
        </div>
      </form>
    </div>
  );
}