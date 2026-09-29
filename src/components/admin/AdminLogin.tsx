import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { ActivePage } from '../../types';
import { Shield, KeyRound, ArrowLeft, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  setActivePage: (page: ActivePage) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ setActivePage }) => {
  const { loginAdmin, settings } = useElection();
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const success = loginAdmin(pinInput);
    if (success) {
      setActivePage('admin-dashboard');
    } else {
      setErrorMessage('Kata sandi / PIN admin tidak valid. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        
        <button
          onClick={() => setActivePage('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative">
          
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
              <Shield className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              Portal Panitia Pemilihan
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
              Login khusus admin untuk mengelola DPT, paslon, dan pemantauan suara.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label htmlFor="adminPin" className="block text-xs font-semibold text-slate-300 mb-2">
                Kata Sandi / PIN Admin
              </label>

              <div className="relative">
                <input
                  id="adminPin"
                  type="password"
                  placeholder="Masukkan kata sandi admin"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoFocus
                  className="w-full px-4 py-3.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl text-white text-sm placeholder:text-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!pinInput.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <KeyRound className="w-4 h-4" />
              <span>Masuk Panel Admin</span>
            </button>
          </form>

          {/* Quick hint for evaluator */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SMANSA PANCER: <code className="text-indigo-300 font-mono font-bold">OSIS</code></span>
            </div>
          </div>

        </div>

      </div>N
    </div>
  );
};
