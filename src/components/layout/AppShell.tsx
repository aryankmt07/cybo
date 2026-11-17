import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckSquare,
  Home,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminTab, AppRoute } from '../../types';
import { Button } from '../ui/Primitives';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, children }) => {
  const { currentUser, route, adminTab, navigate, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const learnerNav: { route: AppRoute; label: string; icon: React.ReactNode }[] = [
    { route: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4 shrink-0" /> },
    { route: 'modules', label: 'Learning Modules', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { route: 'scenarios', label: 'Threat Scenarios', icon: <ShieldAlert className="w-4 h-4 shrink-0" /> },
    { route: 'quiz', label: 'Cybersecurity Quiz', icon: <CheckSquare className="w-4 h-4 shrink-0" /> },
    { route: 'feedback', label: 'Learning Feedback', icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
    { route: 'progress', label: 'Results & Progress', icon: <Award className="w-4 h-4 shrink-0" /> },
  ];

  const adminNav: { tab: AdminTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'analytics', label: 'Analytics Overview', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    { tab: 'users', label: 'User Management', icon: <Users className="w-4 h-4 shrink-0" /> },
    { tab: 'lessons', label: 'Manage Lessons', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { tab: 'quizzes', label: 'Manage Quiz Bank', icon: <CheckSquare className="w-4 h-4 shrink-0" /> },
    { tab: 'scenarios', label: 'Manage Scenarios', icon: <ShieldAlert className="w-4 h-4 shrink-0" /> },
  ];

  const handleNavClick = (target: AppRoute, tab?: AdminTab) => {
    setSidebarOpen(false);
    navigate(target, tab ? { adminTab: tab } : undefined);
  };

  return (
    <div className="min-h-screen flex bg-[#F5F8FC]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0B1220]/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1220] text-slate-300 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary Workspace Navigation"
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <button
            onClick={() => handleNavClick(isAdmin ? 'admin' : 'dashboard')}
            className="flex items-center gap-2.5 text-white font-display font-bold text-lg tracking-tight cursor-pointer whitespace-nowrap"
          >
            <span className="w-8 h-8 rounded-lg bg-[#111C33] border border-[#22D3EE]/30 text-[#22D3EE] inline-flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>CyberShield</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {isAdmin && (
            <>
              <div className="px-3 pt-1 pb-2 text-xs font-medium text-slate-400">Admin Console</div>
              {adminNav.map((item) => {
                const active = route === 'admin' && adminTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleNavClick('admin', item.tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
              <div className="px-3 pt-5 pb-2 text-xs font-medium text-slate-400">Learner Preview</div>
            </>
          )}

          {!isAdmin && (
            <div className="px-3 pt-1 pb-2 text-xs font-medium text-slate-400">Learning Workspace</div>
          )}

          {learnerNav.map((item) => {
            const active = route === item.route || (item.route === 'modules' && route === 'lesson');
            return (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active ? 'bg-[#2563EB] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3.5 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-400 capitalize">{currentUser.role}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-7 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display font-semibold text-[15px] text-[#0F172A] truncate">{title}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {route !== 'scenarios' && (
              <Button variant="secondary" size="sm" onClick={() => navigate('scenarios')}>
                <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                <span className="hidden sm:inline">Threat Lab</span>
              </Button>
            )}
            {route !== 'quiz' && (
              <Button variant="primary" size="sm" onClick={() => navigate('quiz')}>
                Take Quiz
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-7 max-w-[1280px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
