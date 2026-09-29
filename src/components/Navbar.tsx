import React from 'react';
import { useElection } from '../context/ElectionContext';
import { ActivePage } from '../types';
import { DEFAULT_OSIS_EMBLEM } from '../lib/sampleData';
import { Vote as VoteIcon, Shield, BarChart3, Home, LogOut, UserCheck } from 'lucide-react';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { settings, currentVoter, logoutVoter, isAdmin, logoutAdmin, supabaseConnected } = useElection();

  const isVotingOpen = settings.votingStatus === 'DIBUKA';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark & Emblem */}
        <button 
          onClick={() => setActivePage('home')}
          className="flex items-center gap-3.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-blue-500/30 shadow-md shadow-blue-500/10 group-hover:ring-blue-400 transition-all bg-slate-900 shrink-0">
            <img 
              src={settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM} 
              alt="Logo Sekolah" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
              }}
            />
            <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                OSIS VOTE
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-blue-300 bg-blue-950/80 border border-blue-800/60 rounded">
                DIGITAL
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[180px] sm:max-w-[260px]">
              {settings.schoolName}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={() => setActivePage('home')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activePage === 'home'
                ? 'text-white bg-slate-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Home className="w-4 h-4" />
            Beranda
          </button>

          <button
            onClick={() => {
              if (currentVoter) {
                setActivePage('voting');
              } else {
                setActivePage('login');
              }
            }}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activePage === 'login' || activePage === 'voting'
                ? 'text-white bg-slate-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <VoteIcon className="w-4 h-4 text-blue-400" />
            Bilik Suara
          </button>

          {(settings.publicResultStatus === 'DITAMPILKAN' || isAdmin) && (
            <button
              onClick={() => setActivePage('public-results')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activePage === 'public-results'
                  ? 'text-white bg-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Real Count
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActivePage('admin-dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activePage === 'admin-dashboard'
                  ? 'text-white bg-indigo-950/80 border border-indigo-700/50 shadow-sm'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              Panel Admin
            </button>
          )}
        </nav>

        {/* Zone 3: Status & Account Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Status Pemilihan Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-900/80 border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isVotingOpen ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isVotingOpen ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            <span className={`text-xs ${isVotingOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isVotingOpen ? 'Voting Dibuka' : 'Voting Ditutup'}
            </span>
          </div>

          {/* Active Voter Session Badge */}
          {currentVoter && !isAdmin && (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{currentVoter.name}</p>
                <p className="text-[11px] text-blue-400">{currentVoter.class}</p>
              </div>
              <button
                onClick={() => {
                  logoutVoter();
                  setActivePage('home');
                }}
                title="Keluar dari sesi pemilih"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Admin Button / Logout */}
          {isAdmin ? (
            <button
              onClick={() => {
                logoutAdmin();
                setActivePage('home');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setActivePage('admin-login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
