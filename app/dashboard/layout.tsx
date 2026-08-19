'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Proteksi rute dashboard: cek status login PIN di localStorage.
  // Menggantikan proteksi middleware Supabase Auth yang sebelumnya
  // menyebabkan 404 karena mengarah ke rute /login yang tidak ada.
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('sample_room_logged_in');
    if (isLoggedIn !== 'true') {
      router.replace('/');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-semibold text-sm">MEMERIKSA SESI...</p>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Sampel', path: '/dashboard/samples' },
    { name: 'Riwayat', path: '/dashboard/riwayat' },
    { name: 'Stok Opname', path: '/dashboard/stock-opname' },
    { name: 'Data Sales', path: '/dashboard/sales' },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      
      {/* Tombol Hamburger untuk HP - Dipindah ke posisi kanan atas atau mengambang rapi */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg font-bold text-sm flex items-center gap-2"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕ Tutup' : '☰ Menu'}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 w-64 h-full bg-slate-900 text-white flex-shrink-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 pt-8 md:pt-6">
          <h1 className="text-xl font-bold text-white tracking-wider">SAMPLE ROOM</h1>
          <p className="text-xs text-slate-400 mt-1">ROMAN & QUADRA</p>
        </div>
        
        <nav className="mt-4 flex flex-col gap-1">
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

      {/* Overlay hitam transparan saat sidebar terbuka di HP */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto w-full">
        <div className="pt-20 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}