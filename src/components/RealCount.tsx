import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { DEFAULT_OSIS_EMBLEM } from '../lib/sampleData';
import { downloadElectionReportPdf } from '../lib/pdfReport';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  TrendingUp,
  FileDown,
  Check
} from 'lucide-react';

interface RealCountProps {
  isAdminView?: boolean;
}

export const RealCount: React.FC<RealCountProps> = ({ isAdminView = false }) => {
  const {
    candidates,
    settings,
    totalVoters,
    votedCount,
    unvotedCount,
    totalVotes,
    participationRate,
    candidateStats,
    syncWithSupabase,
    voters,
    votes
  } = useElection();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await syncWithSupabase();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Class breakdown metrics
  const classBreakdown = React.useMemo(() => {
    const map = new Map<string, { total: number; voted: number }>();
    voters.forEach(v => {
      const clsPrefix = v.class.split(' ')[0] || v.class;
      const cur = map.get(clsPrefix) || { total: 0, voted: 0 };
      cur.total += 1;
      if (v.hasVoted) cur.voted += 1;
      map.set(clsPrefix, cur);
    });

    return Array.from(map.entries()).map(([cls, data]) => ({
      classGroup: cls,
      total: data.total,
      voted: data.voted,
      pct: data.total > 0 ? Math.round((data.voted / data.total) * 100) : 0
    }));
  }, [voters]);

  const colorPalette = [
    { bg: 'from-blue-500 to-indigo-600', ring: 'ring-blue-500', bar: 'bg-blue-500', text: 'text-blue-400' },
    { bg: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-400' },
    { bg: 'from-purple-500 to-pink-600', ring: 'ring-purple-500', bar: 'bg-purple-500', text: 'text-purple-400' },
    { bg: 'from-amber-500 to-orange-600', ring: 'ring-amber-500', bar: 'bg-amber-500', text: 'text-amber-400' },
  ];

  return (
    <div className={`space-y-8 ${isFullscreen ? 'p-8 bg-slate-950 min-h-screen' : ''}`}>
      
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 p-1 border border-blue-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
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
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live Real Count
              </span>
              <span className="text-xs text-slate-500">· {candidates.length} Paslon Terdaftar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Hasil Suara Pemilihan Ketua OSIS
            </h2>
            <p className="text-xs text-slate-400">{settings.schoolName} – Periode {settings.electionYear}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh Berita Acara & Hasil Pemilihan Format PDF Resmi dengan Logo & Nama Sekolah"
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

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="Sinkronisasi Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-semibold text-blue-300 transition-colors flex items-center gap-1.5"
            title="Layar Penuh (Cocok untuk Proyektor Aula)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Keluar Fullscreen' : 'Mode Proyektor'}</span>
          </button>
        </div>
      </div>

      {/* 4 Big KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Pemilih */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total DPT</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
            {totalVoters}
          </p>
          <p className="text-xs text-slate-500 mt-1">Siswa Terdaftar</p>
        </div>

        {/* Sudah Memilih / Suara Masuk */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 relative overflow-hidden bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sudah Memilih</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {votedCount}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-500/90 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{participationRate}% Partisipasi</span>
          </div>
        </div>

        {/* Belum Memilih */}
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 relative overflow-hidden bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Belum Memilih</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums">
            {unvotedCount}
          </p>
          <p className="text-xs text-amber-500/90 mt-1">
            {totalVoters > 0 ? Math.round((unvotedCount / totalVoters) * 100) : 0}% Belum Coblos
          </p>
        </div>

        {/* Total Suara Masuk */}
        <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 relative overflow-hidden bg-indigo-950/20">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Suara Sah</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-indigo-300 font-mono tabular-nums">
            {totalVotes}
          </p>
          <p className="text-xs text-indigo-400/90 mt-1">Terekam di Database</p>
        </div>

      </div>

      {/* Grid of All Candidates Real Count */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Perolehan Suara Pasangan Calon
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {totalVotes} total suara masuk
          </span>
        </div>

        <div className={`grid grid-cols-1 ${candidateStats.length === 1 ? 'lg:grid-cols-1 max-w-2xl' : candidateStats.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          {candidateStats.map((stat, idx) => {
            const color = colorPalette[idx % colorPalette.length];
            return (
              <div
                key={stat.candidate.number}
                className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-600 text-white shadow">
                      PASLON {stat.candidate.number}
                    </span>
                    <span className={`text-xs font-mono font-bold ${color.text}`}>
                      {stat.percentage}% Suara
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-2 ring-slate-700 shrink-0 bg-slate-900">
                      <img
                        src={stat.candidate.photoUrl}
                        alt={`Paslon ${stat.candidate.number}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-white truncate">{stat.candidate.chairmanName}</h4>
                      <p className="text-xs text-blue-400 truncate mt-0.5">& {stat.candidate.viceChairmanName}</p>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic">
                        "{stat.candidate.vision}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vote Figure & Progress bar */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Total Suara</span>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-3xl font-black text-white tabular-nums">{stat.votes}</span>
                      <span className="text-xs text-slate-400">suara</span>
                    </div>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${color.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                    <span>Persentase dari suara sah</span>
                    <span className="font-bold text-white font-mono">{stat.percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turnout Donut Visualization & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Progress Bars comparison (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Perbandingan Suara Antar Pasangan Calon
          </h4>
          <p className="text-xs text-slate-400 mb-6">
            Visualisasi distribusi suara yang telah masuk ke sistem
          </p>

          <div className="space-y-5">
            {candidateStats.map((stat, idx) => {
              const color = colorPalette[idx % colorPalette.length];
              return (
                <div key={stat.candidate.number} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">
                      Paslon {stat.candidate.number}: {stat.candidate.chairmanName} & {stat.candidate.viceChairmanName}
                    </span>
                    <span className="font-mono font-bold text-slate-300">
                      {stat.votes} suara ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${color.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Turnout Donut (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Statistik Partisipasi Siswa
            </h4>
            <p className="text-xs text-slate-400">Rasio suara masuk terhadap daftar pemilih tetap</p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-blue-500 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={`${(participationRate / 100) * 238.76} 238.76`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-mono tabular-nums">
                  {participationRate}%
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Kehadiran
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-500" />
                <span>Suara Masuk</span>
              </div>
              <span className="font-mono font-bold text-white">{votedCount} Siswa</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-700" />
                <span>Belum Memilih</span>
              </div>
              <span className="font-mono font-bold text-white">{unvotedCount} Siswa</span>
            </div>
          </div>

        </div>

      </div>

      {/* Class Level Participation Breakdown */}
      {classBreakdown.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Partisipasi Per Jenjang Kelas</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classBreakdown.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-200">{item.classGroup}</span>
                  <span className="text-xs font-mono font-bold text-blue-400">{item.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{item.voted} memilih</span>
                  <span>dari {item.total} siswa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
