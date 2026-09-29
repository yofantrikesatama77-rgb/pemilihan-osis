import React, { useState } from 'react';
import { ActivePage, AdminTab } from '../../types';
import { useElection } from '../../context/ElectionContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { VoterTable } from './VoterTable';
import { CandidateManagement } from './CandidateManagement';
import { RealCount } from '../RealCount';
import { ElectionSettings } from './ElectionSettings';

interface AdminViewProps {
  setActivePage: (page: ActivePage) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ setActivePage }) => {
  const { logoutAdmin } = useElection();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const handleLogout = () => {
    logoutAdmin();
    setActivePage('home');
  };

  const handleViewPublic = () => {
    setActivePage('home');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onViewPublic={handleViewPublic}
        />

        {/* Content Area */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'overview' && (
            <AdminDashboard setActiveTab={setActiveTab} />
          )}

          {activeTab === 'voters' && (
            <VoterTable />
          )}

          {activeTab === 'candidate' && (
            <CandidateManagement />
          )}

          {activeTab === 'realcount' && (
            <RealCount isAdminView={true} />
          )}

          {activeTab === 'settings' && (
            <ElectionSettings />
          )}
        </main>

      </div>
    </div>
  );
};
