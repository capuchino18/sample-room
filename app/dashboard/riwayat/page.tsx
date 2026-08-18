'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RiwayatPage() {
  const [allRiwayat, setAllRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupedData, setGroupedData] = useState<{ [key: string]: any[] }>({});
  const [dateKeys, setDateKeys] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportType, setExportType] = useState('SEMUA');

  const [isDeleteRangeModalOpen, setIsDeleteRangeModalOpen] = useState(false);
  const [deleteStartDate, setDeleteStartDate] = useState('');
  const [deleteEndDate, setDeleteEndDate] = useState('');
  const [isDeletingRange, setIsDeletingRange] = useState(false);

  const supabase = createClient();

  const fetchRiwayat = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('riwayat_transaksi')
      .select('*')
      .order('created_at', { ascending: true }); // Diurutkan dari yang terlama ke terbaru agar Slide 1 adalah hari pertama
    
    if (data) {
      setAllRiwayat(data);
      processGroupedData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const processGroupedData = (data: any[]) => {
    const groups: { [key: string]: any[] } = {};
    data.forEach(item => {
      const dateOnly = item.created_at ? item.created_at.split('T')[0] : 'Lainnya';
      if (!groups[dateOnly]) groups[dateOnly] = [];
      groups[dateOnly].push(item);
    });

    // Urutkan tanggal dari terlama ke terbaru (ascending)
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    setGroupedData(groups);
    setDateKeys(keys);
    setCurrentSlideIndex(0); // Mulai dari slide pertama (index 0)
  };

  const handleHapusRiwayat = async (id: any) => {
    if (window.confirm("Yakin ingin menghapus riwayat aktivitas ini?")) {
      const { error } = await supabase.from('riwayat_transaksi').delete().eq('id', id);
      if (error) {
        alert("Gagal menghapus riwayat: " + error.message);
      } else {
        fetchRiwayat();
      }
    }
  };

  const handleDeleteRangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteStartDate || !deleteEndDate) {
      alert("Silakan pilih tanggal mulai dan selesai!");
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus semua riwayat dari tanggal ${deleteStartDate} sampai ${deleteEndDate}?`)) {
      return;
    }

    setIsDeletingRange(true);
    
    const targetData = allRiwayat.filter(item => {
      const itemDate = item.created_at ? item.created_at.split('T')[0] : '';
      return itemDate >= deleteStartDate && itemDate <= deleteEndDate;
    });

    if (targetData.length === 0) {
      alert("Tidak ada data riwayat pada rentang tanggal tersebut.");
      setIsDeletingRange(false);
      return;
    }

    const targetIds = targetData.map(item => item.id);

    const { error } = await supabase
      .from('riwayat_transaksi')
      .delete()
      .in('id', targetIds);

    setIsDeletingRange(false);

    if (error) {
      alert("Gagal menghapus riwayat: " + error.message);
    } else {
      alert(`Berhasil menghapus ${targetIds.length} data riwayat.`);
      setIsDeleteRangeModalOpen(false);
      setDeleteStartDate('');
      setDeleteEndDate('');
      fetchRiwayat();
    }
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDateFilter(val);
    if (val && groupedData[val]) {
      const index = dateKeys.indexOf(val);
      if (index !== -1) setCurrentSlideIndex(index);
    }
  };

  const handleExportExcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportStartDate || !exportEndDate) {
      alert("Silakan pilih rentang tanggal!");
      return;
    }

    const filteredExport = allRiwayat.filter(item => {
      const itemDate = item.created_at ? item.created_at.split('T')[0] : '';
      const isDateMatch = itemDate >= exportStartDate && itemDate <= exportEndDate;
      const isTypeMatch = exportType === 'SEMUA' ? true : item.tipe === exportType;
      return isDateMatch && isTypeMatch;
    });

    if (filteredExport.length === 0) {
      alert("Tidak ada data pada rentang dan jenis tersebut.");
      return;
    }

    let htmlContent = `
      <table border="1">
        <thead>
          <tr style="background-color: #f2f2f2; font-weight: bold;">
            <th>Waktu</th><th>Tipe</th><th>Nama Sampel</th><th>Jumlah (PCS)</th><th>Nama Sales</th><th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${filteredExport.map(item => `
            <tr>
              <td>${item.created_at}</td><td>${item.tipe}</td><td>${item.nama_sampel || item.transaksi || '-'}</td>
              <td>${item.qty}</td><td>${item.nama_sales || '-'}</td><td>${item.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_${exportType}_${exportStartDate}_s_d_${exportEndDate}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExportModalOpen(false);
  };

  const activeDateKey = dateKeys[currentSlideIndex];
  const currentSlideData = activeDateKey ? groupedData[activeDateKey] : [];

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Aktivitas</h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={() => setIsDeleteRangeModalOpen(true)} className="bg-white border border-red-200 hover:bg-red-50 text-[#E31B23] px-4 py-2.5 rounded-lg font-medium transition shadow-sm flex items-center gap-2 justify-center flex-1 md:flex-initial">
            🗑️ Hapus Riwayat
          </button>
          <button onClick={() => setIsExportModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm flex items-center gap-2 justify-center flex-1 md:flex-initial">
            📥 Export ke Excel
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Pilih Tanggal:</label>
          <input type="date" value={selectedDateFilter} onChange={handleDateFilterChange} className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-auto" />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Tombol Navigasi Normal (Sebelumnya / Selanjutnya) */}
          <button 
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} 
            disabled={currentSlideIndex === 0} 
            className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold disabled:opacity-30"
          >
            ← Hari Sebelumnya
          </button>
          
          <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
            Slide {dateKeys.length > 0 ? currentSlideIndex + 1 : 0} / {dateKeys.length}
          </span>
          
          <button 
            onClick={() => setCurrentSlideIndex(Math.min(dateKeys.length - 1, currentSlideIndex + 1))} 
            disabled={currentSlideIndex >= dateKeys.length - 1} 
            className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold disabled:opacity-30"
          >
            Hari Berikutnya →
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-lg">📅 {activeDateKey || 'Data Kosong'}</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">Memuat riwayat...</div>
        ) : currentSlideData && currentSlideData.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {currentSlideData.map((item) => (
              <div key={item.id} className="p-5 px-6 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${item.tipe === 'MASUK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-[#E31B23]'}`}>
                    {item.tipe === 'MASUK' ? '+' : '-'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.tipe === 'MASUK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-[#E31B23]'}`}>
                        {item.tipe}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-base">{item.nama_sampel || item.transaksi}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.tipe === 'MASUK' ? 'Masuk ke Gudang' : `Keluar ke: ${item.nama_sales}`}
                    </p>
                    {item.keterangan && item.keterangan !== '-' && (
                      <p className="text-xs text-slate-400 italic mt-0.5">Ket: {item.keterangan}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-base ${item.tipe === 'MASUK' ? 'text-emerald-600' : 'text-[#E31B23]'}`}>
                      {item.tipe === 'MASUK' ? '+' : '-'}{item.qty} PCS
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                  </div>
                  
                  <button 
                    onClick={() => handleHapusRiwayat(item.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition text-sm font-medium"
                    title="Hapus Riwayat Ini"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">Tidak ada riwayat aktivitas pada tanggal ini.</div>
        )}
      </div>

      {isDeleteRangeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2 text-slate-900">Hapus Riwayat Berdasarkan Tanggal</h3>
            <p className="text-xs text-slate-500 mb-4">Pilih rentang tanggal riwayat test yang ingin dibersihkan.</p>
            <form onSubmit={handleDeleteRangeSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-slate-700">Dari Tanggal</label>
                <input type="date" value={deleteStartDate} onChange={(e) => setDeleteStartDate(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1 text-slate-700">Sampai Tanggal</label>
                <input type="date" value={deleteEndDate} onChange={(e) => setDeleteEndDate(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsDeleteRangeModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isDeletingRange} className="px-5 py-2 bg-[#E31B23] text-white rounded-lg font-bold hover:bg-[#c9141b]">
                  {isDeletingRange ? 'Menghapus...' : 'Hapus Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Export ke Excel</h3>
            <form onSubmit={handleExportExcel}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-slate-700">Jenis Transaksi</label>
                <select value={exportType} onChange={(e) => setExportType(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
                  <option value="SEMUA">Semua Transaksi</option>
                  <option value="MASUK">Hanya Barang Masuk</option>
                  <option value="KELUAR">Hanya Barang Keluar</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-slate-700">Dari Tanggal</label>
                <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1 text-slate-700">Sampai Tanggal</label>
                <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Download Excel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}