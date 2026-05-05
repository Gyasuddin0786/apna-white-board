import React from 'react';

// WhiteBoard SVG logo — pen drawing on a board
export const WBLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#6366f1" />
    {/* Board surface */}
    <rect x="6" y="8" width="28" height="20" rx="2" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="1.2" />
    {/* Pencil line drawing on board */}
    <path d="M10 22 Q15 14 20 18 Q25 22 30 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Pen/pencil icon */}
    <path d="M27 27 L33 21 L35 23 L29 29 Z" fill="white" fillOpacity="0.9" />
    <path d="M27 27 L25 31 L29 29 Z" fill="white" fillOpacity="0.6" />
    <path d="M33 21 L35 19 L37 21 L35 23 Z" fill="#a5b4fc" />
  </svg>
);

// Wordmark: logo + "WhiteBoard" text
export const WBWordmark = ({ size = 36, textClass = 'text-xl font-bold text-gray-900' }) => (
  <div className="flex items-center gap-2.5">
    <WBLogo size={size} />
    <span className={textClass}>Apna WhiteBoard</span>
  </div>
);

export default WBLogo;
