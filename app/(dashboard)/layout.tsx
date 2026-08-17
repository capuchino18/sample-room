import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 w-full">
      
      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-[#1A1A1A] text-white flex flex-col flex-shrink-0">
        
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-wider text-white">SAMPLE ROOM</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-sm font-medium text-slate-400">ROMAN & QUADRA</span>
          </div>
        </div>

        {/* Menu Navigasi Simpel */}
        <nav className="flex flex-col gap-1 p-4 mt-4">
          <Link href="/dashboard" className="px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/samples" className="px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Sampel
          </Link>
          <Link href="/dashboard/riwayat" className="px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Riwayat
          </Link>
          <Link href="/dashboard/stock-opname" className="px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Stok Opname
          </Link>
          
          <div className="my-2 border-t border-slate-800"></div>
          
          <Link href="/dashboard/sales" className="px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Data Sales
          </Link>
        </nav>
      </div>

      {/* ================= AREA KONTEN UTAMA ================= */}
      {/* Bagian ini yang sebelumnya hilang. Di sinilah page.tsx akan ditampilkan! */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}