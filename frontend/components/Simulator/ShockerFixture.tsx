import React from 'react';
import { BaseFixtureProps } from './types';

export const ShockerFixture: React.FC<BaseFixtureProps> = ({ fixture, x, y, masterDimmer, strobeRate = 0, pulseRate = 0, strobeOrPulse = 'strobe' }) => {
  // Use semantic zone boolean properties
  const zoneStates = [
    fixture.zones.zone1,
    fixture.zones.zone2,
    fixture.zones.zone3,
    fixture.zones.zone4,
  ];
  
  // Calculate brightness from semantic properties
  const baseBrightness = (fixture.brightness / 100) * (masterDimmer / 100);
  const activeZones = zoneStates.filter(Boolean).length;
  const zoneFactor = activeZones > 0 ? activeZones / 4 : 0;
  const baseEffectiveBrightness = Math.max(baseBrightness, zoneFactor * baseBrightness);

  // Apply strobe/pulse effect
  const currentTime = Date.now();
  const activeRate = strobeOrPulse === 'strobe' ? strobeRate : pulseRate;
  let effectMultiplier = 1;
  
  if (activeRate > 0) {
    const speed = (activeRate / 100) * 10; // Scale rate to reasonable speed
    const phase = (currentTime * speed) % (2 * Math.PI);
    
    if (strobeOrPulse === 'strobe') {
      // Strobe: quick on/off
      effectMultiplier = Math.sin(phase) > 0.5 ? 1 : 0;
    } else {
      // Pulse: smooth fade in/out
      effectMultiplier = Math.sin(phase) * 0.5 + 0.5;
    }
  }

  const effectiveBrightness = baseEffectiveBrightness * effectMultiplier;
  
  const zoneColors = zoneStates.map(isOn => isOn ? '#FF0000' : '#374151');
  
  const width = 12; // Increased from 7.5 for thicker zones  
  const height = 8;  // Increased from 7.5 for better proportions
  const zoneWidth = width / 4; // 4 zones instead of 3
  
  // Show only label when dimmer is 0%
  if (masterDimmer === 0) {
    return (
      <g>
        {/* Label with red background - visible at 0% dimmer */}
        <circle
          cx={x}
          cy={y}
          r="2.5"
          fill="rgba(255, 0, 0, 0.9)"
        />
        <text
          x={x}
          y={y + 0.5}
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
  }
  
  return (
    <g>
      {/* MUCH REDUCED GLOW - Behind the zones, fixed size with strobe opacity */}
      {effectiveBrightness > 0 && (
        <>
          {/* Outer glow - fixed size, strobe affects opacity */}
          <circle
            cx={x}
            cy={y}
            r={22}
            fill="url(#shockerSpotlight)"
            opacity={effectiveBrightness * 0.12}
          />
          {/* Middle glow - fixed size, strobe affects opacity */}
          <circle
            cx={x}
            cy={y}
            r={14}
            fill="url(#shockerSpotlight)"
            opacity={effectiveBrightness * 0.2}
          />
        </>
      )}

      {/* Zone rectangles with THICK black borders - Above the glow, 4 zones */}
      {[0, 1, 2, 3].map(zoneIndex => (
        <rect
          key={zoneIndex}
          x={x - width/2 + zoneIndex * zoneWidth}
          y={y - height/2}
          width={zoneWidth}
          height={height}
          fill={zoneColors[zoneIndex]}
          stroke="#000000"
          strokeWidth="1.2"
          opacity={zoneStates[zoneIndex] ? Math.max(0.8, baseBrightness * effectMultiplier) : 0.4}
        />
      ))}
      
      {/* Label with red background - ON TOP of fixture, no black border */}
      <circle
        cx={x}
        cy={y}
        r="2.5"
        fill="rgba(255, 0, 0, 0.9)"
      />
      <text
        x={x}
        y={y + 0.5}
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