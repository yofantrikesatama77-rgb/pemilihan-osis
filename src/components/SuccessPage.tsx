import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ActivePage, Voter } from '../types';
import { useElection } from '../context/ElectionContext';
import { CheckCircle2, ShieldCheck, Home, BarChart3, FileCheck2 } from 'lucide-react';

interface SuccessPageProps {
  receiptToken: string;
  setActivePage: (page: ActivePage) => void;
  voterInfo: Voter | null;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  receiptToken,
  setActivePage,
  voterInfo,
}) => {
  const { settings, logoutVoter } = useElection();

  useEffect(() => {
    // Launch fireworks / confetti celebration
    try {
      const end = Date.now() + 1500;
      const colors = ['#3b82f6', '#60a5fa', '#a855f7', '#10b981'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // Confetti fallback
    }
  }, []);

  const handleFinish = () => {
    logoutVoter();
    setActivePage('home');
  };

  const nowFormatted = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12 relative">
      
      {/* Background illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-lg">
        
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl text-center relative overflow-hidden">
          
          {/* Animated Success Check Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>

          {/* Main Success Headlines */}
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            SUARA ANDA BERHASIL DIREKAM
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Terima kasih telah menggunakan hak suara Anda. Partisipasi aktifmu menentukan arah masa depan OSIS {settings.schoolName}.
          </p>

          {/* Digital Voting Receipt Card */}
          <div className="mt-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <FileCheck2 className="w-4 h-4" />
                <span>Bukti Verifikasi Pemilihan</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">RESMI</span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Nama Pemilih:</span>
                <span className="font-semibold text-white">{voterInfo?.name || 'Siswa Terdaftar'}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Kelas:</span>
                <span className="font-semibold text-white">{voterInfo?.class || '-'}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Identitas NISN:</span>
                <span className="font-mono text-slate-200">
                  {voterInfo ? `***${voterInfo.nisn.slice(-4)}` : 'Tervalidasi'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Waktu Rekam:</span>
                <span className="text-slate-300 font-mono text-[11px]">{nowFormatted}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Kode Token Audit:</span>
                <span className="font-mono text-emerald-400 font-bold tracking-wider text-[11px]">
                  {receiptToken}
                </span>
              </div>
            </div>
          </div>

          {/* Notice: No re-voting allowed */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hak suara untuk NISN ini telah ditutup dan diamankan di blockchain/database.</span>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleFinish}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Selesai & Keluar</span>
            </button>

            {settings.publicResultStatus === 'DITAMPILKAN' && (
              <button
                onClick={() => {
                  logoutVoter();
                  setActivePage('public-results');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Lihat Real Count</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
