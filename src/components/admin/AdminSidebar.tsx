import React from 'react';
import { AdminTab } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewPublic: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  onViewPublic,
}) => {
  const menuItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'voters', label: 'Data Pemilih', icon: <Users className="w-4 h-4" /> },
    { id: 'candidate', label: 'Data Paslon', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'realcount', label: 'Real Count', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 glass-panel rounded-2xl lg:rounded-3xl p-3 sm:p-4 border border-slate-800 flex lg:flex-col justify-between gap-4">
      <div className="w-full">
        
        {/* Navigation list */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom utility actions */}
      <div className="hidden lg:flex flex-col gap-1.5 pt-4 border-t border-slate-800">
        <button
          onClick={onViewPublic}
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors flex items-center justify-between"
        >
          <span>Buka Tampilan Pemilih</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onLogout}
          className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi Admin</span>
        </button>
      </div>
    </aside>
  );
};
