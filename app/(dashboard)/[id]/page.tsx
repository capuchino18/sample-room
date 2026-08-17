'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [sample, setSample] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // PROTEKSI: Jika ID adalah 'dashboard', arahkan kembali ke dashboard utama atau batalkan
    if (!id || id === 'dashboard') {
      setLoading(false);
      return;
    }

    const fetchSampleDetail = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Gagal memuat detail:', error.message);
      } else {
        setSample(data);
      }
      setLoading(false);
    };

    fetchSampleDetail();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;
  
  // Jika ID-nya 'dashboard' atau sampel tidak ditemukan, tampilkan pesan ringan
  if (!sample && id !== 'dashboard') {
    return <div className="p-10 text-center text-red-500">Sampel tidak ditemukan.</div>;
  }

  // Jika user secara tidak sengaja masuk ke rute [id] ini tanpa ID valid (misal lewat dashboard), 
  // kita cukup tampilkan layout kosong atau redirect.
  if (id === 'dashboard') return null;

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="mb-6 text-slate-500 hover:text-black font-medium">
        &larr; Kembali
      </button>
      
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{sample.name || sample.nama_sampel || sample.seri}</h1>
        <p className="text-slate-500 mb-6 font-medium uppercase tracking-wider">{sample.brand}</p>
        
        <div className="grid grid-cols-2 gap-6 border-t pt-6">
          <div>
            <p className="text-xs text-slate-400 uppercase">Ukuran</p>
            <p className="font-bold text-lg">{sample.ukuran || sample.size || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Stok Saat Ini</p>
            <p className="font-bold text-lg text-[#E31B23]">{sample.stok || 0} PCS</p>
          </div>
        </div>
      </div>
    </div>
  );
}