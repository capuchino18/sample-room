export default function DashboardPage() {
  return (
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
      
      {/* Header Sambutan */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Utama</h1>
        <p className="text-slate-500 mt-1">Pusat kendali operasional Sample Room ROMAN & QUADRA.</p>
      </div>

      {/* Panel Utama: Tombol Request Cepat */}
      <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Request Sampel</h2>
            <p className="text-slate-600 mt-1">Catat pengeluaran sampel baru untuk Sales di sini.</p>
          </div>
          {/* Tombol ini nantinya bisa diarahkan ke halaman form request atau memunculkan Pop-up (Modal) */}
          <button className="bg-[#C4131A] hover:bg-red-800 text-white px-6 py-3 rounded-lg font-bold tracking-wide transition shadow-md whitespace-nowrap">
            + Buat Request Baru
          </button>
        </div>
      </div>

      {/* Panel Ringkasan / Widget Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1 */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Request Hari Ini</h3>
          <p className="text-4xl font-black text-slate-800">0</p>
        </div>

        {/* Widget 2 */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Item Perlu Restock</h3>
          <p className="text-4xl font-black text-slate-800">0</p>
        </div>

        {/* Widget 3 */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Aktivitas Terakhir</h3>
          <p className="text-slate-800 font-medium mt-1">Belum ada aktivitas</p>
          <p className="text-xs text-slate-400 mt-1">-</p>
        </div>

      </div>

    </div>
  );
}