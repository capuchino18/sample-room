'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; 

export default function StockOpnamePage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', brand: 'ROMAN', rak: '', ambalan: '', stok: '', tipe_produk: '', kode_produk: '' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', brand: 'ROMAN', rak: '', ambalan: '', stok: '', tipe_produk: '', kode_produk: '', is_discontinue: false });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<any>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  const fetchAllSamples = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('samples').select('*').order('name', { ascending: true });
    if (error) console.error(error.message);
    else if (data) setSamples(data);
    setLoading(false);
  };

  useEffect(() => { fetchAllSamples(); }, []);

  const filteredSamples = samples.filter((item) => {
    if (item.brand !== selectedBrand) return false;
    const searchString = `${item.name || item.nama_sampel || item.seri || ''} ${item.kode_produk || ''} ${item.tipe_produk || ''}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredSamples.length / ITEMS_PER_PAGE);
  const paginatedSamples = filteredSamples.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [selectedBrand, searchQuery]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await supabase.from('samples').insert([{
      name: addForm.name,
      brand: selectedBrand, 
      rak: addForm.rak || '-',
      ambalan: addForm.ambalan || '-',
      stok: addForm.stok === '' ? 0 : Number(addForm.stok),
      tipe_produk: selectedBrand === 'ROMAN' ? (addForm.tipe_produk || null) : null,
      kode_produk: selectedBrand === 'ROMAN' ? (addForm.kode_produk || null) : null,
      is_discontinue: false
    }]);

    setIsSaving(false);
    if (error) {
      alert("Gagal menambah sampel. Error: " + error.message);
    } else {
      setIsAddModalOpen(false);
      setAddForm({ name: '', brand: selectedBrand || 'ROMAN', rak: '', ambalan: '', stok: '', tipe_produk: '', kode_produk: '' });
      fetchAllSamples();
    }
  };

  const handleEditClick = (item: any) => {
    setEditForm({
      id: item.id,
      name: item.name || item.nama_sampel || item.seri || '',
      brand: item.brand || 'ROMAN',
      rak: item.rak === '-' ? '' : (item.rak || ''),
      ambalan: item.ambalan === '-' ? '' : (item.ambalan || ''),
      stok: item.stok ?? 0,
      tipe_produk: item.tipe_produk || '',
      kode_produk: item.kode_produk || '',
      is_discontinue: item.is_discontinue || false
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
      stok: editForm.stok === '' ? 0 : Number(editForm.stok),
      tipe_produk: editForm.brand === 'ROMAN' ? (editForm.tipe_produk || null) : null,
      kode_produk: editForm.brand === 'ROMAN' ? (editForm.kode_produk || null) : null,
      is_discontinue: editForm.is_discontinue
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
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto relative min-h-[80vh]">
      
      {!selectedBrand ? (
        <div className="flex flex-col items-center justify-center h-full pt-12 md:pt-24">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-12">Pilih Stok Brand</h1>
          
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
            <h1 className="text-2xl font-bold text-slate-900 uppercase">STOK OPNAME {selectedBrand}</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedBrand(null)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition shadow-sm"
              >
                ← Kembali
              </button>
              <button 
                onClick={() => {
                  setAddForm({ name: '', brand: selectedBrand, rak: '', ambalan: '', stok: '', tipe_produk: '', kode_produk: '' });
                  setIsAddModalOpen(true);
                }} 
                className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center gap-2"
              >
                + Tambah Sampel Baru
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="font-semibold text-slate-700">Data Fisik Gudang - {selectedBrand}</h2>
              <div className="relative w-full md:w-80">
                <input 
                  type="text" 
                  placeholder="Cari nama / kode / tipe..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs text-slate-500 uppercase bg-slate-50">
                    <th className="py-3 px-4">Nama / Seri / Detail</th>
                    <th className="py-3 px-4 text-center">Posisi Rak/Amb</th>
                    <th className="py-3 px-4 text-center">Stok</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-500 animate-pulse">Memuat...</td></tr>
                  ) : paginatedSamples.length > 0 ? (
                    paginatedSamples.map((item: any) => (
                      <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 ${item.is_discontinue ? 'bg-red-50/30' : ''}`}>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 font-bold">{item.name || item.nama_sampel || item.seri || '-'}</span>
                              {item.is_discontinue && (
                                <span className="px-2 py-0.5 bg-red-100 text-[#E31B23] border border-red-200 text-[10px] font-black rounded tracking-wider shadow-sm">
                                  DISCONTINUE
                                </span>
                              )}
                            </div>
                            
                            {item.brand === 'ROMAN' && (item.kode_produk || item.tipe_produk) && (
                              <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                {item.kode_produk && <span className="font-bold text-slate-700 bg-slate-100 px-1.5 rounded">{item.kode_produk}</span>}
                                {item.kode_produk && item.tipe_produk && <span>-</span>}
                                {item.tipe_produk && <span>{item.tipe_produk}</span>}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm font-semibold text-slate-600 align-top">
                          {item.rak && item.rak !== '-' ? item.rak : '-'}/{item.ambalan && item.ambalan !== '-' ? item.ambalan : '-'}
                        </td>
                        <td className="py-4 px-4 text-slate-900 font-bold text-center align-top"><span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{item.stok ?? 0}</span></td>
                        <td className="py-4 px-4 text-right align-top">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(item)} className="bg-slate-900 hover:bg-black text-white px-4 py-1.5 rounded text-sm font-medium shadow-sm">Edit Data</button>
                            <button onClick={() => { setSampleToDelete(item); setIsDeleteModalOpen(true); }} className="bg-white border border-red-200 hover:bg-red-50 text-[#E31B23] px-4 py-1.5 rounded text-sm font-medium shadow-sm">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-500">Belum ada data sampel {selectedBrand}.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Menampilkan halaman <span className="font-bold">{currentPage}</span> dari <span className="font-bold">{totalPages}</span> (Total {filteredSamples.length} data)
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm disabled:opacity-30 hover:bg-slate-200 transition"
                  >
                    ← Sebelumnya
                  </button>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm disabled:opacity-30 hover:bg-slate-200 transition"
                  >
                    Berikutnya →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Tambah Sampel Baru ({selectedBrand})</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                
                {selectedBrand === 'ROMAN' ? (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Nama Produk <span className="text-red-500">*</span></label>
                      <input type="text" required value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Tipe Produk</label>
                      <input type="text" value={addForm.tipe_produk} onChange={(e) => setAddForm({...addForm, tipe_produk: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Kode Produk</label>
                      <input type="text" value={addForm.kode_produk} onChange={(e) => setAddForm({...addForm, kode_produk: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-1">Nama / Seri <span className="text-red-500">*</span></label>
                    <input type="text" required value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mt-2 mb-1">Nomor Rak</label>
                  <input type="text" value={addForm.rak} onChange={(e) => setAddForm({...addForm, rak: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mt-2 mb-1">Ambalan Ke-</label>
                  <input type="text" value={addForm.ambalan} onChange={(e) => setAddForm({...addForm, ambalan: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div className="col-span-2 mt-2">
                  <label className="block text-sm font-semibold mb-1">Stok Awal</label>
                  <input type="number" value={addForm.stok} onChange={(e) => setAddForm({...addForm, stok: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold">{isSaving ? 'Menyimpan...' : 'Simpan Sampel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Data Sampel</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Brand</label>
                  <select value={editForm.brand} onChange={(e) => setEditForm({...editForm, brand: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#E31B23]">
                    <option value="ROMAN">ROMAN</option>
                    <option value="QUADRA">QUADRA</option>
                  </select>
                </div>

                {editForm.brand === 'ROMAN' ? (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Nama Produk <span className="text-red-500">*</span></label>
                      <input type="text" required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Tipe Produk</label>
                      <input type="text" value={editForm.tipe_produk} onChange={(e) => setEditForm({...editForm, tipe_produk: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Kode Produk</label>
                      <input type="text" value={editForm.kode_produk} onChange={(e) => setEditForm({...editForm, kode_produk: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-1">Nama / Seri <span className="text-red-500">*</span></label>
                    <input type="text" required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mt-2 mb-1">Nomor Rak</label>
                  <input type="text" value={editForm.rak} onChange={(e) => setEditForm({...editForm, rak: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mt-2 mb-1">Ambalan Ke-</label>
                  <input type="text" value={editForm.ambalan} onChange={(e) => setEditForm({...editForm, ambalan: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>
                
                <div className="col-span-2 mt-2">
                  <label className="block text-sm font-semibold mb-1">Stok Saat Ini</label>
                  <input type="number" min="0" value={editForm.stok} onChange={(e) => setEditForm({...editForm, stok: e.target.value})} className="w-full px-4 py-2 text-lg font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E31B23]" />
                </div>

                {/* CHECKBOX DISCONTINUE */}
                <div className="col-span-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="discontinue"
                    checked={editForm.is_discontinue} 
                    onChange={(e) => setEditForm({...editForm, is_discontinue: e.target.checked})} 
                    className="w-5 h-5 accent-[#E31B23] cursor-pointer rounded" 
                  />
                  <label htmlFor="discontinue" className="text-sm font-bold text-red-700 cursor-pointer select-none">
                    Tandai sebagai Barang Discontinue
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9141b] text-white rounded-lg font-bold shadow-sm">{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {isDeleteModalOpen && sampleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Hapus Sampel?</h3>
            <p className="text-sm text-slate-500 mb-4">Anda yakin ingin menghapus data <span className="font-bold text-slate-900">{sampleToDelete.name || sampleToDelete.nama_sampel}</span> secara permanen?</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 bg-[#E31B23] text-white rounded-lg font-bold shadow-sm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}