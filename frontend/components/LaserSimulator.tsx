import React from 'react';
import { LaserSimulatorProps } from '../types';
import { SVGGradients, FixturesLayer, LaserBeamsLayer } from './Simulator';

const LaserSimulator: React.FC<LaserSimulatorProps> = ({ 
  lasers, 
  showLaserOrigins, 
  hazeDensity, 
  linearGradient,
  fixtures,
  masterDimmer = 100,
  saberTargets,
  strobeRate = 0,
  pulseRate = 0,
  strobeOrPulse = 'strobe'
}) => {
  const containerStyle: React.CSSProperties = {
    boxShadow: `0 0 30px rgba(255,0,0,0.3), inset 0 0 ${hazeDensity * 1.5}px rgba(255,0,0,${hazeDensity / 400})`,
  };

  return (
    <div 
      className="relative w-full aspect-square max-w-2xl mx-auto bg-black border-2 border-[#ff0000]/30 rounded-lg overflow-hidden"
      style={containerStyle}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="-5 -5 110 110"
        className="absolute inset-0"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* SVG Gradients */}
        <SVGGradients />
        
        {/* Fixtures Layer */}
        {fixtures && (
          <FixturesLayer
            fixtures={fixtures}
            masterDimmer={masterDimmer}
            saberTargets={saberTargets}
            strobeRate={strobeRate}
            pulseRate={pulseRate}
            strobeOrPulse={strobeOrPulse}
          />
        )}
      </svg>
      
      {/* Laser Beams Layer */}
      <LaserBeamsLayer
        lasers={lasers}
        showLaserOrigins={showLaserOrigins}
        hazeDensity={hazeDensity}
        linearGradient={linearGradient}
      />
    </div>
  );
};

export default LaserSimulator;