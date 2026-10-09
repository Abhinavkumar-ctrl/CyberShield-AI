import React, { useState } from 'react';
import type { ScanReport, StatsData } from '../types';
import { scanURL, scanMessage, scanDomain } from '../api';
import type { TabType } from './Navbar';
import { Shield, ShieldAlert, AlertTriangle, ShieldCheck, Link2, MessageSquareText, Globe, ArrowRight, Loader2, History, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  stats: StatsData;
  onScanComplete: (report: ScanReport) => void;
  setActiveTab: (tab: TabType) => void;
  refreshStats: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onScanComplete, setActiveTab, refreshStats }) => {
  const [scanMode, setScanMode] = useState<'url' | 'message' | 'domain'>('url');
  const [inputVal, setInputVal] = useState('');
  const [claimedSender, setClaimedSender] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      let report: ScanReport;
      if (scanMode === 'url') {
        report = await scanURL(inputVal);
      } else if (scanMode === 'message') {
        report = await scanMessage(inputVal, claimedSender);
      } else {
        report = await scanDomain(inputVal);
      }
      refreshStats();
      onScanComplete(report);
    } catch (err: any) {
      setErrorMsg(err.message || 'Threat analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'High Risk', value: stats.high_risk_count, color: '#EF4444' },
    { name: 'Medium Risk', value: stats.medium_risk_count, color: '#F59E0B' },
    { name: 'Low Risk', value: stats.low_risk_count, color: '#10B981' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Shield size={14} className="text-cyan-400" />
          <span>Real-time Phishing & Social Engineering Protection</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Your Digital Safety, <span className="cyber-gradient-text">Powered by AI</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Instantly detect phishing links, fake banking alerts, SMS scams, and social engineering attacks. CyberShield AI explains <strong className="text-cyan-300">WHY</strong> something is suspicious and tells you <strong className="text-emerald-300 font-semibold">WHAT TO DO NEXT</strong>.
        </p>
      </div>

      {/* Main Scanner Hero Input Card */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setScanMode('url'); setErrorMsg(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              scanMode === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 size={16} /> 1. Scan a URL
          </button>

          <button
            type="button"
            onClick={() => { setScanMode('message'); setErrorMsg(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              scanMode === 'message' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareText size={16} /> 2. Analyze Suspicious Message
          </button>

          <button
            type="button"
            onClick={() => { setScanMode('domain'); setErrorMsg(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              scanMode === 'domain' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={16} /> 3. Inspect Domain
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          {scanMode === 'message' && (
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Claimed Sender (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. AD-SBIINB, +91-9876543210, service@paypal-update.online"
                value={claimedSender}
                onChange={(e) => setClaimedSender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          )}

          <div className="relative">
            {scanMode === 'message' ? (
              <textarea
                rows={4}
                required
                placeholder="Paste suspicious SMS, email, WhatsApp message, or job offer text here... (e.g., 'URGENT: Your bank account is suspended. Update KYC now...')"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
              />
            ) : (
              <input
                type="text"
                required
                placeholder={
                  scanMode === 'url'
                    ? 'Paste URL to analyze... (e.g. https://paypa1-security-login.com@evil-attacker.net)'
                    : 'Enter domain or hostname... (e.g. sbi-online-kyc.com)'
                }
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-cyan-500 font-mono pr-12"
              />
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 hidden sm:block">
              ⚡ Instant local rule engine + optional LLM explanations
            </div>

            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="w-full sm:w-auto cyber-glow-btn text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  Analyzing Threat...
                </>
              ) : (
                <>
                  Analyze Threat
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="cyber-card rounded-xl p-5 space-y-2 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">Total Scans</span>
            <History size={18} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats.total_scans}</div>
          <div className="text-[11px] text-slate-400">Real stored scan records</div>
        </div>

        {/* High Risk Detections */}
        <div className="cyber-card rounded-xl p-5 space-y-2 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">High Risk</span>
            <ShieldAlert size={18} className="text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono">{stats.high_risk_count}</div>
          <div className="text-[11px] text-slate-400">Critical threats identified</div>
        </div>

        {/* Medium Risk Detections */}
        <div className="cyber-card rounded-xl p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">Medium Risk</span>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{stats.medium_risk_count}</div>
          <div className="text-[11px] text-slate-400">Suspicious warnings</div>
        </div>

        {/* Low Risk Detections */}
        <div className="cyber-card rounded-xl p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">Low Risk</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{stats.low_risk_count}</div>
          <div className="text-[11px] text-slate-400">Benign / Safe inputs</div>
        </div>
      </div>

      {/* Lower Section: Recent Scans & Threat Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scan History Feed (2 cols) */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-cyan-400" />
              Recent Scan Activity
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              View Full History →
            </button>
          </div>

          {stats.recent_scans.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Shield className="mx-auto text-slate-600" size={40} />
              <div className="text-slate-300 font-semibold">No Scans Recorded Yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Submit a URL, message, or domain above, or click <strong className="text-cyan-400 font-normal">"Judge Demo"</strong> to run sample test cases!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recent_scans.slice(0, 5).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onScanComplete(scan)}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between cursor-pointer transition gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      scan.risk_level === 'High' ? 'bg-red-500' : scan.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div className="truncate space-y-0.5">
                      <div className="text-sm font-semibold text-white truncate font-mono">
                        {scan.display_target}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 rounded">
                          {scan.scan_type}
                        </span>
                        <span>•</span>
                        <span>{new Date(scan.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                      scan.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      scan.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {scan.risk_score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Threat Distribution Chart (1 col) */}
        <div className="cyber-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChartIcon size={18} className="text-cyan-400" />
              Threat Distribution
            </h3>
          </div>

          {chartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <PieChartIcon className="mx-auto text-slate-600" size={32} />
              <p>No distribution data available until first scan.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
