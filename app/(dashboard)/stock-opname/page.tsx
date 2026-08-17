'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; 

export default function StockOpnamePage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [newStok, setNewStok] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const supabase = createClient();

  const fetchAllSamples = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('samples')
      .select('*')
      .order('brand', { ascending: true });
    
    if (error) console.error(error.message);
    else if (data) setSamples(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllSamples();
  }, []);

  const filteredSamples = samples.filter((item) => {
    const namaSampel = item.name || item.nama_sampel || item.seri || '';
    return namaSampel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleEditClick = (item: any) => {
    setSelectedSample(item);
    setNewStok(item.stok || 0);
    setIsModalOpen(true);
  };

  const handleSimpanStok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('samples')
      .update({ stok: Number(newStok) }) 
      .eq('id', selectedSample.id); 

    setIsSaving(false);
    
    if (error) {
      alert("GAGAL UPDATE STOK: " + error.message); 
    } else {
      setIsModalOpen(false); 
      fetchAllSamples(); 
    }
  };

  const handleDeleteClick = (item: any) => {
    setSampleToDelete(item);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sampleToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    const { error } = await supabase
      .from('samples')
      .delete()
      .eq('id', sampleToDelete.id);

    setIsDeleting(false);

    if (error) {
      setDeleteError("GAGAL MENGHAPUS SAMPEL: " + error.message);
    } else {
      setIsDeleteModalOpen(false);
      setSampleToDelete(null);
      fetchAllSamples();
    }
  };

  return (
    <div className="p-4 md:p-10 w-full max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Stok Opname</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="font-semibold text-slate-700 w-full md:w-auto">Data Stok Gudang</h2>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Cari nama / seri..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Tabel dengan scroll horizontal untuk HP */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Nama / Seri</th>
                <th className="py-3 px-4">Ukuran</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Memuat data...</td></tr>
              ) : filteredSamples.length > 0 ? (
                filteredSamples.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.brand === 'ROMAN' ? 'bg-red-100 text-[#E31B23]' : 'bg-slate-100 text-slate-900'}`}>
                        {item.brand || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{item.name || item.nama_sampel || item.seri || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{item.ukuran || item.size || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded">{item.stok || 0}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEditClick(item)} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold hover:bg-black">Edit</button>
                        <button onClick={() => handleDeleteClick(item)} className="bg-white border border-red-200 text-[#E31B23] px-3 py-1 rounded text-xs font-bold hover:bg-red-50">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-10 text-center text-slate-500">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {isModalOpen && selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Update Stok</h3>
            <form onSubmit={handleSimpanStok}>
              <input type="number" value={newStok} onChange={(e) => setNewStok(e.target.value)} required min="0" className="w-full px-4 py-3 mb-6 text-xl text-center font-bold border rounded-lg focus:ring-2 focus:ring-[#E31B23] focus:outline-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-[#E31B23] text-white rounded-lg font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}