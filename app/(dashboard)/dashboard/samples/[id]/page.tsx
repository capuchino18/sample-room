'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type SampleDetail = {
  id: string;
  name: string;
  brand: string;
  series: string;
  size: string;
  color: string;
  rack_number: string;
  shelf_number: string;
  lifecycle_status: string;
  created_at: string;
};

export default function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const supabase = createClient();
  const [sample, setSample] = useState<SampleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSampleDetail();
  }, [id]);

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

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('samples')
      .update({ lifecycle_status: newStatus })
      .eq('id', id);

    setUpdating(false);
    if (!error) fetchSampleDetail();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat detail...</div>;
  if (!sample) return <div className="p-8 text-center text-red-500">Sampel tidak ditemukan.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-xs border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/samples" className="text-sm text-blue-600 hover:underline">&larr; Kembali</Link>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Status: {sample.lifecycle_status}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Brand</span>
          <h2 className="text-xl font-bold text-slate-800">{sample.brand}</h2>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Nama / Seri</span>
          <p className="text-lg text-slate-700 font-medium">{sample.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Ukuran</span>
            <p className="text-slate-700">{sample.size || '-'}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Warna</span>
            <p className="text-slate-700">{sample.color || '-'}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-2">Lokasi Rak</span>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400 text-xs block">Rak</span>
            <span className="font-semibold text-slate-800">{sample.rack_number || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Tingkat / Ambalan</span>
            <span className="font-semibold text-slate-800">{sample.shelf_number || '-'}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Input Aktivitas (Request/Supply)</h3>
        <div className="space-y-3">
          <select id="log_type" className="w-full p-2 border border-slate-300 rounded-lg text-sm">
            <option value="REQUEST">Request Sample (Keluar untuk Customer)</option>
            <option value="SUPPLY">Supply Baru (Masuk dari Pabrik)</option>
          </select>
          <input type="text" id="pic_name" placeholder="Nama Sales atau Staff" className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
          <button 
            onClick={async () => {
              const type = (document.getElementById('log_type') as HTMLSelectElement).value;
              const pic = (document.getElementById('pic_name') as HTMLInputElement).value;
              if (!pic) return alert('Nama Sales/Staff harus diisi!');
              
              setUpdating(true);
              await supabase.from('sample_logs').insert([{ sample_id: id, log_type: type, person_in_charge: pic }]);
              
              if (type === 'REQUEST') await handleUpdateStatus('IN_USE');
              if (type === 'SUPPLY') await handleUpdateStatus('ACTIVE');
              
              setUpdating(false);
              alert(`Aktivitas ${type} berhasil dicatat!`);
            }}
            disabled={updating}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {updating ? 'Memproses...' : 'Simpan Aktivitas'}
          </button>
        </div>
      </div>
    </div>
  );
}