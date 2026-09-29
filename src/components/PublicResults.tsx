import React from 'react';
import { useElection } from '../context/ElectionContext';
import { RealCount } from './RealCount';
import { ActivePage } from '../types';
import { ArrowLeft, Lock, ShieldCheck, Home } from 'lucide-react';

interface PublicResultsProps {
  setActivePage: (page: ActivePage) => void;
}

export const PublicResults: React.FC<PublicResultsProps> = ({ setActivePage }) => {
  const { settings, isAdmin } = useElection();

  const isPublicAllowed = settings.publicResultStatus === 'DITAMPILKAN' || isAdmin;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActivePage('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>

        <span className="text-xs text-slate-400 font-medium">
          Portal Transparansi Pemilu Siswa
        </span>
      </div>

      {isPublicAllowed ? (
        <RealCount isAdminView={false} />
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto border border-amber-500/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Hasil Real Count Belum Dibuka</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Panitia Pemilihan OSIS {settings.schoolName} saat ini menyembunyikan hasil perhitungan suara publik hingga waktu pemungutan suara resmi berakhir.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setActivePage('home')}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
