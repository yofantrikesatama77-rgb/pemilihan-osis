import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { Candidate } from '../types';
import { DEFAULT_OSIS_EMBLEM } from '../lib/sampleData';
import { AlertTriangle, Check, X, Vote } from 'lucide-react';

interface VotingConfirmationModalProps {
  isOpen: boolean;
  chosenCandidate: Candidate | null;
  onClose: () => void;
  onSuccess: (receiptToken: string) => void;
}

export const VotingConfirmationModal: React.FC<VotingConfirmationModalProps> = ({
  isOpen,
  chosenCandidate,
  onClose,
  onSuccess,
}) => {
  const { currentVoter, castVote } = useElection();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !chosenCandidate) return null;

  const handleConfirmVote = async () => {
    if (!currentVoter) {
      setErrorMsg('Sesi pemilih tidak valid. Silakan login kembali.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await castVote(chosenCandidate.number, currentVoter.nisn);
      if (res.success && res.token) {
        onSuccess(res.token);
      } else {
        setErrorMsg(res.message);
        setIsSubmitting(false);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Terjadi kesalahan saat menyimpan suara.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Icon */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Konfirmasi Pemilihan</h3>
              <p className="text-xs text-slate-400">Pastikan pilihan Anda sudah mantap</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Snapshot */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden ring-1 ring-blue-500/40 shrink-0 bg-slate-800">
            <img
              src={chosenCandidate.photoUrl}
              alt={`Paslon ${chosenCandidate.number}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider mb-1">
              PASLON {chosenCandidate.number}
            </span>
            <h4 className="text-sm font-bold text-white truncate">{chosenCandidate.chairmanName}</h4>
            <p className="text-xs text-blue-400 truncate">& {chosenCandidate.viceChairmanName}</p>
          </div>
        </div>

        {/* Central Confirmation Text */}
        <div className="mt-6 text-center">
          <p className="text-lg sm:text-xl font-extrabold text-white">
            Apakah Anda yakin ingin memilih <span className="text-blue-400">Paslon {chosenCandidate.number}</span>?
          </p>
          <div className="mt-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200/90 text-xs flex items-start gap-2 text-left">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Suara Anda akan langsung direkam secara permanen ke database dan hak pilih NISN Anda akan terkunci (tidak dapat memilih kembali).
            </span>
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer order-2 sm:order-1"
          >
            KEMBALI
          </button>

          <button
            type="button"
            onClick={handleConfirmVote}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Merekam Suara...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>YA, SAYA YAKIN</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
