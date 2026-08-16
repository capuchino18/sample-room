'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type DashboardStats = {
  total: number;
  roman: number;
  quadra: number;
  inUse: number;
};

type RecentLog = {
  id: string;
  log_type: string;
  person_in_charge: string;
  log_date: string;
  samples: { name: string; brand: string };
};

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, roman: 0, quadra: 0, inUse: 0 });
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Ambil data statistik dari tabel samples
    const { data: samples } = await supabase.from('samples').select('brand, lifecycle_status');
    
    if (samples) {
      const romanCount = samples.filter(s => s.brand === 'ROMAN').length;
      const quadraCount = samples.filter(s => s.brand === 'QUADRA').length;
      const inUseCount = samples.filter(s => s.lifecycle_status === 'IN_USE').length;
      
      setStats({
        total: samples.length,
        roman: romanCount,
        quadra: quadraCount,
        inUse: inUseCount
      });
    }

    // 2. Ambil 5 aktivitas terbaru dari tabel sample_logs
    const { data: logs } = await supabase
      .from('sample_logs')
      .select('*, samples(name, brand)')
      .order('log_date', { ascending: false })
      .limit(5);
      
    if (logs) setRecentLogs(logs);
    
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Dashboard */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ringkasan Operasional</h1>
        <p className="text-sm text-slate-500">Pantau ketersediaan sampel dan aktivitas terbaru hari ini.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat data dashboard...</p>
      ) : (
        <>
          {/* Kartu Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Sampel</span>
              <span className="text-3xl font-bold text-slate-800">{stats.total}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs flex flex-col bg-blue-50/30">
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Total ROMAN</span>
              <span className="text-3xl font-bold text-blue-700">{stats.roman}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs flex flex-col bg-amber-50/30">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Total QUADRA</span>
              <span className="text-3xl font-bold text-amber-700">{stats.quadra}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs flex flex-col bg-rose-50/30">
              <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Sedang Keluar (In Use)</span>
              <span className="text-3xl font-bold text-rose-700">{stats.inUse}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            
            {/* Tabel Aktivitas Terbaru */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-800">Aktivitas Terbaru</h2>
                <Link href="/dashboard/logs" className="text-xs font-medium text-blue-600 hover:underline">
                  Lihat Semua
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentLogs.length > 0 ? recentLogs.map(log => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {log.samples?.name || 'Sampel Dihapus'} <span className="text-xs text-slate-500">({log.samples?.brand})</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">PIC: {log.person_in_charge}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        log.log_type === 'REQUEST' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {log.log_type}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(log.log_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-500 text-sm">Belum ada aktivitas.</div>
                )}
              </div>
            </div>

            {/* Menu Akses Cepat */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <h2 className="font-bold text-slate-800 mb-4">Akses Cepat</h2>
              <div className="space-y-3">
                <Link href="/dashboard/samples/create" className="block w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition text-center">
                  + Input Sampel Baru
                </Link>
                <Link href="/dashboard/requesters" className="block w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition text-center">
                  Kelola Data Sales/Staff
                </Link>
                <Link href="/dashboard/samples" className="block w-full p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition text-center">
                  Cari Sampel & Lokasi Rak
                </Link>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}