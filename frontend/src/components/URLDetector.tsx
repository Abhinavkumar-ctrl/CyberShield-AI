import React, { useState } from 'react';
import type { ScanReport } from '../types';
import { scanURL } from '../api';
import { Link2, Loader2, ArrowRight } from 'lucide-react';
import { ScanReportView } from './ScanReportView';

interface URLDetectorProps {
  onScanComplete: (report: ScanReport) => void;
}

export const URLDetector: React.FC<URLDetectorProps> = ({ onScanComplete }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleUrls = [
    { label: 'Lookalike Paypal Phish', url: 'https://paypa1-security-login.com@evil-attacker.net/login.php?user=target' },
    { label: 'Unencrypted IP Hostname', url: 'http://192.168.1.1/sbi-kyc-verify' },
    { label: 'Clean GitHub HTTPS', url: 'https://github.com/torvalds/linux' }
  ];

  const handleScan = async (targetUrl?: string) => {
    const urlToScan = targetUrl || url;
    if (!urlToScan.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await scanURL(urlToScan);
      setReport(res);
      onScanComplete(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="cyber-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
            <Link2 size={16} /> URL Phishing Detector
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Inspect Links Before You Click</h2>
          <p className="text-slate-300 text-sm">
            Analyzes URL syntax, protocol encryption, typosquatting brand impersonation, Punycode tricks, userinfo symbols, open redirects, and suspicious TLDs.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleScan(); }} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Paste website URL (e.g., https://account.example.com@evil.example)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="cyber-glow-btn px-6 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Scan URL <ArrowRight size={16} /></>}
            </button>
          </div>

          {/* Preset Chip Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400">Try sample link:</span>
            {sampleUrls.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setUrl(s.url); handleScan(s.url); }}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 transition font-mono"
              >
                {s.label}
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
        <ScanReportView report={report} onScanAnother={() => { setReport(null); setUrl(''); }} />
      )}
    </div>
  );
};
