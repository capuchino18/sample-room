'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showLoading, setShowLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  // Simulasi layar loading 2 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');

    // Trik merubah Username menjadi Email agar diterima Supabase Auth bawaan
    const dummyEmail = `${username.toLowerCase().replace(/\s/g, '')}@lyman.com`;

    const { error } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: password,
    });

    if (error) {
      setErrorMsg("Username atau Password salah!");
      setIsLoggingIn(false);
    } else {
      router.push('/dashboard');
    }
  };

  // --- TAMPILAN 1: LOADING SCREEN (PUTIH, LYMAN GROUP) ---
  if (showLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center animate-pulse">
        <div className="text-4xl font-black text-slate-800 tracking-wider">
          LYMAN <span className="text-slate-400 font-light">GROUP</span>
        </div>
        <div className="mt-8 border-t-2 border-slate-200 w-16"></div>
      </div>
    );
  }

  // --- TAMPILAN 2: LOGIN FORM (MERAH, ROMAN & QUADRA) ---
  return (
    <div className="min-h-screen bg-[#E31B23] flex items-center justify-center p-4 transition-colors duration-1000">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header Logo */}
        <div className="bg-slate-900 p-8 text-center flex flex-col items-center justify-center border-b-4 border-[#FBB03B]">
          <h1 className="text-3xl font-black text-white tracking-widest">ROMAN</h1>
          <h2 className="text-lg font-semibold text-slate-400 tracking-widest mt-1">& QUADRA</h2>
          <p className="text-xs text-slate-500 mt-3 font-medium uppercase tracking-widest">Sample Room System</p>
        </div>

        {/* Form Input */}
        <div className="p-8">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg mb-6 text-center border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Username</label>
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:border-[#E31B23] outline-none font-medium transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:border-[#E31B23] outline-none font-medium transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full mt-8 bg-[#E31B23] hover:bg-[#c9141b] text-white py-4 rounded-xl font-bold tracking-wider uppercase transition shadow-lg disabled:opacity-70"
            >
              {isLoggingIn ? 'Memverifikasi...' : 'Masuk Ke Sistem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}