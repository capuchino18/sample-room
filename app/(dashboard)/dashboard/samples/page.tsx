'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Sample = {
  id: string;
  name: string;
  brand: string;
  series: string;
  size: string;
  lifecycle_status: string;
};

export default function SamplesListPage() {
  const supabase = createClient();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk memisahkan tampilan brand (Default: 'ROMAN')
  const [activeBrand, setActiveBrand] = useState<'ROMAN' | 'QUADRA'>('ROMAN');

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('samples')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal memuat sampel:', error.message);
    } else {
      setSamples(data || []);
    }
    setLoading(false);
  };

  // Filter data berdasarkan brand yang sedang diklik
  const displayedSamples = samples.filter((item) => item.brand === activeBrand);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Sampel Keramik</h1>
          <p className="text-sm text-slate-500">Pilih brand untuk melihat inventaris</p>
        </div>
        <Link 
          href="/dashboard/samples/create" 
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          + Tambah Sampel
        </Link>
      </div>

      {/* Tiga Tombol Filter Logo (ROMAN & QUADRA) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Tombol ROMAN */}
        <button
          onClick={() => setActiveBrand('ROMAN')}
          className={`relative h-28 rounded-xl border-2 flex flex-col items-center justify-center transition-all overflow-hidden bg-white ${
            activeBrand === 'ROMAN' 
              ? 'border-blue-600 shadow-md ring-4 ring-blue-50' 
              : 'border-slate-200 hover:border-blue-300 opacity-70 hover:opacity-100'
          }`}
        >
          {/* Ganti src dengan path logo Roman Anda */}
          <img src="/roman.png" alt="Roman Logo" className="h-12 object-contain mb-2" />
          <span className={`text-sm font-bold tracking-widest ${activeBrand === 'ROMAN' ? 'text-blue-700' : 'text-slate-500'}`}>
            ROMAN
          </span>
        </button>

        {/* Tombol QUADRA */}
        <button
          onClick={() => setActiveBrand('QUADRA')}
          className={`relative h-28 rounded-xl border-2 flex flex-col items-center justify-center transition-all overflow-hidden bg-white ${
            activeBrand === 'QUADRA' 
              ? 'border-amber-500 shadow-md ring-4 ring-amber-50' 
              : 'border-slate-200 hover:border-amber-300 opacity-70 hover:opacity-100'
          }`}
        >
          {/* Ganti src dengan path logo Quadra Anda */}
          <img src="/quadra.png" alt="Quadra Logo" className="h-10 object-contain mb-2" />
          <span className={`text-sm font-bold tracking-widest ${activeBrand === 'QUADRA' ? 'text-amber-700' : 'text-slate-500'}`}>
            QUADRA
          </span>
        </button>
      </div>

      {/* Tabel Data yang Sudah Terfilter */}
      {loading ? (
        <p className="text-slate-500 text-center py-10">Memuat data dari database...</p>
      ) : displayedSamples.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-slate-600 mb-2">Belum ada data sampel untuk brand <strong>{activeBrand}</strong>.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700">Menampilkan Data: {activeBrand}</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-4">Nama / Seri</th>
                <th className="p-4">Ukuran</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedSamples.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-800 font-medium">
                    <Link href={`/dashboard/samples/${item.id}`} className="hover:text-blue-600 hover:underline">
                      {item.name}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-600">{item.size || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.lifecycle_status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      item.lifecycle_status === 'IN_USE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      item.lifecycle_status === 'DRAFT' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {item.lifecycle_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}