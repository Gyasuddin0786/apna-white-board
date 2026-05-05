import React from 'react';

export const BlankBoardIcon = () => (
  <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
    <rect x="1" y="1" width="50" height="38" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3"/>
    <line x1="10" y1="20" x2="42" y2="20" stroke="#e2e8f0" strokeWidth="1.2"/>
    <line x1="26" y1="8"  x2="26" y2="32" stroke="#e2e8f0" strokeWidth="1.2"/>
    <circle cx="26" cy="20" r="3" fill="#c7d2fe"/>
  </svg>
);

export const FlowchartIcon = () => (
  <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
    {/* Start */}
    <rect x="14" y="2" width="24" height="10" rx="5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4"/>
    <text x="26" y="10" textAnchor="middle" fontSize="5.5" fill="#1e40af" fontFamily="sans-serif">Start</text>
    {/* Arrow down */}
    <line x1="26" y1="12" x2="26" y2="17" stroke="#64748b" strokeWidth="1.2"/>
    <polygon points="26,18 24,15 28,15" fill="#64748b"/>
    {/* Decision diamond */}
    <polygon points="26,19 38,26 26,33 14,26" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4"/>
    <text x="26" y="28" textAnchor="middle" fontSize="4.5" fill="#92400e" fontFamily="sans-serif">Decision</text>
    {/* Arrow down */}
    <line x1="26" y1="33" x2="26" y2="37" stroke="#64748b" strokeWidth="1.2"/>
    <polygon points="26,38 24,35 28,35" fill="#64748b"/>
    {/* End */}
    <rect x="14" y="38" width="24" height="5" rx="2.5" fill="#d1fae5" stroke="#10b981" strokeWidth="1.4"/>
    <text x="26" y="42.5" textAnchor="middle" fontSize="4.5" fill="#065f46" fontFamily="sans-serif">End</text>
  </svg>
);

export const WireframeIcon = () => (
  <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
    {/* Browser chrome */}
    <rect x="1" y="1" width="54" height="42" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2"/>
    {/* Top bar */}
    <rect x="1" y="1" width="54" height="9" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2"/>
    <circle cx="7"  cy="5.5" r="1.8" fill="#f87171"/>
    <circle cx="13" cy="5.5" r="1.8" fill="#fbbf24"/>
    <circle cx="19" cy="5.5" r="1.8" fill="#34d399"/>
    <rect x="24" y="3.5" width="24" height="4" rx="2" fill="white" fillOpacity="0.6"/>
    {/* Nav */}
    <rect x="4" y="12" width="48" height="6" rx="1.5" fill="#e2e8f0"/>
    {/* Sidebar */}
    <rect x="4" y="20" width="12" height="20" rx="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
    {/* Content */}
    <rect x="18" y="20" width="34" height="8"  rx="1.5" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1"/>
    <rect x="18" y="30" width="34" height="4"  rx="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="18" y="36" width="22" height="4"  rx="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
  </svg>
);

export const MindMapIcon = () => (
  <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
    {/* Center */}
    <circle cx="28" cy="22" r="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6"/>
    <text x="28" y="25" textAnchor="middle" fontSize="5" fill="#5b21b6" fontFamily="sans-serif" fontWeight="600">Idea</text>
    {/* Top */}
    <line x1="28" y1="14" x2="28" y2="8"  stroke="#8b5cf6" strokeWidth="1.2"/>
    <circle cx="28" cy="6"  r="4.5" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.2"/>
    <text x="28" y="8"  textAnchor="middle" fontSize="4" fill="#9d174d" fontFamily="sans-serif">T1</text>
    {/* Right */}
    <line x1="36" y1="22" x2="43" y2="22" stroke="#8b5cf6" strokeWidth="1.2"/>
    <circle cx="47" cy="22" r="4.5" fill="#d1fae5" stroke="#10b981" strokeWidth="1.2"/>
    <text x="47" y="24" textAnchor="middle" fontSize="4" fill="#065f46" fontFamily="sans-serif">T2</text>
    {/* Bottom */}
    <line x1="28" y1="30" x2="28" y2="36" stroke="#8b5cf6" strokeWidth="1.2"/>
    <circle cx="28" cy="38" r="4.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.2"/>
    <text x="28" y="40" textAnchor="middle" fontSize="4" fill="#92400e" fontFamily="sans-serif">T3</text>
    {/* Left */}
    <line x1="20" y1="22" x2="13" y2="22" stroke="#8b5cf6" strokeWidth="1.2"/>
    <circle cx="9"  cy="22" r="4.5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2"/>
    <text x="9"  y="24" textAnchor="middle" fontSize="4" fill="#1e40af" fontFamily="sans-serif">T4</text>
  </svg>
);
