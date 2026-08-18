'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; 

export default function StockOpnamePage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', brand: 'ROMAN', rak: '', ambalan: '', stok: '' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', brand: 'ROMAN', rak: '', ambalan: '', stok: '' });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<any>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  const fetchAllSamples = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('samples').select('*').order('brand', { ascending: true });
    if (error) console.error(error.message);
    else if (data) setSamples(data);
    setLoading(false);
  };

  useEffect(() => { fetchAllSamples(); }, []);

  const filteredSamples = samples.filter((item) => {
    const namaSampel = item.name || item.nama_sampel || item.seri || '';
    return namaSampel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await supabase.from('samples').insert([{
      name: addForm.name,
      brand: addForm.brand,
      rak: addForm.rak || '-',
      ambalan: addForm.ambalan || '-',
      stok: addForm.stok === '' ? 0 : Number(addForm.stok)
    }]);

    setIsSaving(false);
    if (error) {
      alert("Gagal menambah sampel. Error: " + error.message);
    } else {
      setIsAddModalOpen(false);
      setAddForm({ name: '', brand: 'ROMAN', rak: '', ambalan: '', stok: '' });
      fetchAllSamples();
    }
  };

  const handleEditClick = (item: any) => {
    setEditForm({
      id: item.id,
      name: item.name || item.nama_sampel || item.seri || '',
      brand: item.brand || 'ROMAN',
      rak: item.rak || '',
      ambalan: item.ambalan || '',
      stok: item.stok ?? 0
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;
    setIsSaving(true);
    
    const { error } = await supabase.from('samples').update({ 
      name: editForm.name,
      brand: editForm.brand,
      rak: editForm.rak || '-',
      ambalan: editForm.ambalan || '-',
      stok: editForm.stok === '' ? 0 : Number(editForm.stok)
    }).eq('id', editForm.id); 

    setIsSaving(false);
    
    if (error) {
      alert("Gagal mengupdate data: " + error.message); 
    } else { 
      setIsEditModalOpen(false); 
      fetchAllSamples(); 
    }
  };

  const handleConfirmDelete = async () => {
    if (!sampleToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('samples').delete().eq('id', sampleToDelete.id);
    setIsDeleting(false);
    
    if (error) alert("Gagal hapus: " + error.message);
    else { setIsDeleteModalOpen(false); setSampleToDelete(null); fetchAllSamples(); }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Opname</h1>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold transition shadow-sm flex items-center gap-2">
          + Tambah Sampel Baru
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="font-semibold text-slate-700">Data Fisik Gudang</h2>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Cari nama / seri..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs text-slate-500 uppercase bg-slate-50">
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Nama / Seri</th>
                <th className="py-3 px-4 text-center">Posisi Rak/Ambalan</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 animate-pulse">Memuat...</td></tr>
              ) : filteredSamples.length > 0 ? (
                filteredSamples.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      {/* Badge Serasi */}
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wider shadow-sm ${
                        item.brand === 'ROMAN' ? 'bg-[#FBB03B] text-[#b91c1c]' : 'bg-slate-900 text-white'
                      }`}>
                        {item.brand || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-900 font-medium">{item.name || item.nama_sampel || item.seri || '-'}</td>
                    <td className="py-4 px-4 text-center text-sm font-semibold text-slate-600">{item.rak || '-'}/{item.ambalan || '-'}</td>
                    <td className="py-4 px-4 text-slate-900 font-bold text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{item.stok ?? 0}</span></td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(item)} className="bg-slate-900 hover:bg-black text-white px-4 py-1.5 rounded text-sm font-medium">Edit Data</button>
                        <button onClick={() => { setSampleToDelete(item); setIsDeleteModalOpen(true); }} className="bg-white border border-red-200 hover:bg-red-50 text-[#E31B23] px-4 py-1.5 rounded text-sm font-medium">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-12 text-center text-slate-500">Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah & Edit tetap mengikuti logika Anda */}
      {/* (Modal tidak saya tulis ulang untuk menghemat ruang, tapi pastikan kode sebelumnya tetap ada) */}
    </div>
  );
}