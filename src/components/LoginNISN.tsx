import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { ActivePage, Voter } from '../types';
import { DEFAULT_OSIS_EMBLEM } from '../lib/sampleData';
import { ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, UserCheck, KeyRound, Sparkles } from 'lucide-react';

interface LoginNISNProps {
  setActivePage: (page: ActivePage) => void;
}

export const LoginNISN: React.FC<LoginNISNProps> = ({ setActivePage }) => {
  const { loginWithNisn, voters, settings } = useElection();
  const [nisnInput, setNisnInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    const clean = nisnInput.trim();
    if (!clean) {
      setErrorMessage('Silakan masukkan nomor NISN Anda terlebih dahulu.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const result = loginWithNisn(clean);
      setIsVerifying(false);

      if (!result.success) {
        setErrorMessage(result.message);
      } else {
        setSuccessInfo(result.message);
        setTimeout(() => {
          setActivePage('voting');
        }, 600);
      }
    }, 300);
  };

  // Quick helper to fill test NISNs
  const pickDemoNisn = (nisn: string) => {
    setNisnInput(nisn);
    setErrorMessage(null);
  };

  const sampleUnvoted = voters.find(v => !v.hasVoted);
  const sampleVoted = voters.find(v => v.hasVoted);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12 relative">
      
      {/* Background illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <button
          onClick={() => setActivePage('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>

        {/* Card Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/25 shadow-2xl relative overflow-hidden">
          
          <div className="text-center">
            {/* School Logo & Icon */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-blue-500/40 p-1.5 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                <img
                  src={settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                  }}
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-[11px] font-semibold text-blue-300 mb-2">
              <span>{settings.schoolName}</span>
              <span>·</span>
              <span>T.A. {settings.electionYear}</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Otentikasi Pemilih
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
              Masukkan 10 digit Nomor Induk Siswa Nasional (NISN) Anda untuk masuk ke Bilik Suara.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="nisn" className="block text-xs font-semibold text-slate-300 mb-2">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              
              <div className="relative">
                <input
                  id="nisn"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  placeholder="Contoh: 0078123403"
                  value={nisnInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setNisnInput(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoFocus
                  className="w-full px-4 py-3.5 bg-slate-900/90 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-xl text-white font-mono text-lg tracking-wider placeholder:text-slate-600 placeholder:text-sm transition-all outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                * Tanpa password. Cukup masukkan NISN terdaftar.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Feedback Alert */}
            {successInfo && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-relaxed">{successInfo}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || !nisnInput.trim() || settings.votingStatus === 'DITUTUP'}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Data...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk ke Bilik Suara</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper for Evaluation & Testing */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Bantuan Cepat Pengujian:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {sampleUnvoted && (
                <button
                  type="button"
                  onClick={() => pickDemoNisn(sampleUnvoted.nisn)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-blue-500/50 transition-colors"
                  title={`Siswa: ${sampleUnvoted.name} (${sampleUnvoted.class})`}
                >
                  Belum Memilih ({sampleUnvoted.nisn})
                </button>
              )}
              {sampleVoted && (
                <button
                  type="button"
                  onClick={() => pickDemoNisn(sampleVoted.nisn)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700/80 hover:border-rose-500/50 transition-colors"
                  title={`Siswa: ${sampleVoted.name} (Sudah memilih)`}
                >
                  Sudah Memilih ({sampleVoted.nisn})
                </button>
              )}
            </div>
          </div>

          {/* Security Note Footer */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Enkripsi Suara OSIS – Privasi Terjaga</span>
          </div>

        </div>

      </div>
    </div>
  );
};
