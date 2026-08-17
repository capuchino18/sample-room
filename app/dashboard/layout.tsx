'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Sampel', path: '/dashboard/samples' },
    { name: 'Riwayat', path: '/dashboard/riwayat' },
    { name: 'Stok Opname', path: '/dashboard/stock-opname' },
    { name: 'Data Sales', path: '/dashboard/sales' },
  ];

  return (
    // PERUBAHAN UTAMA: Menggunakan h-screen dan overflow-hidden agar sidebar tidak pernah terpotong
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Tombol Hamburger untuk HP */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        Menu
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 w-64 h-full bg-slate-900 text-white flex-shrink-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">SAMPLE ROOM</h1>
          <p className="text-xs text-slate-400 mt-1">ROMAN & QUADRA</p>
        </div>
        
        <nav className="mt-6 flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setIsSidebarOpen(false)} 
              className={`block px-6 py-3 text-sm font-medium transition ${
                pathname === item.path ? 'bg-[#E31B23] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay hitam saat sidebar terbuka di HP */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content - Bagian ini yang akan memiliki scrollbar sendiri jika kontennya panjang */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}