import React, { useState } from 'react';
import type { ScanReport } from '../types';
import { scanMessage } from '../api';
import { MessageSquareText, Loader2, ArrowRight } from 'lucide-react';
import { ScanReportView } from './ScanReportView';

interface MessageAnalyzerProps {
  onScanComplete: (report: ScanReport) => void;
}

export const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({ onScanComplete }) => {
  const [message, setMessage] = useState('');
  const [claimedSender, setClaimedSender] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samples = [
    {
      label: 'SBI Bank KYC Scam',
      sender: 'AD-SBIINB',
      msg: 'URGENT: Your SBI bank account is blocked due to pending KYC update. Click http://sbi-kyc-update.online/verify immediately or account will be permanently terminated.'
    },
    {
      label: 'Fake Amazon Prize',
      sender: '+1-800-REWARD',
      msg: 'CONGRATS! You won a $5,000 Amazon Gift Card! Claim your prize now at http://amz-claim-prize.site/win?code=99283'
    },
    {
      label: 'Benign Family SMS',
      sender: '+91-9876543210',
      msg: 'Hi mom, I will be home around 6 PM today. Let\'s have dinner together!'
    }
  ];

  const handleScan = async (overrideMsg?: string, overrideSender?: string) => {
    const textToScan = overrideMsg || message;
    const senderToUse = overrideSender !== undefined ? overrideSender : claimedSender;
    if (!textToScan.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await scanMessage(textToScan, senderToUse);
      setReport(res);
      onScanComplete(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="cyber-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
            <MessageSquareText size={16} /> Scam Message & Email Analyzer
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Detect SMS, WhatsApp & Email Scams</h2>
          <p className="text-slate-300 text-sm">
            Scans for coercive urgency, fake KYC warnings, OTP harvesting, fake delivery fees, prize scams, and impersonation of trusted institutions.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleScan(); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Claimed Sender (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. AD-SBIINB, service@paypal-update.online, +91-9876543210"
              value={claimedSender}
              onChange={(e) => setClaimedSender(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Message Content *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Paste suspicious text message, email snippet, or WhatsApp alert here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Try sample message:</span>
            {samples.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessage(s.msg);
                  setClaimedSender(s.sender);
                  handleScan(s.msg, s.sender);
                }}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 transition font-mono"
              >
                {s.label}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="cyber-glow-btn px-8 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Analyze Message <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      {report && (
        <ScanReportView report={report} onScanAnother={() => { setReport(null); setMessage(''); setClaimedSender(''); }} />
      )}
    </div>
  );
};
