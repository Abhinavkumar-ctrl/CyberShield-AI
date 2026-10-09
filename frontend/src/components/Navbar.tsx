import React from 'react';
import { Logo } from './Logo';
import { LayoutDashboard, Link2, MessageSquareText, Globe, Bot, History, Sparkles, Activity } from 'lucide-react';

export type TabType = 'dashboard' | 'url' | 'message' | 'domain' | 'assistant' | 'history' | 'demo';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isBackendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isBackendHealthy }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'url', label: 'URL Detector', icon: <Link2 size={18} /> },
    { id: 'message', label: 'Message Analyzer', icon: <MessageSquareText size={18} /> },
    { id: 'domain', label: 'Domain Inspector', icon: <Globe size={18} /> },
    { id: 'assistant', label: 'Ask CyberShield', icon: <Bot size={18} /> },
    { id: 'history', label: 'Scan History', icon: <History size={18} /> },
    { id: 'demo', label: 'Judge Demo', icon: <Sparkles size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <Logo size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* System Health Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <Activity size={14} className="text-cyan-400" />
              <span>{isBackendHealthy ? 'Engine Online' : 'Local Fallback'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
