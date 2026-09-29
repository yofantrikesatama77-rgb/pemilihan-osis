import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { AdminTab } from '../../types';
import { DEFAULT_OSIS_EMBLEM } from '../../lib/sampleData';
import { downloadElectionReportPdf } from '../../lib/pdfReport';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp, 
  Power, 
  ShieldCheck, 
  Database, 
  ArrowRight,
  Sparkles,
  FileDown,
  RefreshCw,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const {
    settings,
    totalVoters,
    votedCount,
    unvotedCount,
    totalVotes,
    participationRate,
    votes,
    voters,
    updateSettings,
    supabaseConnected,
    candidate,
    candidates
  } = useElection();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadElectionReportPdf({
        settings,
        candidates,
        votes,
        voters,
        totalVoters,
        votedCount,
        unvotedCount,
        participationRate,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isVotingOpen = settings.votingStatus === 'DIBUKA';

  const toggleVotingStatus = async () => {
    const nextStatus = isVotingOpen ? 'DITUTUP' : 'DIBUKA';
    await updateSettings({ votingStatus: nextStatus });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Voting Control Strip */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 p-1.5 border border-blue-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            <img 
              src={settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM} 
              alt="Logo Sekolah" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
              }}
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pusat Kendali Pemilihan OSIS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Panitia Pemilihan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {settings.schoolName} · Tahun Pelaksanaan {settings.electionYear}
            </p>
          </div>
        </div>

        {/* Actions Strip: Download PDF & Voting Switch */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Unduh Berita Acara & Hasil Pemilihan Format PDF Resmi dengan Kop Surat Sekolah"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>PDF Terunduh!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Unduh Laporan (PDF)</span>
              </>
            )}
          </button>

          {/* Voting Switch */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
            <div className="text-right">
              <p className="text-xs font-bold text-white">Status</p>
              <p className={`text-[11px] font-semibold ${isVotingOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isVotingOpen ? 'Berlangsung' : 'Tutup'}
              </p>
            </div>

            <button
              onClick={toggleVotingStatus}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                isVotingOpen
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isVotingOpen ? 'TUTUP' : 'BUKA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Big Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Pemilih */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Pemilih</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">{totalVoters}</p>
          <p className="text-[11px] text-slate-500 mt-1">DPT Terdaftar</p>
        </div>

        {/* Sudah Memilih */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sudah Memilih</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">{votedCount}</p>
          <p className="text-[11px] text-emerald-500 mt-1">Hak Suara Terpakai</p>
        </div>

        {/* Belum Memilih */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-amber-500/30 bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Belum Memilih</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">{unvotedCount}</p>
          <p className="text-[11px] text-amber-500 mt-1">Menunggu Voting</p>
        </div>

        {/* Total Suara */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Suara</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono tabular-nums">{totalVotes}</p>
          <p className="text-[11px] text-indigo-400 mt-1">Surat Suara Masuk</p>
        </div>

        {/* Partisipasi */}
        <div className="col-span-2 sm:col-span-1 glass-card rounded-2xl p-4 sm:p-5 border border-blue-500/30 bg-blue-950/20">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Partisipasi</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono tabular-nums">{participationRate}%</p>
          <p className="text-[11px] text-blue-300/80 mt-1">Tingkat Kehadiran</p>
        </div>

      </div>

      {/* Quick Navigation Cards & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Paslon Quick Info & Shortcuts (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Kandidat Terdaftar ({candidates.length} Paslon)
              </h3>
              <button
                onClick={() => setActiveTab('candidate')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Paslon</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {candidates.map((cand) => (
                <div key={cand.number} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-blue-500/40 shrink-0 bg-slate-800">
                    <img
                      src={cand.photoUrl}
                      alt={`Paslon ${cand.number}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white mb-0.5">
                      PASLON {cand.number}
                    </span>
                    <p className="text-xs font-bold text-white truncate">{cand.chairmanName}</p>
                    <p className="text-[11px] text-blue-400 truncate">& {cand.viceChairmanName}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <button
                onClick={() => setActiveTab('voters')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Kelola Data DPT</span>
              </button>

              <button
                onClick={() => setActiveTab('realcount')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Buka Real Count</span>
              </button>
            </div>
          </div>

          {/* Database Health Badge */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">Database Supabase</p>
                <p className="text-[11px] text-slate-400">
                  {supabaseConnected ? 'Terhubung & Sinkronisasi Aktif' : 'Terkonfigurasi (Mode Resilien)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs font-semibold text-indigo-400 hover:underline"
            >
              Lihat Skema SQL
            </button>
          </div>
        </div>

        {/* Live Vote Audit Stream (6 cols) */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Aktivitas Suara Masuk Terkini
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{votes.length} tercatat</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {votes.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Belum ada suara masuk yang terekam.
              </div>
            ) : (
              votes.slice(0, 7).map((vt, i) => (
                <div
                  key={vt.voteId || i}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                      01
                    </div>
                    <div>
                      <p className="font-semibold text-white">Suara Sah Tercatat</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {vt.maskedNisn || 'NISN Terverifikasi'} · {vt.token || 'TOKEN-AUDIT'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(vt.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
