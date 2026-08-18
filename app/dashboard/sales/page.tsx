'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DataSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [inputNama, setInputNama] = useState('');
  const [inputBrand, setInputBrand] = useState('ROMAN');
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('nama', { ascending: true });
    
    if (error) console.error(error.message);
    else if (data) setSales(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleTambahBaru = () => {
    setEditingId(null);
    setInputNama('');
    setInputBrand('ROMAN');
    setIsModalOpen(true);
  };

  const handleEdit = (salesItem: any) => {
    setEditingId(salesItem.id);
    setInputNama(salesItem.nama);
    setInputBrand(salesItem.brand);
    setIsModalOpen(true);
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from('sales')
        .update({ nama: inputNama, brand: inputBrand })
        .eq('id', editingId);
      if (error) alert("GAGAL UPDATE: " + error.message);
      else setIsModalOpen(false);
    } else {
      const { error } = await supabase
        .from('sales')
        .insert([{ nama: inputNama, brand: inputBrand }]);
      if (error) alert("GAGAL SIMPAN: " + error.message);
      else setIsModalOpen(false);
    }

    setIsSaving(false);
    fetchSales(); 
  };

  const handleHapus = async (id: any, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus sales bernama ${nama}?`)) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) alert("GAGAL MENGHAPUS: " + error.message);
      else fetchSales();
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Sales</h1>
        </div>
        <button onClick={handleTambahBaru} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-black transition shadow-sm">
          + Tambah Sales
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 text-xs text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Nama Sales</th>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-8 text-center text-slate-500 animate-pulse">Memuat...</td></tr>
            ) : sales.length > 0 ? (
              sales.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4 font-medium text-slate-900">{s.nama}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wider shadow-sm ${
                      s.brand === 'ROMAN' ? 'bg-[#FBB03B] text-[#b91c1c]' : 'bg-slate-900 text-white'
                    }`}>
                      {s.brand}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Tombol Edit Data & Hapus disamakan seperti Stok Opname */}
                      <button onClick={() => handleEdit(s)} className="bg-slate-900 hover:bg-black text-white px-4 py-1.5 rounded text-sm font-medium">Edit Data</button>
                      <button onClick={() => handleHapus(s.id, s.nama)} className="bg-white border border-red-200 hover:bg-red-50 text-[#E31B23] px-4 py-1.5 rounded text-sm font-medium">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="py-12 text-center text-slate-500">Belum ada data sales.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingId ? 'Edit Data Sales' : 'Tambah Sales Baru'}</h3>
            <form onSubmit={handleSimpan}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input type="text" value={inputNama} onChange={(e) => setInputNama(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23] outline-none" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Brand</label>
                <select value={inputBrand} onChange={(e) => setInputBrand(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#E31B23] outline-none">
                  <option value="ROMAN">ROMAN</option>
                  <option value="QUADRA">QUADRA</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9141b] text-white rounded-lg font-bold">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}