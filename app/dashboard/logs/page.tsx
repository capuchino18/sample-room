'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Log = {
  id: string;
  log_type: 'REQUEST' | 'SUPPLY';
  person_in_charge: string;
  log_date: string;
  samples: { name: string; brand: string };
};

export default function LogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sample_logs')
      .select('*, samples(name, brand)')
      .order('log_date', { ascending: false });

    if (!error) setLogs(data || []);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Riwayat Aktivitas Sampel</h1>
      
      {loading ? (
        <p className="text-slate-500">Memuat data riwayat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-600">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Tipe</th>
                <th className="p-4">Sampel</th>
                <th className="p-4">PIC (Sales/Staff)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="p-4 text-slate-500">
                    {new Date(log.log_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      log.log_type === 'REQUEST' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {log.log_type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {log.samples?.name || 'Sampel Dihapus'}
                    <span className="block text-[10px] text-slate-400">{log.samples?.brand}</span>
                  </td>
                  <td className="p-4 text-slate-700">{log.person_in_charge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}