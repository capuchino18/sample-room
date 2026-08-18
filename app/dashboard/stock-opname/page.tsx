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

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Tambah Sampel Baru</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Nama / Seri <span className="text-red-500">*</span></label>
                  <input type="text" required value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} placeholder="Contoh: AGATA CIELO" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Brand</label>
                  <select value={addForm.brand} onChange={(e) => setAddForm({...addForm, brand: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#E31B23]">
                    <option value="ROMAN">ROMAN</option>
                    <option value="QUADRA">QUADRA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nomor Rak <span className="text-red-500">*</span></label>
                  <input type="text" required placeholder="Contoh: A" value={addForm.rak} onChange={(e) => setAddForm({...addForm, rak: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ambalan Ke- <span className="text-xs text-slate-400 font-normal">(Opsional)</span></label>
                  <input type="text" placeholder="Boleh kosong" value={addForm.ambalan} onChange={(e) => setAddForm({...addForm, ambalan: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div className="col-span-2 mb-2">
                  <label className="block text-sm font-semibold mb-1">Stok Awal <span className="text-xs text-slate-400 font-normal">(Kosongkan jika 0)</span></label>
                  <input type="number" placeholder="0" value={addForm.stok} onChange={(e) => setAddForm({...addForm, stok: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold">{isSaving ? 'Menyimpan...' : 'Simpan Sampel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Data Sampel</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Nama / Seri</label>
                  <input type="text" required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Brand</label>
                  <select value={editForm.brand} onChange={(e) => setEditForm({...editForm, brand: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#E31B23]">
                    <option value="ROMAN">ROMAN</option>
                    <option value="QUADRA">QUADRA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nomor Rak</label>
                  <input type="text" required value={editForm.rak} onChange={(e) => setEditForm({...editForm, rak: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ambalan Ke-</label>
                  <input type="text" value={editForm.ambalan} onChange={(e) => setEditForm({...editForm, ambalan: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div className="col-span-2 mb-2">
                  <label className="block text-sm font-semibold mb-1">Stok Saat Ini</label>
                  <input type="number" min="0" value={editForm.stok} onChange={(e) => setEditForm({...editForm, stok: e.target.value})} className="w-full px-4 py-2 text-lg font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9141b] text-white rounded-lg font-bold">{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && sampleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Hapus Sampel?</h3>
            <p className="text-sm text-slate-500 mb-4">Anda yakin ingin menghapus data <span className="font-bold text-slate-900">{sampleToDelete.name || sampleToDelete.nama_sampel}</span> secara permanen?</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 bg-[#E31B23] text-white rounded-lg font-bold">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}