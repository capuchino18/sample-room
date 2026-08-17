'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Sampel', path: '/dashboard/samples' },
    { name: 'Riwayat', path: '/dashboard/riwayat' },
    { name: 'Stok Opname', path: '/dashboard/stock-opname' },
    { name: 'Data Sales', path: '/dashboard/sales' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Bagian Hitam */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">SAMPLE ROOM</h1>
          <p className="text-xs text-slate-400 mt-1">ROMAN & QUADRA</p>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`block px-6 py-3 text-sm font-medium transition ${
                pathname === item.path ? 'bg-[#E31B23] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content - Bagian Putih */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}