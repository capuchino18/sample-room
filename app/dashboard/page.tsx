'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalJenis: 0, romanJenis: 0, quadraJenis: 0, jenisKeluarHariIni: 0, pcsKeluarHariIni: 0 });
  const [loading, setLoading] = useState(true);
  const [samples, setSamples] = useState<any[]>([]);
  const [salesList, setSalesList] = useState<any[]>([]);
  const [riwayatTerbaru, setRiwayatTerbaru] = useState<any[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'MASUK' | 'KELUAR'>('MASUK');
  
  const [searchSampleTerm, setSearchSampleTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [qty, setQty] = useState('');
  const [selectedSalesId, setSelectedSalesId] = useState('');
  const [namaLainnya, setNamaLainnya] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: dataSamples } = await supabase.from('samples').select('*');
    if (dataSamples) setSamples(dataSamples);
    const { data: dataSales } = await supabase.from('sales').select('*');
    if (dataSales) setSalesList(dataSales);
    const { data: dataRiwayat } = await supabase.from('riwayat_transaksi').select('*').order('created_at', { ascending: false }).limit(5);
    
    if (dataRiwayat && dataSamples) {
      const enrichedRiwayat = dataRiwayat.map(riwayat => {
        const rawName = (riwayat.nama_sampel || riwayat.transaksi || '').replace(/^(ROMAN|QUADRA)\s-\s/, '');
        const matchedSample = dataSamples.find(s => s.name === rawName || s.nama_sampel === rawName);
        return { ...riwayat, posisi: matchedSample ? `Rak ${matchedSample.rak} / Amb ${matchedSample.ambalan}` : 'Posisi tidak diketahui' };
      });
      setRiwayatTerbaru(enrichedRiwayat);
    }

    const totalJenis = dataSamples?.length || 0;
    const romanJenis = dataSamples?.filter(s => s.brand === 'ROMAN').length || 0;
    const quadraJenis = dataSamples?.filter(s => s.brand === 'QUADRA').length || 0;
    
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

    setStats({ totalJenis, romanJenis, quadraJenis, jenisKeluarHariIni: jenisSet.size, pcsKeluarHariIni: totalPcsKeluar });
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // REVISI: Logika filter ditambahkan agar mencari nama, kode, dan tipe produk
  const filteredSamples = samples.filter(s => {
    const searchString = `${s.name || s.nama_sampel || s.seri || ''} ${s.kode_produk || ''} ${s.tipe_produk || ''}`.toLowerCase();
    return searchString.includes(searchSampleTerm.toLowerCase());
  });

  const openTransactionModal = (type: 'MASUK' | 'KELUAR') => {
    setTransactionType(type);
    setSelectedSample(null); setSearchSampleTerm(''); setQty(''); setSelectedSalesId(''); setNamaLainnya(''); setKeterangan('');
    setIsTransactionModalOpen(true);
  };

  const handleSimpanTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample) return alert("Pilih sampel!");
    setIsSaving(true);
    const stokLama = selectedSample.stok || 0;
    const jumlahTransaksi = Number(qty);
    const stokBaru = transactionType === 'MASUK' ? stokLama + jumlahTransaksi : stokLama - jumlahTransaksi;

    if (stokBaru < 0) { alert("Gagal: Stok tidak mencukupi!"); setIsSaving(false); return; }

    await supabase.from('samples').update({ stok: stokBaru }).eq('id', selectedSample.id);
    const namaSampel = selectedSample.name || selectedSample.nama_sampel;
    
    let namaPenerima = '-';
    if (transactionType === 'KELUAR') {
      if (selectedSalesId === 'LAINNYA') namaPenerima = namaLainnya;
      else {
        const salesObj = salesList.find(s => s.id.toString() === selectedSalesId.toString());
        if (salesObj) namaPenerima = salesObj.nama;
      }
    }
    
    await supabase.from('riwayat_transaksi').insert([{
      tipe: transactionType,
      nama_sampel: `${selectedSample.brand} - ${namaSampel}`,
      qty: jumlahTransaksi,
      nama_sales: namaPenerima,
      keterangan: keterangan || '-'
    }]);

    setIsSaving(false); setIsTransactionModalOpen(false); fetchData(); 
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Ringkasan Operasional</h1>
        <div className="flex gap-3">
          <button onClick={() => openTransactionModal('MASUK')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition">+ Masuk</button>
          <button onClick={() => openTransactionModal('KELUAR')} className="bg-[#E31B23] hover:bg-[#c9141b] text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition">- Keluar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
         <div className="bg-white p-5 border rounded-xl shadow-sm"><h3 className="text-[11px] font-bold text-slate-500 mb-2 uppercase">Total Jenis</h3><p className="text-3xl font-black">{loading ? '...' : stats.totalJenis}</p></div>
         <div className="bg-[#FBB03B] p-5 border border-amber-400 rounded-xl shadow-sm"><h3 className="text-[11px] font-bold text-[#b91c1c] mb-2 uppercase">Jenis ROMAN</h3><p className="text-3xl font-black text-[#b91c1c]">{loading ? '...' : stats.romanJenis}</p></div>
         <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl shadow-sm"><h3 className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Jenis QUADRA</h3><p className="text-3xl font-black text-white">{loading ? '...' : stats.quadraJenis}</p></div>
         <div className="bg-red-50 p-5 border border-red-200 rounded-xl"><h3 className="text-[11px] font-bold text-red-700 mb-2 uppercase">Jenis Keluar Hari Ini</h3><p className="text-3xl font-black text-[#E31B23]">{loading ? '...' : stats.jenisKeluarHariIni}</p></div>
         <div className="bg-red-50 p-5 border border-red-200 rounded-xl"><h3 className="text-[11px] font-bold text-red-700 mb-2 uppercase">PCS Keluar Hari Ini</h3><p className="text-3xl font-black text-[#E31B23]">{loading ? '...' : stats.pcsKeluarHariIni}</p></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-900 text-lg">Aktivitas Terbaru & Letak</h2>
          <Link href="/dashboard/riwayat" className="text-sm text-[#E31B23] font-bold hover:underline">Lihat Semua</Link>
        </div>
        {loading ? <div className="p-12 text-center text-slate-500 animate-pulse">Memuat...</div> : (
          <div className="divide-y divide-slate-100">
            {riwayatTerbaru.map((item) => (
              <div key={item.id} className="p-5 px-6 flex justify-between items-center hover:bg-slate-50/80 transition gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.tipe === 'MASUK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-[#E31B23]'}`}>
                    {item.tipe === 'MASUK' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{item.nama_sampel || item.transaksi}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">📍 {item.posisi}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.tipe === 'KELUAR' ? `Keluar ke: ${item.nama_sales}` : 'Masuk ke Gudang'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-base ${item.tipe === 'MASUK' ? 'text-emerald-600' : 'text-[#E31B23]'}`}>
                    {item.tipe === 'MASUK' ? '+' : '-'}{item.qty} PCS
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Transaksi {transactionType}</h3>
            <form onSubmit={handleSimpanTransaksi}>
              <div className="mb-4 relative">
                <input type="text" placeholder="Cari nama, kode, atau tipe..." value={searchSampleTerm} onChange={e => {setSearchSampleTerm(e.target.value); setIsDropdownOpen(true);}} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E31B23] outline-none" required />
                {isDropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border shadow-lg rounded-lg max-h-48 overflow-y-auto">
                    {filteredSamples.map(s => (
                      <li key={s.id} className="p-2.5 hover:bg-slate-100 cursor-pointer text-sm border-b" onMouseDown={() => { setSelectedSample(s); setSearchSampleTerm(`${s.brand} - ${s.name}`); setIsDropdownOpen(false); }}>
                        <div className="font-bold">{s.name}</div>
                        <div className="text-xs text-emerald-600">Kode: {s.kode_produk || '-'} | Stok: {s.stok}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <input type="number" placeholder="Jumlah" value={qty} onChange={e => setQty(e.target.value)} required min="1" className="w-full p-2 border rounded mb-4" />
              {transactionType === 'KELUAR' && (
                <div className="mb-4 bg-slate-50 p-3 rounded border">
                  <select value={selectedSalesId} onChange={e => { setSelectedSalesId(e.target.value); if(e.target.value !== 'LAINNYA') setNamaLainnya(''); }} required className="w-full p-2 border rounded mb-2">
                    <option value="">Pilih Sales</option>
                    {salesList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    <option value="LAINNYA">Lainnya (Input Manual)</option>
                  </select>
                  {selectedSalesId === 'LAINNYA' && <input type="text" placeholder="Nama Penerima..." value={namaLainnya} onChange={e => setNamaLainnya(e.target.value)} required className="w-full p-2 border rounded" />}
                </div>
              )}
              <textarea placeholder="Keterangan..." value={keterangan} onChange={e => setKeterangan(e.target.value)} className="w-full p-2 border rounded mb-6"></textarea>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 text-slate-600">Batal</button>
                <button type="submit" disabled={isSaving} className={`px-4 py-2 text-white font-bold rounded ${transactionType === 'MASUK' ? 'bg-emerald-600' : 'bg-[#E31B23]'}`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}