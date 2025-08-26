// src/components/visualization/LaserBeam.tsx
import React from 'react';
import { LaserOrientation } from '../../types';

interface LaserBeamProps {
  orientation: LaserOrientation;
  brightness: number;
  position: { x: number; y: number };
  showOrigin?: boolean;
  hazeDensity?: number;
  linearGradient?: number;
}

const LaserBeam: React.FC<LaserBeamProps> = ({
  orientation,
  brightness,
  position,
  showOrigin = false,
  hazeDensity = 50,
  linearGradient = 75,
}) => {
  const isHorizontal = orientation === LaserOrientation.Top;
  const opacity = brightness / 255;
  
  // Calculate haze blur effect
  const hazeBlurAmount = hazeDensity / 15;
  
  // Calculate beam length based on linear gradient
  const beamLength = linearGradient;
  
  const beamStyle = React.useMemo(() => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute' as const,
      opacity,
      filter: `blur(${hazeBlurAmount}px)`,
      pointerEvents: 'none' as const,
      zIndex: 1,
    };

    if (isHorizontal) {
      // Top laser - horizontal beam
      return {
        ...baseStyle,
        left: '0%',
        top: `${position.y}%`,
        width: '100%',
        height: '2px',
        background: `linear-gradient(to right, 
          rgba(255, 0, 0, 0) 0%, 
          rgba(255, 0, 0, ${opacity * 0.9}) 5%, 
          rgba(255, 0, 0, ${opacity * 0.8}) ${beamLength}%, 
          rgba(255, 0, 0, 0) 100%
        )`,
        transformOrigin: `${position.x}% center`,
      };
    } else {
      // Side laser - vertical beam
      return {
        ...baseStyle,
        left: `${position.x}%`,
        top: '0%',
        width: '2px',
        height: '100%',
        background: `linear-gradient(to bottom, 
          rgba(255, 0, 0, 0) 0%, 
          rgba(255, 0, 0, ${opacity * 0.9}) 5%, 
          rgba(255, 0, 0, ${opacity * 0.8}) ${beamLength}%, 
          rgba(255, 0, 0, 0) 100%
        )`,
        transformOrigin: `center ${position.y}%`,
      };
    }
  }, [isHorizontal, opacity, position, beamLength, hazeBlurAmount]);

  const originStyle = React.useMemo(() => {
    const baseOriginStyle: React.CSSProperties = {
      position: 'absolute' as const,
      width: '6px',
      height: '6px',
      backgroundColor: '#ff0000',
      borderRadius: '50%',
      opacity: opacity * 0.8,
      zIndex: 2,
      boxShadow: `0 0 8px rgba(255, 0, 0, ${opacity * 0.6})`,
    };

    if (isHorizontal) {
      return {
        ...baseOriginStyle,
        left: `calc(${position.x}% - 3px)`,
        top: `calc(${position.y}% - 3px)`,
      };
    } else {
      return {
        ...baseOriginStyle,
        left: `calc(${position.x}% - 3px)`,
        top: `calc(${position.y}% - 3px)`,
      };
    }
  }, [isHorizontal, position, opacity]);

  if (brightness === 0) {
    return null;
  }

  return (
    <>
      {/* Laser beam */}
      <div style={beamStyle} />
      
      {/* Laser origin point */}
      {showOrigin && <div style={originStyle} />}
    </>
  );
};

export default LaserBeam;