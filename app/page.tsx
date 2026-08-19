'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  // Cek jika sudah pernah login sebelumnya di device ini
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('sample_room_logged_in');
    if (isLoggedIn === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cek apakah PIN benar
    if (pin === '1234') {
      setIsLoading(true);
      setError(false);
      
      // SIMPAN STATUS LOGIN DI BROWSER DEVICE INI
      localStorage.setItem('sample_room_logged_in', 'true');
      
      // Memberikan jeda waktu (1.5 detik) agar logo Lyman terlihat, lalu pindah ke dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } else {
      // Jika PIN salah
      setError(true);
      setPin('');
    }
  };

  // --- TAMPILAN SAAT LOADING ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <img 
          src="/lyman.png" 
          alt="Lyman Logo" 
          className="w-48 md:w-64 h-auto animate-pulse" 
        />
        <p className="mt-4 text-slate-400 font-semibold tracking-wider text-sm">MEMUAT DATA...</p>
      </div>
    );
  }

  // --- TAMPILAN HALAMAN LOGIN (PIN) ---
  return (
    <div className="min-h-screen bg-[#E31B23] flex flex-col items-center justify-center p-6">
      
      {/* Bagian Judul */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-wider mb-2 drop-shadow-md">
          ROMAN & QUADRA
        </h1>
        <h2 className="text-lg md:text-xl font-bold text-white/90 tracking-widest drop-shadow-sm">
          SAMPEL ROOM
        </h2>
      </div>

      {/* Form Input PIN */}
      <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-xs">
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          placeholder="masukkan PIN"
          className="w-full bg-white text-center px-4 py-5 rounded-2xl text-4xl tracking-[0.3em] font-black text-slate-900 mb-6 outline-none focus:ring-4 focus:ring-black/20 transition-all placeholder:text-slate-400 placeholder:text-lg placeholder:tracking-normal placeholder:font-medium shadow-lg"
        />
        
        {/* Pesan Error jika PIN salah */}
        {error && (
          <p className="text-white bg-black/40 px-4 py-2 rounded-lg mb-6 text-sm font-semibold animate-bounce">
            ❌ PIN Salah! Silakan coba lagi.
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white font-bold text-lg py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-xl active:scale-95"
        >
          MASUK
        </button>
      </form>
      
    </div>
  );
}