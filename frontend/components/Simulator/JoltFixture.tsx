import React from 'react';
import { BaseFixtureProps } from './types';

export const JoltFixture: React.FC<BaseFixtureProps> = ({ fixture, x, y, masterDimmer, strobeRate = 0, pulseRate = 0, strobeOrPulse = 'strobe' }) => {
  // Use semantic zone properties
  const zone1Brightness = Math.max(fixture.zones.zone1.red, fixture.zones.zone1.white) / 100;
  const zone2Brightness = Math.max(fixture.zones.zone2.red, fixture.zones.zone2.white) / 100;
  const zone3Brightness = Math.max(fixture.zones.zone3.red, fixture.zones.zone3.white) / 100;
  
  // Apply master dimmer to semantic properties
  const masterFactor = masterDimmer / 100;
  const baseZone1 = zone1Brightness * masterFactor;
  const baseZone2 = zone2Brightness * masterFactor;
  const baseZone3 = zone3Brightness * masterFactor;

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

  const effectiveZone1 = baseZone1 * effectMultiplier;
  const effectiveZone2 = baseZone2 * effectMultiplier;
  const effectiveZone3 = baseZone3 * effectMultiplier;
  
  // Calculate zone colors from semantic properties
  const getZoneColor = (zone: { red: number; white: number }) => {
    if (zone.red > zone.white) return '#FF0000';
    if (zone.white > 0) return '#FFFFFF';
    return '#374151';
  };
  
  const zoneColors = [
    getZoneColor(fixture.zones.zone1),
    getZoneColor(fixture.zones.zone2),
    getZoneColor(fixture.zones.zone3),
  ];
  
  const zoneOpacities = [effectiveZone1, effectiveZone2, effectiveZone3];
  
  // Overall fixture brightness from semantic properties with strobe effect
  const overallBrightness = (fixture.brightness / 100) * masterFactor * effectMultiplier;
  const activeBrightness = (effectiveZone1 + effectiveZone2 + effectiveZone3) / 3;
  const finalBrightness = Math.max(overallBrightness, activeBrightness);
  
  const width = 12; // Increased from 7.5 for thicker zones
  const height = 8;  // Increased from 7.5 for better proportions
  const zoneWidth = width / 3;
  
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
      {/* MUCH REDUCED GLOW - Behind the zones, respects strobe effect */}
      {finalBrightness > 0 && (
        <>
          {/* Outer glow - fixed size, strobe affects opacity */}
          <circle
            cx={x}
            cy={y}
            r={22}
            fill="url(#joltSpotlight)"
            opacity={finalBrightness * 0.12}
          />
          {/* Middle glow - fixed size, strobe affects opacity */}
          <circle
            cx={x}
            cy={y}
            r={14}
            fill="url(#joltSpotlight)"
            opacity={finalBrightness * 0.2}
          />
        </>
      )}

      {/* Zone rectangles with THICK black borders - Above the glow */}
      {[0, 1, 2].map(zoneIndex => (
        <rect
          key={zoneIndex}
          x={x - width/2 + zoneIndex * zoneWidth}
          y={y - height/2}
          width={zoneWidth}
          height={height}
          fill={zoneColors[zoneIndex]}
          stroke="#000000"
          strokeWidth="1.2"
          opacity={Math.max(0.8, zoneOpacities[zoneIndex])}
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