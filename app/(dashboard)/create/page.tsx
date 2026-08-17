'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function CreateSamplePage() {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('ROMAN');
  const [ukuran, setUkuran] = useState('');
  const [stok, setStok] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validasi data
    if (!name || !ukuran || !stok) {
      alert("Mohon lengkapi semua field!");
      setIsSaving(false);
      return;
    }

    // Insert ke database
    const { error } = await supabase
      .from('samples')
      .insert([
        { 
          name, 
          brand, 
          ukuran, 
          stok: parseInt(stok),
          keterangan: keterangan || '-' 
        }
      ]);

    if (error) {
      alert("Gagal menyimpan ke database: " + error.message);
    } else {
      alert("Sampel berhasil ditambahkan!");
      router.push('/dashboard/samples');
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tambah Sampel Baru</h1>
        <Link href="/dashboard/samples" className="text-slate-500 hover:text-black font-medium">
          &larr; Kembali
        </Link>
      </div>

      <form onSubmit={handleSimpan} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama / Seri Sampel</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23] focus:outline-none" 
              placeholder="Contoh: Marble Carrara"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
            <select 
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23] focus:outline-none bg-white"
            >
              <option value="ROMAN">ROMAN</option>
              <option value="QUADRA">QUADRA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran</label>
            <input 
              type="text" 
              required 
              value={ukuran}
              onChange={(e) => setUkuran(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23] focus:outline-none" 
              placeholder="Contoh: 60x60"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Stok Awal</label>
            <input 
              type="number" 
              required 
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23] focus:outline-none" 
              placeholder="0"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan (Opsional)</label>
            <textarea 
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23] focus:outline-none" 
              placeholder="Catatan tambahan..."
            />
          </div>
        </div>

        <div className="mt-8">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="w-full bg-[#E31B23] text-white py-4 rounded-lg font-bold hover:bg-[#c9141b] transition shadow-md"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Sampel'}
          </button>
        </div>
      </form>
    </div>
  );
}