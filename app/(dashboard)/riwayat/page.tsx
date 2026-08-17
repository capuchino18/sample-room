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

  const supabase = createClient();

  useEffect(() => {
    const fetchRiwayat = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('riwayat_transaksi')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setAllRiwayat(data);
        processGroupedData(data);
      }
      setLoading(false);
    };

    fetchRiwayat();
  }, []);

  const processGroupedData = (data: any[]) => {
    const groups: { [key: string]: any[] } = {};
    data.forEach(item => {
      const dateOnly = item.created_at ? item.created_at.split('T')[0] : 'Lainnya';
      if (!groups[dateOnly]) groups[dateOnly] = [];
      groups[dateOnly].push(item);
    });

    const keys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    setGroupedData(groups);
    setDateKeys(keys);
    setCurrentSlideIndex(0);
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
    <div className="p-4 md:p-10 w-full max-w-7xl mx-auto relative">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Aktivitas</h1>
        </div>
        <button 
          onClick={() => setIsExportModalOpen(true)} 
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm flex items-center justify-center gap-2"
        >
          📥 Export ke Excel
        </button>
      </div>

      {/* Filter & Navigasi Tanggal (Responsive Stack) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-slate-600">Pilih Tanggal:</label>
          <input 
            type="date" 
            value={selectedDateFilter} 
            onChange={handleDateFilterChange} 
            className="w-full md:w-auto px-4 py-2 border border-slate-300 rounded-lg text-sm" 
          />
        </div>
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
          <button 
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} 
            disabled={currentSlideIndex === 0} 
            className="px-3 py-2 bg-slate-100 rounded-lg text-xs md:text-sm font-bold disabled:opacity-30 flex-1 md:flex-none"
          >
            ← Sebelumnya
          </button>
          <span className="text-xs md:text-sm font-bold text-slate-700 text-center px-2">
            Slide {dateKeys.length > 0 ? currentSlideIndex + 1 : 0} / {dateKeys.length}
          </span>
          <button 
            onClick={() => setCurrentSlideIndex(Math.min(dateKeys.length - 1, currentSlideIndex + 1))} 
            disabled={currentSlideIndex >= dateKeys.length - 1} 
            className="px-3 py-2 bg-slate-100 rounded-lg text-xs md:text-sm font-bold disabled:opacity-30 flex-1 md:flex-none"
          >
            Berikutnya →
          </button>
        </div>
      </div>

      {/* Konten Tabel Riwayat */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base md:text-lg font-bold text-slate-800">📅 {activeDateKey || 'Data Kosong'}</h2>
        </div>
        
        {/* Pembungkus Tabel Agar Bisa Discroll di HP */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase bg-slate-50">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Nama Sampel</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4">Sales</th>
                <th className="py-3 px-4">Ket</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">Memuat data...</td></tr>
              ) : currentSlideData && currentSlideData.length > 0 ? (
                currentSlideData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50 text-sm">
                    <td className="py-3 px-4 whitespace-nowrap">{new Date(item.created_at).toLocaleTimeString('id-ID')} WIB</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.tipe === 'MASUK' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{item.nama_sampel || item.transaksi}</td>
                    <td className="py-3 px-4 font-black text-center whitespace-nowrap">{item.qty} PCS</td>
                    <td className="py-3 px-4 text-slate-600">{item.nama_sales || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{item.keterangan || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">Tidak ada riwayat pada tanggal ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Export Excel */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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