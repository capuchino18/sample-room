import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigasi - Tema Hitam/Gelap */}
      <aside className="w-64 bg-[#1A1A1A] text-slate-300 flex flex-col border-r border-[#2A2A2A] shadow-xl z-10">
        
        {/* Header Sidebar */}
        <div className="p-6 border-b border-[#333]">
          <h2 className="text-xl font-black text-white tracking-widest">SAMPLE ROOM</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#E51921]"></span>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Roman & Quadra</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm font-medium overflow-y-auto">
          {/* Menu Utama */}
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/dashboard/samples" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Samples
          </Link>
          <Link href="/dashboard/requests" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Sample Requests
          </Link>
          <Link href="/dashboard/logs" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Riwayat Aktivitas
          </Link>
          
          {/* Menu Inventory */}
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Inventory
          </div>
          <Link href="/dashboard/inventory/in" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Barang Masuk
          </Link>
          <Link href="/dashboard/inventory/out" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Barang Keluar
          </Link>
          <Link href="/dashboard/inventory/adjustment" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Adjustment
          </Link>
          <Link href="/dashboard/inventory/opname" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Stock Opname
          </Link>
          <Link href="/dashboard/inventory/return" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Return
          </Link>
          
          {/* Menu System */}
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Control & System
          </div>
          <Link href="/dashboard/requesters" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Master Requesters
          </Link>
          <Link href="/dashboard/locations" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Locations
          </Link>
          <Link href="/dashboard/reports" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Reports
          </Link>
          <Link href="/dashboard/audit" className="block px-4 py-2.5 rounded-lg hover:bg-[#E51921] hover:text-white transition">
            Audit Log
          </Link>
        </nav>

        <div className="p-4 border-t border-[#333] flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Lyman Group</span>
          <span className="text-[#FBB040] font-bold">v1.0</span> {/* Warna Kuning */}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Atas (Topbar) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-sm font-bold text-slate-700 tracking-wide uppercase">
            Panel Operasional
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-bold border border-amber-200 uppercase tracking-wider">
              Operator Mode
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}