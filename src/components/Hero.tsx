import React from 'react';
import { useElection } from '../context/ElectionContext';
import { ActivePage } from '../types';
import { DEFAULT_OSIS_EMBLEM } from '../lib/sampleData';
import { ArrowRight, CheckCircle2, ShieldCheck, Users, Sparkles, Award } from 'lucide-react';

interface HeroProps {
  setActivePage: (page: ActivePage) => void;
}

export const Hero: React.FC<HeroProps> = ({ setActivePage }) => {
  const { settings, candidates, totalVoters, votedCount, participationRate, currentVoter } = useElection();

  const isVotingOpen = settings.votingStatus === 'DIBUKA';

  const handleStartVoting = () => {
    if (currentVoter) {
      setActivePage('voting');
    } else {
      setActivePage('login');
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[300px] bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges / Kicker */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6 text-xs text-slate-400">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-sm">
            <img 
              src={settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM} 
              alt="Logo Sekolah" 
              className="w-4 h-4 rounded-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
              }}
            />
            <span className="font-semibold text-blue-400 tracking-wide">{settings.schoolName}</span>
          </div>
          <span aria-hidden="true">·</span>
          <span>Tahun Ajaran {settings.electionYear}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Sistem Satu Siswa Satu Suara (100% Rahasia & Valid)
          </span>
        </div>

        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
            SUARAMU, <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              MASA DEPAN OSIS
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 text-balance leading-relaxed">
            Gunakan hak pilihmu untuk menentukan Ketua OSIS pilihanmu. Pemilihan dilakukan secara demokratis, transparan, dan cepat dengan verifikasi NISN resmi.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartVoting}
              disabled={!isVotingOpen}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold shadow-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
                isVotingOpen
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <span>{isVotingOpen ? 'MULAI MEMILIH' : 'PEMILIHAN DITUTUP'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {settings.publicResultStatus === 'DITAMPILKAN' && (
              <button
                onClick={() => setActivePage('public-results')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lihat Hasil Real Count</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Quick Counter Summary */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card rounded-2xl p-4 text-center border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Total Pemilih DPT</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">{totalVoters}</p>
            <p className="text-[11px] text-slate-500 mt-1">Siswa Terdaftar</p>
          </div>

          <div className="glass-card rounded-2xl p-4 text-center border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Suara Masuk</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-mono tabular-nums">{votedCount}</p>
            <p className="text-[11px] text-emerald-500/90 mt-1">Telah Memilih</p>
          </div>

          <div className="glass-card rounded-2xl p-4 text-center border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Belum Memilih</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 font-mono tabular-nums">{totalVoters - votedCount}</p>
            <p className="text-[11px] text-amber-500/90 mt-1">Siswa Menunggu</p>
          </div>

          <div className="glass-card rounded-2xl p-4 text-center border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Partisipasi</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1 font-mono tabular-nums">{participationRate}%</p>
            <p className="text-[11px] text-blue-400/90 mt-1">Tingkat Kehadiran</p>
          </div>
        </div>

        {/* Featured Candidates Spotlight */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Kandidat Calon Pemimpin OSIS
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Kenali Pasangan Calon Pilihanmu
            </h3>
          </div>

          <div className={`grid grid-cols-1 ${candidates.length === 1 ? 'max-w-3xl mx-auto' : 'md:grid-cols-2'} gap-6`}>
            {candidates.map((cand) => (
              <div 
                key={cand.number} 
                className="glass-panel rounded-3xl p-6 sm:p-7 border border-blue-500/25 relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 ring-2 ring-blue-500/40 shadow-xl bg-slate-900 aspect-[4/3]">
                    <img 
                      src={cand.photoUrl} 
                      alt={`Paslon ${cand.number}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md tracking-wider">
                      PASLON {cand.number}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Nomor Urut {cand.number}
                    </span>
                    <h4 className="text-lg font-bold text-white truncate mt-0.5">
                      {cand.chairmanName}
                    </h4>
                    <p className="text-xs font-semibold text-blue-400 truncate">
                      & {cand.viceChairmanName}
                    </p>

                    <p className="mt-2.5 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      "{cand.vision}"
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    {cand.mission.length} Misi Kerja
                  </span>
                  <button
                    onClick={() => setActivePage('voting')}
                    className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    Buka Visi Misi & Coblos
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Step Guidance */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-700/50 flex items-center justify-center text-blue-400 font-bold text-lg mb-4">
              1
            </div>
            <h4 className="text-base font-bold text-white mb-1.5">Input NISN</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cukup masukkan Nomor Induk Siswa Nasional (NISN) Anda. Sistem memverifikasi status hak pilih tanpa perlu password yang rumit.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-indigo-400 font-bold text-lg mb-4">
              2
            </div>
            <h4 className="text-base font-bold text-white mb-1.5">Pelajari & Coblos</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tinjau visi, misi, dan program kerja unggulan pasangan calon. Tekan tombol coblos untuk menentukan pilihan Anda.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-lg mb-4">
              3
            </div>
            <h4 className="text-base font-bold text-white mb-1.5">Suara Sah & Real-time</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Suara Anda langsung tersimpan secara aman di database. Dapatkan bukti digital dan saksikan pergerakan Real Count langsung.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
