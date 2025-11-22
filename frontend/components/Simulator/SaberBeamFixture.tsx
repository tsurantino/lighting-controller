import React from 'react';
import { SaberBeamFixtureProps } from './types';

export const SaberBeamFixture: React.FC<SaberBeamFixtureProps> = ({ 
  fixture, 
  x, 
  y, 
  masterDimmer, 
  targetPosition, 
  gridToLaserPosition,
  strobeRate = 0, 
  pulseRate = 0, 
  strobeOrPulse = 'strobe' 
}) => {
  // Calculate effective brightness from semantic properties + master dimmer
  const baseBrightness = (fixture.brightness / 100) * (masterDimmer / 100);
  
  // Apply strobe/pulse effect
  const currentTime = Date.now();
  const activeRate = strobeOrPulse === 'strobe' ? strobeRate : pulseRate;
  let effectiveBrightness = baseBrightness;
  
  if (activeRate > 0) {
    const speed = (activeRate / 100) * 10; // Scale rate to reasonable speed
    const phase = (currentTime * speed) % (2 * Math.PI);
    
    if (strobeOrPulse === 'strobe') {
      // Strobe: quick on/off
      effectiveBrightness = Math.sin(phase) > 0.5 ? baseBrightness : 0;
    } else {
      // Pulse: smooth fade in/out
      effectiveBrightness = baseBrightness * (Math.sin(phase) * 0.5 + 0.5);
    }
  }
  
  // Configurable target (no more hardcoded yellow star)
  const getDefaultTarget = () => {
    return gridToLaserPosition(7, 7); // Default to center
  };
  
  const target = targetPosition || getDefaultTarget();
  
  // Calculate beam direction
  const deltaX = target.x - x;
  const deltaY = target.y - y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Fixed beam properties - no resizing during strobe/pulse
  const beamLength = Math.max(10, 25 * baseBrightness);
  const beamWidth = 2 + (baseBrightness * 3);
  
  const normalizedX = distance > 0 ? (deltaX / distance) * beamLength : 0;
  const normalizedY = distance > 0 ? (deltaY / distance) * beamLength : 0;
  const perpX = distance > 0 ? (-deltaY / distance) * beamWidth : 0;
  const perpY = distance > 0 ? (deltaX / distance) * beamWidth : 0;
  
  return (
    <g>
      {/* Main fixture circle - ALWAYS VISIBLE with minimum opacity, NOT affected by strobe */}
      <circle
        cx={x}
        cy={y}
        r="3.75"
        fill="#FF0000"
        stroke="#000000"
        strokeWidth="0.3"
        opacity={Math.max(0.3, baseBrightness)}
      />
      
      {/* Dynamic beam with semantic brightness-based scaling */}
      {effectiveBrightness > 0 && (
        <>
          {/* Outer beam glow */}
          <path
            d={`M ${x} ${y} 
                L ${x + normalizedX - perpX * 1.5} ${y + normalizedY - perpY * 1.5}
                L ${x + normalizedX + perpX * 1.5} ${y + normalizedY + perpY * 1.5}
                Z`}
            fill="url(#saberBeam)"
            opacity={effectiveBrightness * 0.4}
          />
          {/* Core beam */}
          <path
            d={`M ${x} ${y} 
                L ${x + normalizedX - perpX} ${y + normalizedY - perpY}
                L ${x + normalizedX + perpX} ${y + normalizedY + perpY}
                Z`}
            fill="#FF0000"
            opacity={effectiveBrightness * 0.7}
          />
        </>
      )}
      
      {/* Label - ALWAYS VISIBLE */}
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
        opacity={1.0}
      >
        {fixture.id}
      </text>
    </g>
  );
};