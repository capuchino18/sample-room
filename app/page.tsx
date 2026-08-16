'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { // PIN sementara untuk demo
      router.push('/dashboard');
    } else {
      setError('PIN tidak valid. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      
      {/* Logo Lyman Group */}
      <div className="mb-12">
        <img src="/lyman.png" alt="Lyman Group Logo" className="h-24 md:h-32 object-contain" />
      </div>

      {/* Form Login (Operator Access) */}
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Sample Room Portal</h2>
        <p className="text-sm text-slate-500 text-center mb-8">Masukkan PIN Operator untuk mengakses sistem.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Masukkan PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center tracking-widest text-lg p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-[#E51921] hover:bg-[#C4131A] text-white py-3 rounded-lg font-bold tracking-wide transition shadow-md"
          >
            MASUK
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Lyman Group. Internal Use Only.</p>
        </div>
      </div>

    </div>
  );
}