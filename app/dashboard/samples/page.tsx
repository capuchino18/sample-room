'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SamplesCatalogPage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchSamples = async () => {
      const { data } = await supabase.from('samples').select('*').order('brand', { ascending: true });
      if (data) setSamples(data);
      setLoading(false);
    };
    fetchSamples();
  }, []);

  const filteredSamples = samples.filter(item => {
    const namaSampel = item.name || item.nama_sampel || item.seri || '';
    const matchSearch = namaSampel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBrand = selectedBrand ? item.brand === selectedBrand : true;
    return matchSearch && matchBrand;
  });

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Daftar Sampel</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        
        {/* Tombol Pilihan Brand (Foto PNG) */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-6">
            
            <button 
              onClick={() => setSelectedBrand('ROMAN')}
              className={`rounded-2xl border-2 transition p-4 w-44 h-36 bg-white flex items-center justify-center shadow-sm ${
                selectedBrand === 'ROMAN' ? 'border-slate-900 ring-2 ring-slate-200 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src="/roman.png" alt="Roman" className="max-h-full max-w-full object-contain" />
            </button>

            <button 
              onClick={() => setSelectedBrand('QUADRA')}
              className={`rounded-2xl border-2 transition p-4 w-44 h-36 bg-white flex items-center justify-center shadow-sm ${
                selectedBrand === 'QUADRA' ? 'border-slate-900 ring-2 ring-slate-200 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src="/quadra.png" alt="Quadra" className="max-h-full max-w-full object-contain" />
            </button>

            {selectedBrand && (
              <button 
                onClick={() => setSelectedBrand(null)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition self-center"
              >
                ✕ Tampilkan Semua
              </button>
            )}
          </div>
        </div>

        {/* Input Pencarian */}
        <input 
          type="text" 
          placeholder="Cari nama / seri sampel..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 px-4 py-3 mb-6 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23] outline-none"
        />

        {/* Grid Katalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-500 animate-pulse">Memuat katalog...</div>
          ) : filteredSamples.length > 0 ? (
            filteredSamples.map((item) => {
              const ketersediaan = (item.stok || 0) > 0;
              return (
                <div key={item.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      {/* Badge Simpel & Elegan */}
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wider shadow-sm ${
                        item.brand === 'ROMAN' ? 'bg-[#FBB03B] text-[#b91c1c]' : 'bg-slate-900 text-white'
                      }`}>
                        {item.brand}
                      </span>
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${ketersediaan ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {ketersediaan ? 'Tersedia' : 'Kosong'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">{item.name || item.nama_sampel || '-'}</h3>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">POSISI RAK/AMBALAN</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{item.rak || '-'}/{item.ambalan || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">STOK FISIK</p>
                      <p className={`text-xl font-black mt-0.5 ${ketersediaan ? 'text-slate-900' : 'text-slate-300'}`}>{item.stok ?? 0}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">Sampel tidak ditemukan.</div>
          )}
        </div>
      </div>
    </div>
  );
}