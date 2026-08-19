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
      const { data } = await supabase.from('samples').select('*').order('name', { ascending: true });
      if (data) setSamples(data);
      setLoading(false);
    };
    fetchSamples();
  }, []);

  const filteredSamples = samples.filter(item => {
    if (item.brand !== selectedBrand) return false;
    const searchString = `${item.name || item.nama_sampel || item.seri || ''} ${item.kode_produk || ''} ${item.tipe_produk || ''}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto min-h-[80vh]">
      
      {!selectedBrand ? (
        <div className="flex flex-col items-center justify-center h-full pt-12 md:pt-24">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-12">Pilih Katalog</h1>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <button 
              onClick={() => { setSelectedBrand('ROMAN'); setSearchQuery(''); }}
              className="rounded-3xl border-2 border-slate-200 hover:border-[#FBB03B] hover:shadow-lg transition-all p-8 w-64 h-56 bg-white flex items-center justify-center group"
            >
              <img src="/roman.png" alt="Roman" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
            </button>

            <button 
              onClick={() => { setSelectedBrand('QUADRA'); setSearchQuery(''); }}
              className="rounded-3xl border-2 border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all p-8 w-64 h-56 bg-white flex items-center justify-center group"
            >
              <img src="/quadra.png" alt="Quadra" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-slate-900 uppercase">KATALOG {selectedBrand}</h1>
            <button 
              onClick={() => setSelectedBrand(null)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition shadow-sm"
            >
              ← Kembali
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <input 
              type="text" 
              placeholder={`Cari sampel ${selectedBrand}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 px-4 py-3 mb-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23] outline-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading ? (
                <div className="col-span-full py-12 text-center text-slate-500 animate-pulse">Memuat...</div>
              ) : filteredSamples.length > 0 ? (
                filteredSamples.map((item) => (
                  <div key={item.id} className={`bg-white border ${item.is_discontinue ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex flex-wrap gap-2 items-center">
                          {item.is_discontinue && (
                            <span className="px-3 py-1 bg-red-100 text-[#E31B23] border border-red-200 rounded-md text-[10px] font-black uppercase tracking-wider">
                              Discontinue
                            </span>
                          )}
                          {item.brand === 'ROMAN' && item.tipe_produk && (
                            <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold tracking-wider">
                              {item.tipe_produk}
                            </span>
                          )}
                        </div>
                        <div className="flex items-start">
                          {(item.stok > 0) ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">Tersedia</span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-bold">Habis</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4 mt-2">
                        <h3 className="text-xl font-black text-slate-900 uppercase">
                          {item.name || item.nama_sampel || item.seri || '-'}
                        </h3>
                        {item.brand === 'ROMAN' && item.kode_produk && (
                          <p className="text-sm text-slate-500 mt-1 font-medium">{item.kode_produk}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <hr className="border-slate-100 mb-4" />
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Posisi Rak/Ambalan</p>
                          <p className="text-lg font-black text-slate-900">{item.rak || '-'}/{item.ambalan || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stok Fisik</p>
                          <p className="text-3xl font-black text-slate-900">{item.stok ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-500">Tidak ada sampel ditemukan.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}