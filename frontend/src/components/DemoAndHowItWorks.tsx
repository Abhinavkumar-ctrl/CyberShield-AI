import React, { useState, useEffect } from 'react';
import type { DemoExample, ScanReport } from '../types';
import { fetchDemoExamples, scanURL, scanMessage } from '../api';
import { Sparkles, Play, Loader2, Info, Cpu } from 'lucide-react';
import { ScanReportView } from './ScanReportView';

interface DemoAndHowItWorksProps {
  onScanComplete: (report: ScanReport) => void;
}

export const DemoAndHowItWorks: React.FC<DemoAndHowItWorksProps> = ({ onScanComplete }) => {
  const [examples, setExamples] = useState<DemoExample[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningDemoId, setRunningDemoId] = useState<string | null>(null);
  const [demoReport, setDemoReport] = useState<ScanReport | null>(null);

  useEffect(() => {
    fetchDemoExamples().then(setExamples).catch(console.error);
  }, []);

  const handleRunDemo = async (ex: DemoExample) => {
    setRunningDemoId(ex.id);
    setLoading(true);
    try {
      let report: ScanReport;
      if (ex.type === 'url') {
        report = await scanURL(ex.content);
      } else {
        report = await scanMessage(ex.content, ex.claimed_sender);
      }
      setDemoReport(report);
      onScanComplete(report);
    } catch (err) {
      alert('Failed to run demo example');
    } finally {
      setLoading(false);
      setRunningDemoId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-purple-500/30 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono">
          <Sparkles size={14} /> Hackathon Judge Quick Evaluation Panel
        </div>
        <h2 className="text-3xl font-extrabold text-white">Predefined Demo Test Cases</h2>
        <p className="text-sm text-slate-300">
          Click any sample test case below to run it through CyberShield AI's live analysis engine.
        </p>
      </div>

      {/* Demo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((ex) => (
          <div
            key={ex.id}
            className="cyber-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  {ex.type} Test Case
                </span>
                {ex.claimed_sender && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Sender: {ex.claimed_sender}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white font-mono leading-snug">{ex.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{ex.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 break-all max-h-24 overflow-y-auto">
              "{ex.content}"
            </div>

            <button
              onClick={() => handleRunDemo(ex)}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {runningDemoId === ex.id ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Executing Engine...
                </>
              ) : (
                <>
                  <Play size={14} /> Run Live Test
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Results Box */}
      {demoReport && (
        <div className="pt-4 space-y-3">
          <div className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} /> Live Evaluation Result for Judge Test:
          </div>
          <ScanReportView report={demoReport} onScanAnother={() => setDemoReport(null)} />
        </div>
      )}

      {/* Technical How It Works Flow */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Cpu className="text-cyan-400" size={24} />
          Architecture & Threat Scoring Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-400">Step 1</div>
            <div className="text-sm font-bold text-white">Input Normalization</div>
            <p className="text-xs text-slate-400">Sanitizes URL/text strings, extracts protocols, hostnames, and query parameters.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-400">Step 2</div>
            <div className="text-sm font-bold text-white">Feature Extraction</div>
            <p className="text-xs text-slate-400">Regex rules check for Punycode, typosquatting, userinfo `@`, free domain senders, and urgency phrases.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-purple-400">Step 3</div>
            <div className="text-sm font-bold text-white">Threat Scoring</div>
            <p className="text-xs text-slate-400">Calculates weighted risk score (0-100) and categorizes into Low, Medium, or High risk levels.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-emerald-400">Step 4</div>
            <div className="text-sm font-bold text-white">AI Plain Explanation</div>
            <p className="text-xs text-slate-400">Translates complex indicator flags into beginner-friendly explanations ("WHY").</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-blue-400">Step 5</div>
            <div className="text-sm font-bold text-white">Protective Action</div>
            <p className="text-xs text-slate-400">Generates prioritized safety steps ("WHAT TO DO NEXT") and India Cyber Helpline 1930 resources.</p>
          </div>
        </div>
      </div>

      {/* Limitations Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Info size={18} className="text-amber-400" />
          Technical Limitations & Automated Guardrails
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          No automated threat scanner can guarantee 100% protection against zero-day phishing techniques or hyper-targeted social engineering attacks. CyberShield AI uses transparent heuristics to reduce risk, but human vigilance remains essential. External API lookups (Google Safe Browsing / VirusTotal) run seamlessly when configured via environment variables, with clean local rule fallback when credentials are omitted.
        </p>
      </div>
    </div>
  );
};
