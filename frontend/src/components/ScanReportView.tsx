import React, { useState } from 'react';
import type { ScanReport } from '../types';
import { AlertTriangle, ShieldCheck, ShieldAlert, Copy, Check, RotateCcw, Info, ArrowRight } from 'lucide-react';

interface ScanReportViewProps {
  report: ScanReport;
  onScanAnother: () => void;
}

export const ScanReportView: React.FC<ScanReportViewProps> = ({ report, onScanAnother }) => {
  const [copied, setCopied] = useState(false);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5"><ShieldAlert size={14} /> High Risk</span>;
      case 'Medium':
        return <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"><AlertTriangle size={14} /> Medium Risk</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5"><ShieldCheck size={14} /> Low Apparent Risk</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-red-400 stroke-red-500';
    if (score >= 30) return 'text-amber-400 stroke-amber-500';
    return 'text-emerald-400 stroke-emerald-500';
  };

  const handleCopyReport = () => {
    const text = `[CyberShield AI Threat Report]
Target: ${report.target}
Type: ${report.scan_type.toUpperCase()}
Risk Score: ${report.risk_score}/100 (${report.risk_level} Risk)
Timestamp: ${report.timestamp}

Explanation: ${report.plain_explanation}

Indicators Found (${report.indicators.length}):
${report.indicators.map(i => `- [${i.severity.toUpperCase()}] ${i.name}: ${i.description}`).join('\n')}

Recommended Next Steps:
${report.recommendations.map(r => `• ${r}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {report.scan_type} Analysis
              </span>
              {getRiskBadge(report.risk_level)}
              <span className="text-xs text-slate-400 font-mono">
                {new Date(report.timestamp).toLocaleString()}
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-white font-mono break-all line-clamp-2">
              {report.display_target}
            </h2>
            
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Info size={13} className="text-cyan-400" />
              {report.reputation_status}
            </p>
          </div>

          {/* Risk Score Circle Gauge */}
          <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 self-stretch md:self-auto justify-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={getScoreColor(report.risk_score)}
                  strokeDasharray={`${report.risk_score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-xl font-black ${getScoreColor(report.risk_score).split(' ')[0]}`}>
                  {report.risk_score}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Score</span>
              </div>
            </div>

            <div className="text-left space-y-1">
              <div className="text-xs text-slate-400">Risk Assessment</div>
              <div className="text-base font-bold text-white">{report.risk_level} Threat</div>
              <div className="text-[11px] text-slate-400">Range: 0 (Safe) to 100 (Malicious)</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onScanAnother}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
          >
            <RotateCcw size={15} />
            Scan Another Threat
          </button>

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-sm font-medium transition"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            {copied ? 'Report Copied!' : 'Copy Detailed Report'}
          </button>
        </div>
      </div>

      {/* Why & What To Do Next Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plain Language Explanation (WHY) */}
        <div className="cyber-card rounded-2xl p-6 border-l-4 border-l-cyan-500">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
            <Info className="text-cyan-400" size={20} />
            Why Is This Suspicious? (AI Analysis)
          </h3>
          <p className="text-slate-300 leading-relaxed text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            {report.plain_explanation}
          </p>

          {report.safer_alternative && (
            <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
              <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <ArrowRight size={14} /> Safer Alternative Action:
              </div>
              <p>{report.safer_alternative}</p>
            </div>
          )}
        </div>

        {/* Actionable Recommendations (WHAT TO DO NEXT) */}
        <div className="cyber-card rounded-2xl p-6 border-l-4 border-l-emerald-500">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
            <ShieldCheck className="text-emerald-400" size={20} />
            What You Should Do Next
          </h3>
          <ul className="space-y-2.5">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suspicious Phrases (For Message Scans) */}
      {report.extracted_phrases && report.extracted_phrases.length > 0 && (
        <div className="cyber-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={20} />
            Flagged Suspicious Phrases & Lures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.extracted_phrases.map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded inline-block">
                  "{item.phrase}"
                </div>
                <p className="text-xs text-slate-300">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicators Found */}
      <div className="cyber-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldAlert className="text-cyan-400" size={20} />
            Threat Indicators & Evidence ({report.indicators.length})
          </span>
          <span className="text-xs font-mono text-slate-400">Rule-Based Feature Extraction</span>
        </h3>

        {report.indicators.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-1">
            <ShieldCheck className="mx-auto text-emerald-400" size={32} />
            <p className="text-sm font-semibold text-emerald-300">No Malicious Indicators Triggered</p>
            <p className="text-xs text-slate-400">This target does not trigger known phishing or scam heuristics.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {report.indicators.map((ind, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ind.severity === 'high' ? 'bg-red-500' : ind.severity === 'medium' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                    <span className="font-semibold text-white text-sm">{ind.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {ind.category}
                    </span>
                  </div>
                  <span className={`text-xs uppercase font-mono font-bold px-2 py-0.5 rounded ${
                    ind.severity === 'high' ? 'bg-red-500/20 text-red-400' : ind.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {ind.severity} severity
                  </span>
                </div>
                <p className="text-xs text-slate-300">{ind.description}</p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-cyan-400 font-semibold">Evidence: </span>{ind.evidence}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Positive Signals */}
        {report.positive_signals && report.positive_signals.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Positive Safety Signals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.positive_signals.map((sig, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <ShieldCheck size={14} />
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safety & Limitations Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Disclaimer & Automated Limitations:</strong> CyberShield AI relies on heuristic rule parsing, threat intelligence indicators, and language modeling. A low risk score does not guarantee a URL or message is 100% safe against novel zero-day attacks. Always exercise individual judgment.
        </p>
      </div>
    </div>
  );
};
