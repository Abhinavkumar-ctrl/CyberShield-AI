import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: { box: 28, text: 'text-lg' },
    md: { box: 36, text: 'text-xl' },
    lg: { box: 48, text: 'text-3xl' },
  };

  const dim = sizeMap[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={dim.box}
          height={dim.box}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
        >
          {/* Outer Shield Outline */}
          <path
            d="M24 4L8 10V22C8 32.5 14.8 42.1 24 45C33.2 42.1 40 32.5 40 22V10L24 4Z"
            fill="url(#shield-grad)"
            stroke="#06B6D4"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* AI Circuit Lines & Nodes inside Shield */}
          <path d="M24 12V24" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 24L16 30" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 24L32 30" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 18H24" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 18H32" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />

          {/* Circuit Nodes */}
          <circle cx="24" cy="12" r="2.5" fill="#38BDF8" />
          <circle cx="24" cy="24" r="3.5" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="16" cy="30" r="2.5" fill="#C084FC" />
          <circle cx="32" cy="30" r="2.5" fill="#C084FC" />
          <circle cx="16" cy="18" r="2" fill="#38BDF8" />
          <circle cx="32" cy="18" r="2" fill="#38BDF8" />

          <defs>
            <linearGradient id="shield-grad" x1="8" y1="4" x2="40" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F172A" />
              <stop offset="0.5" stopColor="#1E293B" />
              <stop offset="1" stopColor="#0B132B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight ${dim.text} text-white font-sans`}>
            Cyber<span className="cyber-gradient-text">Shield</span> <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 ml-1 font-mono uppercase">AI</span>
          </span>
        </div>
      )}
    </div>
  );
};
