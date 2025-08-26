// src/components/common/icons.tsx
import React from 'react';
import { ScrollDirection, VisualPreset } from '../../types';

const scrollIconBaseClass = "w-6 h-6";
const visualIconBase = "w-8 h-8 mx-auto mb-1";

// Scroll/Movement Direction Icons
export const SCROLL_ICONS: Record<ScrollDirection, { label: string; icon: React.ReactNode }> = {
  [ScrollDirection.None]: { 
    label: 'None', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>None</title>
      <circle cx="12" cy="12" r="3"/>
    </svg> 
  },
  [ScrollDirection.LeftToRight]: { 
    label: 'Right', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Left to Right</title>
      <path d="M14 7l5 5-5 5V7z"/>
      <path d="M5 7v10h2V7H5z"/>
    </svg> 
  },
  [ScrollDirection.RightToLeft]: { 
    label: 'Left', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Right to Left</title>
      <path d="M10 17l-5-5 5-5v10z"/>
      <path d="M17 7v10h2V7h-2z"/>
    </svg> 
  },
  [ScrollDirection.TopToBottom]: { 
    label: 'Down', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Top to Bottom</title>
      <path d="M7 14l5 5 5-5H7z"/>
      <path d="M7 5h10v2H7V5z"/>
    </svg> 
  },
  [ScrollDirection.BottomToTop]: { 
    label: 'Up', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Bottom to Top</title>
      <path d="M17 10l-5-5-5 5h10z"/>
      <path d="M7 17h10v2H7v-2z"/>
    </svg> 
  },
  [ScrollDirection.ToTL]: { 
    label: 'To TL', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>To Top Left</title>
      <path d="M5 5h6l-6 6V5z"/>
    </svg> 
  },
  [ScrollDirection.ToTR]: { 
    label: 'To TR', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>To Top Right</title>
      <path d="M19 5h-6l6 6V5z"/>
    </svg> 
  },
  [ScrollDirection.ToBL]: { 
    label: 'To BL', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>To Bottom Left</title>
      <path d="M5 19v-6l6 6H5z"/>
    </svg> 
  },
  [ScrollDirection.ToBR]: { 
    label: 'To BR', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>To Bottom Right</title>
      <path d="M19 19v-6l-6 6h6z"/>
    </svg> 
  },
  [ScrollDirection.FromTL]: { 
    label: 'From TL', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>From Top Left</title>
      <path d="M5 5v6l6-6H5z"/>
    </svg> 
  },
  [ScrollDirection.FromTR]: { 
    label: 'From TR', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>From Top Right</title>
      <path d="M19 5v6l-6-6h6z"/>
    </svg> 
  },
  [ScrollDirection.FromBL]: { 
    label: 'From BL', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>From Bottom Left</title>
      <path d="M5 19h6l-6-6v6z"/>
    </svg> 
  },
  [ScrollDirection.FromBR]: { 
    label: 'From BR', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>From Bottom Right</title>
      <path d="M19 19h-6l6-6v6z"/>
    </svg> 
  },
  [ScrollDirection.Out]: { 
    label: 'Out', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Out from Center</title>
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg> 
  },
  [ScrollDirection.In]: { 
    label: 'In', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Towards Center</title>
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg> 
  },
  [ScrollDirection.Pinwheel]: { 
    label: 'Pinwheel', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Pinwheel</title>
      <path d="M12 12L22 10v4L12 12zm0 0l-10 2V8l10 2zm0 0l-2 10h4l-2-10zm0 0l2-10H10l2 10z"/>
    </svg> 
  },
  [ScrollDirection.Spot]: { 
    label: 'Spot', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}>
      <title>Spot</title>
      <path d="M12 6L7 11h4v7h2v-7h4z" />
    </svg> 
  },
};

// Visual Preset Icons
export const VISUAL_ICONS: Record<VisualPreset, React.ReactNode> = {
  [VisualPreset.Grid]: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}>
      <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
    </svg>
  ),
  [VisualPreset.Bracket]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m14-5h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3m14 5h3a2 2 0 0 0 2-2v-3"/>
    </svg>
  ),
  [VisualPreset.LBracket]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}>
      <path d="M14 3h7v7M3 10V3h7m11 4v7h-7M10 21v-7H3"/>
    </svg>
  ),
  [VisualPreset.SCross]: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}>
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>
    </svg>
  ),
  [VisualPreset.Cross]: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}>
      <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>
    </svg>
  ),
  [VisualPreset.LCross]: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}>
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>
    </svg>
  ),
  [VisualPreset.SDblCross]: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}>
      <path d="M11 5h2v14h-2V5zM5 8h14v2H5V8zm0 6h14v2H5v-2z" />
    </svg>
  ),
  [VisualPreset.DblCross]: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}>
      <path d="M10 4h4v16h-4V4zM4 7h16v2H4V7zm0 8h16v2H4v-2z"/>
    </svg>
  ),
  [VisualPreset.LDblCross]: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}>
      <path d="M9 3h6v18H9V3zM3 6h18v2H3V6zm0 10h18v2H3v-2z"/>
    </svg>
  ),
  [VisualPreset.Cube]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}>
      <rect x="4" y="4" width="16" height="16" rx="1"/>
    </svg>
  ),
  [VisualPreset.FourCubes]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}>
      <rect x="3" y="3" width="8" height="8"/>
      <rect x="13" y="3" width="8" height="8"/>
      <rect x="3" y="13" width="8" height="8"/>
      <rect x="13" y="13" width="8" height="8"/>
    </svg>
  ),
  [VisualPreset.NineCubes]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={visualIconBase}>
      <path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
};

// Effect Modifier Icons
export const ModifierIcons = {
  Build: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <title>Build</title>
      <circle cx="12" cy="12" r="6"/>
    </svg>
  ),
  Phase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <title>Phase</title>
      <path d="M3 12q2-5 4-5t4 5 4-5 4 5" opacity="0.5" />
      <path d="M3 12q2 5 4 5t4-5 4 5 4-5" />
    </svg>
  ),
  Loop: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <title>Loop Center</title>
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
    </svg>
  ),
  Fade: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <title>Fade</title>
      <path d="M3 10h2v4H3z"/>
      <path d="M7 10h2v4H7z" opacity="0.7"/>
      <path d="M11 10h2v4h-2z" opacity="0.4"/>
      <path d="M15 10h2v4h-2z" opacity="0.2"/>
      <path d="M19 10h2v4h-2z" opacity="0.1"/>
    </svg>
  ),
};