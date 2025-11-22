import React from 'react';

export const SVGGradients: React.FC = () => (
  <defs>
    {/* Moving head beam gradient */}
    <radialGradient id="movingHeadBeam" cx="0%" cy="0%" r="100%">
      <stop offset="0%" stopColor="#FF0000" stopOpacity="0.9" />
      <stop offset="50%" stopColor="#FF4444" stopOpacity="0.6" />
      <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
    </radialGradient>
    
    <radialGradient id="movingHeadSpotlight" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FF0000" stopOpacity="0.9" />
      <stop offset="30%" stopColor="#FF4444" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
    </radialGradient>
    
    <linearGradient id="saberBeam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FF0000" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
    </linearGradient>
    
    <radialGradient id="joltSpotlight" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FF0000" stopOpacity="0.9" />
      <stop offset="30%" stopColor="#FF4444" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
    </radialGradient>
    
    <radialGradient id="shockerSpotlight" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FF0000" stopOpacity="0.9" />
      <stop offset="30%" stopColor="#FF4444" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
    </radialGradient>
  </defs>
);