import { useState, useEffect } from 'react';
import { Navbar, type TabType } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { URLDetector } from './components/URLDetector';
import { MessageAnalyzer } from './components/MessageAnalyzer';
import { DomainInspector } from './components/DomainInspector';
import { AIAssistant } from './components/AIAssistant';
import { ScanHistory } from './components/ScanHistory';
import { DemoAndHowItWorks } from './components/DemoAndHowItWorks';
import { ScanReportView } from './components/ScanReportView';
import type { ScanReport, StatsData } from './types';
import { fetchStats } from './api';
import { Shield, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeReport, setActiveReport] = useState<ScanReport | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    total_scans: 0,
    high_risk_count: 0,
    medium_risk_count: 0,
    low_risk_count: 0,
    threat_distribution: {},
    scan_types: {},
    recent_scans: []
  });

  const loadStats = async () => {
    try {
      const data = await fetchStats();
      setStats(data);
      setIsBackendHealthy(true);
    } catch (err) {
      console.warn('Backend connection warning:', err);
      setIsBackendHealthy(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleScanComplete = (report: ScanReport) => {
    setActiveReport(report);
    loadStats();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Subtle Cyber Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveReport(null);
        }}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {/* If an active report is being viewed, show Report View */}
        {activeReport ? (
          <ScanReportView
            report={activeReport}
            onScanAnother={() => setActiveReport(null)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                stats={stats}
                onScanComplete={handleScanComplete}
                setActiveTab={setActiveTab}
                refreshStats={loadStats}
              />
            )}
            {activeTab === 'url' && (
              <URLDetector onScanComplete={handleScanComplete} />
            )}
            {activeTab === 'message' && (
              <MessageAnalyzer onScanComplete={handleScanComplete} />
            )}
            {activeTab === 'domain' && (
              <DomainInspector onScanComplete={handleScanComplete} />
            )}
            {activeTab === 'assistant' && <AIAssistant />}
            {activeTab === 'history' && (
              <ScanHistory
                onSelectScan={(scan) => setActiveReport(scan)}
                refreshStats={loadStats}
              />
            )}
            {activeTab === 'demo' && (
              <DemoAndHowItWorks onScanComplete={handleScanComplete} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A12] py-8 z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-cyan-400" />
            <span className="font-bold text-white font-mono">CyberShield AI</span>
            <span>— AI-Powered Cybersecurity & Digital Safety Platform</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-slate-400">
            <span>National Cyber Portal: <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">cybercrime.gov.in</a></span>
            <span>Helpline: <strong className="text-emerald-400 font-bold">1930</strong></span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            Built with <Heart size={12} className="text-red-500" /> for Digital Safety
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
