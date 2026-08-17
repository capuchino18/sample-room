'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    totalJenis: 0, 
    romanJenis: 0, 
    quadraJenis: 0, 
    jenisKeluarHariIni: 0,
    pcsKeluarHariIni: 0
  });
  const [loading, setLoading] = useState(true);
  const [samples, setSamples] = useState<any[]>([]);
  const [salesList, setSalesList] = useState<any[]>([]);
  const [riwayatTerbaru, setRiwayatTerbaru] = useState<any[]>([]);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [isSaving, setIsSaving] = useState(false);

  const [searchSampleTerm, setSearchSampleTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [qty, setQty] = useState<number | string>('');
  const [selectedSalesId, setSelectedSalesId] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    
    const { count: totalJenis } = await supabase.from('samples').select('*', { count: 'exact', head: true });
    const { count: romanJenis } = await supabase.from('samples').select('*', { count: 'exact', head: true }).eq('brand', 'ROMAN');
    const { count: quadraJenis } = await supabase.from('samples').select('*', { count: 'exact', head: true }).eq('brand', 'QUADRA');
    
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: dataRiwayatAll } = await supabase.from('riwayat_transaksi').select('*');

    let jenisSet = new Set();
    let totalPcsKeluar = 0;

    if (dataRiwayatAll) {
      dataRiwayatAll.forEach(item => {
        const itemDate = item.created_at ? item.created_at.split('T')[0] : '';
        if (itemDate === todayStr && item.tipe === 'KELUAR') {
          jenisSet.add(item.nama_sampel || item.transaksi);
          totalPcsKeluar += Number(item.qty) || 0;
        }
      });
    }

    setStats({
      totalJenis: totalJenis || 0,
      romanJenis: romanJenis || 0,
      quadraJenis: quadraJenis || 0,
      jenisKeluarHariIni: jenisSet.size,
      pcsKeluarHariIni: totalPcsKeluar
    });

    const { data: dataSamples } = await supabase.from('samples').select('*').order('brand', { ascending: true });
    if (dataSamples) setSamples(dataSamples);

    const { data: dataSales } = await supabase.from('sales').select('*').order('nama', { ascending: true });
    if (dataSales) setSalesList(dataSales);
    
    const { data: dataRiwayat } = await supabase.from('riwayat_transaksi').select('*').order('created_at', { ascending: false }).limit(5);
    if (dataRiwayat) setRiwayatTerbaru(dataRiwayat);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSamples = samples.filter(s => {
    const nama = s.name || s.nama_sampel || s.seri || '';
    return nama.toLowerCase().includes(searchSampleTerm.toLowerCase());
  });

  const openTransaction = (type: 'MASUK' | 'KELUAR') => {
    setTransactionType(type);
    setSelectedSample(null);
    setSearchSampleTerm('');
    setQty('');
    setSelectedSalesId('');
    setKeterangan('');
    setIsTransactionModalOpen(true);
  };

  const handleSimpanTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample) {
      alert("Pilih sampel keramik terlebih dahulu!");
      return;
    }

    setIsSaving(true);
    const stokLama = selectedSample.stok || 0;
    const jumlahTransaksi = Number(qty);
    const stokBaru = transactionType === 'MASUK' ? stokLama + jumlahTransaksi : stokLama - jumlahTransaksi;

    if (stokBaru < 0) {
      alert("Gagal: Stok tidak mencukupi untuk dikeluarkan!");
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase.from('samples').update({ stok: stokBaru }).eq('id', selectedSample.id);
    if (updateError) {
      alert("GAGAL UPDATE STOK: " + updateError.message);
      setIsSaving(false); return;
    }

    const namaSampel = selectedSample.name || selectedSample.nama_sampel || selectedSample.seri;
    const salesObj = salesList.find(s => s.id.toString() === selectedSalesId.toString());
    const namaSales = transactionType === 'KELUAR' && salesObj ? salesObj.nama : '-';

    const { error: riwayatError } = await supabase.from('riwayat_transaksi').insert([{
      tipe: transactionType,
      nama_sampel: `${selectedSample.brand} - ${namaSampel}`,
      qty: jumlahTransaksi,
      nama_sales: namaSales,
      keterangan: keterangan || '-'
    }]);

    if (riwayatError) {
      alert("STOK TERUPDATE, TAPI GAGAL MENCATAT RIWAYAT: " + riwayatError.message);
    }

    setIsSaving(false);
    setIsTransactionModalOpen(false);
    fetchData(); 
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ringkasan Operasional</h1>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => openTransaction('MASUK')} className="bg-[#FBB03B] hover:bg-[#e09c31] text-slate-900 px-5 py-2.5 rounded-lg font-bold transition shadow-sm flex items-center gap-2">+ Barang Masuk</button>
          <button onClick={() => openTransaction('KELUAR')} className="bg-[#E31B23] hover:bg-[#c9141b] text-white px-5 py-2.5 rounded-lg font-bold transition shadow-sm flex items-center gap-2">- Barang Keluar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Jenis Sampel</h3>
          <p className="text-3xl font-black text-slate-900">{loading ? '...' : stats.totalJenis}</p>
        </div>
        
        <div className="bg-white p-5 border-slate-200 border rounded-xl shadow-sm bg-slate-50/50">
          <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Jenis ROMAN</h3>
          <p className="text-3xl font-black text-[#E31B23]">{loading ? '...' : stats.romanJenis}</p>
        </div>

        <div className="bg-white p-5 border-slate-200 border rounded-xl shadow-sm bg-slate-50/50">
          <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Jenis QUADRA</h3>
          <p className="text-3xl font-black text-slate-900">{loading ? '...' : stats.quadraJenis}</p>
        </div>

        <div className="bg-white p-5 border-amber-200 border rounded-xl shadow-sm bg-amber-50/30">
          <h3 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">Jenis Keluar Hari Ini</h3>
          <p className="text-3xl font-black text-amber-600">{loading ? '...' : stats.jenisKeluarHariIni} <span className="text-xs font-normal text-slate-500">Jenis</span></p>
        </div>

        <div className="bg-white p-5 border-red-200 border rounded-xl shadow-sm bg-red-50/30">
          <h3 className="text-[11px] font-bold text-[#E31B23] uppercase tracking-wider mb-2">PCS Keluar Hari Ini</h3>
          <p className="text-3xl font-black text-[#E31B23]">{loading ? '...' : stats.pcsKeluarHariIni} <span className="text-xs font-normal text-slate-500">PCS</span></p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Aktivitas Terbaru</h2>
          <Link href="/dashboard/riwayat" className="text-sm text-[#E31B23] hover:underline font-bold">Lihat Semua Riwayat</Link>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">Memuat riwayat aktivitas...</div>
        ) : riwayatTerbaru.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {riwayatTerbaru.map((item) => (
              <div key={item.id} className="p-4 px-6 hover:bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.tipe === 'MASUK' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-[#E31B23]'}`}>
                    {item.tipe === 'MASUK' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.nama_sampel || item.transaksi}</p>
                    <p className="text-sm text-slate-500">
                      {item.tipe === 'MASUK' ? 'Restock / Masuk Gudang' : `Keluar ke: ${item.nama_sales}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${item.tipe === 'MASUK' ? 'text-amber-600' : 'text-[#E31B23]'}`}>
                    {item.tipe === 'MASUK' ? '+' : '-'}{item.qty} PCS
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">Belum ada aktivitas barang masuk atau keluar yang tercatat.</div>
        )}
      </div>

      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h3 className={`text-xl font-bold mb-4 ${transactionType === 'MASUK' ? 'text-amber-600' : 'text-[#E31B23]'}`}>Form {transactionType === 'MASUK' ? 'Barang Masuk' : 'Barang Keluar'}</h3>
            <form onSubmit={handleSimpanTransaksi}>
              <div className="mb-4 relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cari & Pilih Sampel</label>
                <input 
                  type="text" 
                  value={searchSampleTerm} 
                  onChange={(e) => { setSearchSampleTerm(e.target.value); setIsDropdownOpen(true); setSelectedSample(null); }} 
                  onFocus={() => setIsDropdownOpen(true)} 
                  placeholder="Ketik nama / seri sampel..." 
                  required={!selectedSample} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                />
                {isDropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSamples.length > 0 ? (
                      filteredSamples.map((s) => (
                        <li 
                          key={s.id} 
                          onMouseDown={() => { setSelectedSample(s); setSearchSampleTerm(`${s.brand} - ${s.name || s.nama_sampel || s.seri}`); setIsDropdownOpen(false); }} 
                          className="px-4 py-2 hover:bg-slate-100 cursor-pointer border-b border-slate-50 text-sm"
                        >
                          <div className="font-bold text-slate-900">{s.name || s.nama_sampel || s.seri}</div>
                          <div className="text-xs text-slate-500">Brand: {s.brand} | Stok: {s.stok || 0} PCS</div>
                        </li>
                      ))
                    ) : (<li className="px-4 py-3 text-sm text-slate-500 text-center">Sampel tidak ditemukan.</li>)}
                  </ul>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah (PCS)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={qty} 
                  onChange={(e) => setQty(e.target.value)} 
                  required 
                  placeholder="Masukkan angka..." 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                />
              </div>
              {transactionType === 'KELUAR' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Diberikan Kepada (Sales)</label>
                  <select 
                    required 
                    value={selectedSalesId} 
                    onChange={(e) => setSelectedSalesId(e.target.value)} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23] bg-white"
                  >
                    <option value="">-- Pilih Nama Sales --</option>
                    {salesList.map(sales => (<option key={sales.id} value={sales.id}>{sales.nama} ({sales.brand})</option>))}
                  </select>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea 
                  rows={2} 
                  value={keterangan} 
                  onChange={(e) => setKeterangan(e.target.value)} 
                  placeholder="Opsional (misal: untuk proyek Hotel X)..." 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className={`px-5 py-2 text-white rounded-lg font-bold shadow-sm disabled:opacity-50 ${transactionType === 'MASUK' ? 'bg-[#FBB03B] text-slate-900 hover:bg-[#e09c31]' : 'bg-[#E31B23] hover:bg-[#c9141b]'}`}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}