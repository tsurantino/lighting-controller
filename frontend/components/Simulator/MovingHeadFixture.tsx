import React from 'react';
import { BaseFixtureProps } from './types';

export const MovingHeadFixture: React.FC<BaseFixtureProps> = ({ fixture, x, y, masterDimmer, strobeRate = 0, pulseRate = 0, strobeOrPulse = 'strobe' }) => {
  // Use semantic properties for beam direction
  const panAngle = ((fixture.panMove - 127.5) / 127.5) * 180; // -180 to 180 degrees
  const tiltAngle = ((fixture.tiltMove - 127.5) / 127.5) * 90; // -90 to 90 degrees
  
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
  
  // Fixed beam properties - no resizing during strobe/pulse, size based on base brightness
  const beamSpread = 15 + (fixture.speed / 100) * 10; // 15-25° based on speed
  const beamLength = 25 + (baseBrightness * 20); // 25-45 based on base brightness (fixed size)
  
  const isPointingDown = tiltAngle > 30;
  const beamVisibility = Math.cos(Math.abs(tiltAngle) * Math.PI / 180);
  
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
      
      {/* Pan/tilt indicator - ALWAYS VISIBLE with minimum opacity, NOT affected by strobe */}
      <circle
        cx={x + Math.sin((panAngle * Math.PI) / 180) * 2.25}
        cy={y + Math.cos((panAngle * Math.PI) / 180) * 2.25}
        r="1.2"
        fill="#FF4444"
        opacity={Math.max(0.3, baseBrightness)}
      />
      
      {/* DYNAMIC BEAM - Direction from semantic pan/tilt, size from brightness */}
      {effectiveBrightness > 0 && (
        <>
          {isPointingDown ? (
            // Floor spotlight - size based on height/distance
            <ellipse
              cx={x + Math.sin((panAngle * Math.PI) / 180) * 16}
              cy={y + Math.cos((panAngle * Math.PI) / 180) * 16}
              rx={8 + (Math.abs(tiltAngle) / 90) * 12}
              ry={11 + (Math.abs(tiltAngle) / 90) * 15}
              fill="url(#movingHeadSpotlight)"
              opacity={effectiveBrightness * beamVisibility * 0.8}
              transform={`rotate(${panAngle} ${x + Math.sin((panAngle * Math.PI) / 180) * 16} ${y + Math.cos((panAngle * Math.PI) / 180) * 16})`}
            />
          ) : (
            // Air beam - dynamic spread and length
            <>
              {/* Outer beam */}
              <path
                d={`M ${x} ${y} 
                    L ${x + Math.sin(((panAngle - beamSpread) * Math.PI) / 180) * beamLength} ${y + Math.cos(((panAngle - beamSpread) * Math.PI) / 180) * beamLength}
                    L ${x + Math.sin(((panAngle + beamSpread) * Math.PI) / 180) * beamLength} ${y + Math.cos(((panAngle + beamSpread) * Math.PI) / 180) * beamLength}
                    Z`}
                fill="url(#movingHeadBeam)"
                opacity={effectiveBrightness * beamVisibility * 0.5}
              />
              {/* Inner beam - focused core */}
              <path
                d={`M ${x} ${y} 
                    L ${x + Math.sin(((panAngle - beamSpread/2) * Math.PI) / 180) * (beamLength * 0.8)} ${y + Math.cos(((panAngle - beamSpread/2) * Math.PI) / 180) * (beamLength * 0.8)}
                    L ${x + Math.sin(((panAngle + beamSpread/2) * Math.PI) / 180) * (beamLength * 0.8)} ${y + Math.cos(((panAngle + beamSpread/2) * Math.PI) / 180) * (beamLength * 0.8)}
                    Z`}
                fill="#FF0000"
                opacity={effectiveBrightness * beamVisibility * 0.7}
              />
            </>
          )}
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