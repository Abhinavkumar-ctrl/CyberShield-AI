import React, { useState } from 'react';
import type { ScanReport } from '../types';
import { scanDomain } from '../api';
import { Globe, Loader2, ArrowRight } from 'lucide-react';
import { ScanReportView } from './ScanReportView';

interface DomainInspectorProps {
  onScanComplete: (report: ScanReport) => void;
}

export const DomainInspector: React.FC<DomainInspectorProps> = ({ onScanComplete }) => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samples = [
    'sbi-online-kyc.com',
    'paypa1-security-update.net',
    'github.com'
  ];

  const handleInspect = async (targetDomain?: string) => {
    const domToScan = targetDomain || domain;
    if (!domToScan.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await scanDomain(domToScan);
      setReport(res);
      onScanComplete(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to inspect domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="cyber-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
            <Globe size={16} /> Website & Domain Inspector
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Passive Domain Threat Intelligence</h2>
          <p className="text-slate-300 text-sm">
            Parses domain structure, checks typosquatting patterns, verifies protocol enforcement, and screens against brand impersonation rules without executing unsafe remote scripts.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleInspect(); }} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Enter domain name (e.g., sbi-online-kyc.com or paypal.com)..."
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !domain.trim()}
              className="cyber-glow-btn px-6 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Inspect Domain <ArrowRight size={16} /></>}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Sample domains:</span>
            {samples.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setDomain(s); handleInspect(s); }}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 transition font-mono"
              >
                {s}
              </button>
            ))}
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300">
            {errorMsg}
          </div>
        )}
      </div>

      {report && (
        <div className="space-y-6">
          {/* Domain Breakdown Card */}
          {report.domain_details && (
            <div className="cyber-card rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-mono">Hostname</div>
                <div className="text-sm font-bold text-white font-mono truncate">{report.domain_details.hostname}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-mono">Protocol</div>
                <div className="text-sm font-bold text-cyan-400 font-mono uppercase">{report.domain_details.scheme}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-mono">TLD</div>
                <div className="text-sm font-bold text-purple-400 font-mono">.{report.domain_details.tld || 'N/A'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-mono">Raw IP Check</div>
                <div className="text-sm font-bold text-slate-200 font-mono">{report.domain_details.is_ip ? 'Yes (IP Used)' : 'No (Standard)'}</div>
              </div>
            </div>
          )}

          <ScanReportView report={report} onScanAnother={() => { setReport(null); setDomain(''); }} />
        </div>
      )}
    </div>
  );
};
