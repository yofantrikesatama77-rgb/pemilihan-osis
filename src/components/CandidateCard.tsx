import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { ActivePage, Candidate } from '../types';
import { DEFAULT_OSIS_EMBLEM } from '../lib/sampleData';
import { Vote, ArrowLeft, CheckCircle, Target, Sparkles, User, Award, BookOpen, ChevronRight } from 'lucide-react';

interface CandidateCardProps {
  setActivePage: (page: ActivePage) => void;
  onOpenConfirmModal: (chosenCandidate: Candidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ setActivePage, onOpenConfirmModal }) => {
  const { candidates, currentVoter, settings } = useElection();
  const [selectedCandidateNumber, setSelectedCandidateNumber] = useState<string>(candidates[0]?.number || '01');
  const [activeTab, setActiveTab] = useState<'visi-misi' | 'program'>('visi-misi');

  // Currently inspected candidate
  const activeCandidate = candidates.find(c => c.number === selectedCandidateNumber) || candidates[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Top Breadcrumb & Active Voter Session Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setActivePage('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>

        {currentVoter ? (
          <div className="glass-card px-4 py-2 rounded-xl border border-blue-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{currentVoter.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{currentVoter.class}</span>
                <span aria-hidden="true">·</span>
                <span>NISN: ***{currentVoter.nisn.slice(-4)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
            <span>Mode Peninjauan (Belum Login NISN)</span>
            <button
              onClick={() => setActivePage('login')}
              className="underline font-bold hover:text-white"
            >
              Login di sini
            </button>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-xs font-semibold text-blue-300 mb-2">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span>Surat Suara Digital – Terdapat {candidates.length} Pasangan Calon</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tentukan Pilihan Ketua & Wakil Ketua OSIS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pelajari visi, misi, dan program kerja masing-masing pasangan calon sebelum memberikan hak suara.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-blue-500/30 flex items-center justify-center overflow-hidden">
            <img 
              src={settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM} 
              alt="Logo Sekolah" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
              }}
            />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white max-w-[170px] truncate">{settings.schoolName}</p>
            <p className="text-[10px] text-blue-400">Periode {settings.electionYear}</p>
          </div>
        </div>
      </div>

      {/* Candidate Selector Tabs (when more than 1 candidate) */}
      {candidates.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {candidates.map((cand) => {
            const isSelected = cand.number === activeCandidate?.number;
            return (
              <button
                key={cand.number}
                type="button"
                onClick={() => setSelectedCandidateNumber(cand.number)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-blue-500/40 shrink-0 bg-slate-800">
                  <img
                    src={cand.photoUrl}
                    alt={cand.chairmanName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      PASLON {cand.number}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-blue-400">Aktif</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-1">{cand.chairmanName}</p>
                  <p className="text-[11px] text-slate-400 truncate">& {cand.viceChairmanName}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Ballot Card for Active Candidate */}
      {activeCandidate && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-blue-500/25 shadow-2xl">
          
          {/* Card Header Strip */}
          <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Surat Suara Elektronik Resmi · PASLON {activeCandidate.number}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {settings.electionYear}
            </span>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Candidate Photo & Number Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                
                <div className="relative w-full max-w-sm rounded-2xl overflow-hidden ring-4 ring-blue-500/30 shadow-2xl group bg-slate-900 aspect-[4/3]">
                  {/* Paslon Number Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white font-extrabold text-sm sm:text-base px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-blue-400/40">
                    <Award className="w-4 h-4" />
                    <span>PASLON {activeCandidate.number}</span>
                  </div>

                  {/* Candidate Single Photo */}
                  <img
                    src={activeCandidate.photoUrl}
                    alt={`Paslon ${activeCandidate.number} - ${activeCandidate.chairmanName} & ${activeCandidate.viceChairmanName}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-3 left-3 right-3 text-center sm:text-left">
                    <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                      Kandidat Pasangan Calon
                    </p>
                    <p className="text-sm font-bold text-white truncate">
                      {settings.schoolName}
                    </p>
                  </div>
                </div>

                {/* Names Under Photo */}
                <div className="mt-5 text-center w-full">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Calon Ketua OSIS</p>
                    <p className="text-base sm:text-lg font-bold text-white">{activeCandidate.chairmanName}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mt-2">
                    <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Calon Wakil Ketua OSIS</p>
                    <p className="text-base sm:text-lg font-bold text-white">{activeCandidate.viceChairmanName}</p>
                  </div>
                </div>

              </div>

              {/* Candidate Details & Vision/Mission (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full">
                
                <div>
                  {/* Tabs */}
                  <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
                    <button
                      onClick={() => setActiveTab('visi-misi')}
                      className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'visi-misi'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      <span>Visi & Misi</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('program')}
                      className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'program'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Program Unggulan</span>
                    </button>
                  </div>

                  {/* Tab Content: Visi Misi */}
                  {activeTab === 'visi-misi' ? (
                    <div className="space-y-5">
                      {/* Vision */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Visi</span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                          "{activeCandidate.vision}"
                        </p>
                      </div>

                      {/* Mission */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                          <CheckCircle className="w-4 h-4" />
                          <span>Misi</span>
                        </div>
                        <ul className="space-y-2.5">
                          {activeCandidate.mission.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                              <span className="w-5 h-5 rounded-md bg-blue-950 border border-blue-800/80 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* Tab Content: Programs */
                    <div className="space-y-3">
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                          <Sparkles className="w-4 h-4" />
                          <span>Agenda & Program Kerja Prioritas</span>
                        </div>
                        <div className="space-y-3">
                          {(activeCandidate.programs || []).map((prog, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                              <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                ★
                              </div>
                              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                                {prog}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Big Action Voting Button */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => {
                      if (!currentVoter) {
                        setActivePage('login');
                      } else {
                        onOpenConfirmModal(activeCandidate);
                      }
                    }}
                    className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base sm:text-lg tracking-wide shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    <Vote className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>COBLOS PASLON {activeCandidate.number}</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2.5">
                    {currentVoter
                      ? `Tekan tombol di atas untuk memilih ${activeCandidate.chairmanName} & ${activeCandidate.viceChairmanName} (Paslon ${activeCandidate.number}).`
                      : '* Silakan login dengan NISN Anda terlebih dahulu untuk mencoblos.'}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Grid of Other Candidates if multiple */}
      {candidates.length > 1 && (
        <div className="mt-10">
          <h3 className="text-base font-bold text-white mb-4">
            Daftar Lengkap Seluruh Paslon
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((cand) => (
              <div 
                key={cand.number}
                className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden ring-1 ring-blue-500/40 shrink-0 bg-slate-800">
                    <img
                      src={cand.photoUrl}
                      alt={cand.chairmanName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      PASLON {cand.number}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate mt-1">{cand.chairmanName}</h4>
                    <p className="text-xs text-blue-400 truncate">& {cand.viceChairmanName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCandidateNumber(cand.number);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-semibold text-slate-300 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Detail</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
