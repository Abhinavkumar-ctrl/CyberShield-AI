import React, { useState } from 'react';
import type { ChatMessage } from '../types';
import { askAssistant } from '../api';
import { Bot, User, Send, Loader2, PhoneCall, Lock } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am **Ask CyberShield**, your AI cybersecurity safety assistant.

Ask me any questions about phishing, suspicious links, SMS scams, or account security. 

*For Indian users:* If you lost money in a financial scam, call the **National Cybercrime Helpline 1930** immediately or visit [cybercrime.gov.in](https://cybercrime.gov.in/).`,
      timestamp: new Date().toLocaleTimeString(),
      suggestedActions: [
        'I clicked a suspicious link. What should I do?',
        'Someone is asking for my bank OTP. Is this safe?',
        'How can I report an online financial scam in India?',
        'How do I secure my accounts after a phishing attack?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await askAssistant(textToSend);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        source: res.source,
        timestamp: new Date().toLocaleTimeString(),
        suggestedActions: res.suggested_actions
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue processing your query. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Header Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Ask CyberShield <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">AI Guidance</span>
            </h2>
            <p className="text-xs text-slate-300">Instant plain-language emergency advice & incident response steps</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0 font-mono">
          <PhoneCall size={14} className="text-emerald-400" />
          <span>India Helpline: <strong className="text-emerald-400 font-bold">1930</strong></span>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="cyber-card rounded-2xl flex flex-col h-[550px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                  <Bot size={18} />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-mono transition"
                      >
                        💡 {action}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-mono px-1">
                  {msg.timestamp} {msg.source && `• ${msg.source}`}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono bg-slate-900/60 p-3 rounded-xl w-fit">
              <Loader2 size={16} className="animate-spin text-cyan-400" />
              <span>CyberShield AI is analyzing security guidance...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a security question (e.g. 'I clicked a link', 'Someone asked for OTP')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="cyber-glow-btn p-3 rounded-xl text-white disabled:opacity-50 transition shrink-0"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock size={12} className="text-emerald-400" /> Privacy Protected: Never submit real passwords or bank PINs.
            </span>
            <span>National Cyber Portal: <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">cybercrime.gov.in</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};
