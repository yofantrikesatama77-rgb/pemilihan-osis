/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ElectionProvider, useElection } from './context/ElectionContext';
import { ActivePage, Candidate } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LoginNISN } from './components/LoginNISN';
import { CandidateCard } from './components/CandidateCard';
import { VotingConfirmationModal } from './components/VotingConfirmationModal';
import { SuccessPage } from './components/SuccessPage';
import { PublicResults } from './components/PublicResults';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminView } from './components/admin/AdminView';
import { ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentVoter, isAdmin, settings } = useElection();
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [chosenCandidate, setChosenCandidate] = useState<Candidate | null>(null);
  const [lastReceiptToken, setLastReceiptToken] = useState<string>('');

  const handleVoteSuccess = (receiptToken: string) => {
    setLastReceiptToken(receiptToken);
    setIsConfirmModalOpen(false);
    setActivePage('success');
  };

  const handleOpenConfirmModal = (cand: Candidate) => {
    setChosenCandidate(cand);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Universal Top Navigation */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <Hero setActivePage={setActivePage} />
        )}

        {activePage === 'login' && (
          <LoginNISN setActivePage={setActivePage} />
        )}

        {activePage === 'voting' && (
          <CandidateCard
            setActivePage={setActivePage}
            onOpenConfirmModal={handleOpenConfirmModal}
          />
        )}

        {activePage === 'success' && (
          <SuccessPage
            receiptToken={lastReceiptToken || 'VOTE-TOKEN-OK'}
            setActivePage={setActivePage}
            voterInfo={currentVoter}
          />
        )}

        {activePage === 'public-results' && (
          <PublicResults setActivePage={setActivePage} />
        )}

        {activePage === 'admin-login' && (
          <AdminLogin setActivePage={setActivePage} />
        )}

        {activePage === 'admin-dashboard' && (
          isAdmin ? (
            <AdminView setActivePage={setActivePage} />
          ) : (
            <AdminLogin setActivePage={setActivePage} />
          )
        )}
      </main>

      {/* Confirmation Modal */}
      <VotingConfirmationModal
        isOpen={isConfirmModalOpen}
        chosenCandidate={chosenCandidate}
        onClose={() => setIsConfirmModalOpen(false)}
        onSuccess={handleVoteSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">OSIS VOTE</span>
            <span aria-hidden="true">·</span>
            <span>{settings.schoolName}</span>
            <span aria-hidden="true">·</span>
            <span>Tahun Ajaran {settings.electionYear}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verifikasi NISN Terenkripsi
            </span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActivePage('admin-login')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Portal Panitia
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <ElectionProvider>
      <AppContent />
    </ElectionProvider>
  );
}
