'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Requester = {
  id: string;
  name: string;
  department: string;
};

export default function RequestersPage() {
  const supabase = createClient();
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk form tambah
  const [formData, setFormData] = useState({ name: '', department: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequesters();
  }, []);

  const fetchRequesters = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('requesters')
      .select('*')
      .order('name', { ascending: true });

    if (!error) setRequesters(data || []);
    setLoading(false);
  };

  const handleAddRequester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Nama tidak boleh kosong');
    
    setIsSubmitting(true);
    const { error } = await supabase
      .from('requesters')
      .insert([{ name: formData.name, department: formData.department }]);
      
    setIsSubmitting(false);
    
    if (error) {
      alert('Gagal menambah data: ' + error.message);
    } else {
      setFormData({ name: '', department: '' }); // Reset form
      fetchRequesters(); // Refresh data
    }
  };

  // Fungsi untuk MENGHAPUS karyawan
  const handleDeleteRequester = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus "${name}" dari daftar? (Histori peminjaman lama tidak akan hilang)`);
    
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('requesters')
      .delete()
      .eq('id', id);
      
    if (error) {
      alert('Gagal menghapus data: ' + error.message);
    } else {
      fetchRequesters();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Kolom Kiri: Form Tambah */}
      <div className="md:col-span-1">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tambah Karyawan</h2>
          <form onSubmit={handleAddRequester} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Contoh: Budi Santoso"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Departemen / Divisi</label>
              <input 
                type="text" 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Contoh: Sales Retail"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Daftar Karyawan */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Master Data Requesters</h2>
            <p className="text-xs text-slate-500">Kelola daftar staf/sales yang berwenang mengambil sampel.</p>
          </div>
          
          {loading ? (
            <p className="p-5 text-slate-500 text-sm">Memuat data...</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-600">
                <tr>
                  <th className="p-4">Nama</th>
                  <th className="p-4">Departemen</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {requesters.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-800">{req.name}</td>
                    <td className="p-4 text-slate-600">{req.department || '-'}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteRequester(req.id, req.name)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {requesters.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">Belum ada data karyawan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}