'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client'; 

export default function SamplesListPage() {
  const [activeBrand, setActiveBrand] = useState('ROMAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchSamples = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('samples')
        .select('*')
        .eq('brand', activeBrand);
      
      if (data) {
        setSamples(data);
      }
      setLoading(false);
    };

    fetchSamples();
  }, [activeBrand]);

  const filteredSamples = samples.filter((item) => {
    const namaSampel = item.name || item.nama_sampel || item.seri || '';
    return namaSampel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Sampel</h1>
        </div>
        <Link href="/dashboard/samples/create">
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-black transition shadow-sm">
            + Tambah Sampel
          </button>
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveBrand('ROMAN')}
          className={`w-36 h-36 border-2 rounded-2xl flex items-center justify-center p-3 transition-all ${
            activeBrand === 'ROMAN' ? 'border-[#E31B23] bg-red-50/50 shadow-md ring-4 ring-red-100' : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
          }`}
        >
          <img src="/roman.png" alt="Logo Roman" className="w-full h-full object-contain" />
        </button>

        <button 
          onClick={() => setActiveBrand('QUADRA')}
          className={`w-36 h-36 border-2 rounded-2xl flex items-center justify-center p-3 transition-all ${
            activeBrand === 'QUADRA' ? 'border-slate-900 bg-slate-100 shadow-md ring-4 ring-slate-200' : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
          }`}
        >
          <img src="/quadra.png" alt="Logo Quadra" className="w-full h-full object-contain" />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="font-semibold text-slate-700">Menampilkan Data: <span className="text-black font-bold">{activeBrand}</span></h2>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Cari nama / seri sampel..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23] transition-all"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4 font-semibold rounded-tl-lg">Nama / Seri</th>
                <th className="py-3 px-4 font-semibold">Ukuran</th>
                <th className="py-3 px-4 font-semibold">Jumlah / Stok</th>
                <th className="py-3 px-4 font-semibold rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 animate-pulse">Memuat data inventaris...</td>
                </tr>
              ) : filteredSamples.length > 0 ? (
                filteredSamples.map((item: any, index: number) => {
                  const currentStok = Number(item.stok) || 0;
                  const isHabis = currentStok === 0;

                  return (
                    <tr key={item.id || index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-900 font-medium">
                        {item.name || item.nama_sampel || item.seri || '-'}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {item.ukuran || item.size || '-'}
                      </td>
                      <td className="py-4 px-4 text-slate-900 font-bold">
                        {currentStok} <span className="text-xs text-slate-400 font-normal">PCS</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                          isHabis 
                            ? 'bg-red-100 text-[#E31B23] border-red-200' 
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {isHabis ? 'KOSONG' : 'TERSEDIA'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    {searchQuery 
                      ? `Tidak ada sampel yang cocok dengan pencarian "${searchQuery}"` 
                      : `Belum ada data sampel untuk brand ${activeBrand}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}