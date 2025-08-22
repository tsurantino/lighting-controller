import React from 'react';
import { LaserOrientation } from '../types';

interface LaserBeamProps {
  orientation: LaserOrientation;
  brightness: number; // 0-255
  position: number; // Percentage value for top/left
  showOrigin: boolean;
  linearGradient: number;
  hazeDensity: number;
}

const LaserBeam: React.FC<LaserBeamProps> = ({ orientation, brightness, position, showOrigin, linearGradient, hazeDensity }) => {
  const opacity = brightness / 255;
  const isTop = orientation === LaserOrientation.Top;

  const containerStyle: React.CSSProperties = {
    opacity,
    position: 'absolute',
    top: isTop ? '0' : `${position}%`,
    left: isTop ? `${position}%` : '0',
    transform: isTop ? 'translateX(-50%)' : 'translateY(-50%)',
    width: isTop ? '1rem' : '100%',
    height: isTop ? '100%' : '1rem',
    pointerEvents: 'none',
  };

  const originGlowStyle: React.CSSProperties = {
    boxShadow: `0 0 12px 3px rgba(255, 0, 0, ${opacity * 0.7})`,
  };

  const gradientDirection = isTop ? 'to bottom' : 'to right';
  const hazeBlurAmount = hazeDensity / 15; // 0-100 -> ~0-6.6px

  const glowBeamStyle: React.CSSProperties = {
    background: `linear-gradient(${gradientDirection}, rgba(255, 0, 0, 0.4), rgba(255, 0, 0, 0.3) ${linearGradient}%, transparent)`,
    filter: `blur(${hazeBlurAmount}px)`,
  };

  const coreBeamStyle: React.CSSProperties = {
    background: `linear-gradient(${gradientDirection}, #ff0000, #ff0000 ${linearGradient}%, transparent)`,
  };

  return (
    <div style={containerStyle}>
      {/* Laser Beam Glow */}
      <div
        className={`absolute ${isTop ? 'w-1 h-full left-1/2 -translate-x-1/2' : 'h-1 w-full top-1/2 -translate-y-1/2'}`}
        style={glowBeamStyle}
      />
      {/* Laser Core Beam */}
      <div
        className={`absolute ${isTop ? 'w-px h-full left-1/2 -translate-x-1/2' : 'h-px w-full top-1/2 -translate-y-1/2'}`}
        style={coreBeamStyle}
      />
      {/* Laser Origin */}
      {showOrigin && (
        <div
          className={`absolute ${isTop ? 'top-0 left-1/2 -translate-x-1/2' : 'left-0 top-1/2 -translate-y-1/2'} 
                      w-3 h-3 bg-[#ff0000] rounded-full z-10 border-2 border-[#ff7f7f]`}
          style={originGlowStyle}
        />
      )}
    </div>
  );
};

export default LaserBeam;
