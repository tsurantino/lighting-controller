import React from 'react';
import { Laser, LaserOrientation, FixtureType, Fixture } from '../types';
import { TOP_LASER_COUNT, SIDE_LASER_COUNT } from '../constants';
import LaserBeam from './LaserBeam';

// ✅ UPDATED INTERFACE - Add masterDimmer
interface LaserSimulatorProps {
  lasers: Laser[];
  showLaserOrigins: boolean;
  hazeDensity: number;
  linearGradient: number;
  fixtures?: {
    MH1: any;
    MH2: any;
    SA1: any;
    SA2: any;
    SA3: any;
    J1: any;
    J2: any;
    SH1: any;
    SH2: any;
  };
  masterDimmer: number; // ✅ ADD THIS - 0-100
  saberTargets?: {      // ✅ ADD THIS - Optional custom targets
    SA1?: { x: number; y: number };
    SA2?: { x: number; y: number };
    SA3?: { x: number; y: number };
  };
}

// ✅ UPDATED MOVING HEAD - Uses semantic properties + master dimmer
const MovingHeadFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
  masterDimmer: number;
}> = ({ fixture, x, y, masterDimmer }) => {
  // ✅ Use semantic properties for beam direction
  const panAngle = ((fixture.panMove - 127.5) / 127.5) * 180; // -180 to 180 degrees
  const tiltAngle = ((fixture.tiltMove - 127.5) / 127.5) * 90; // -90 to 90 degrees
  
  // ✅ Calculate effective brightness from semantic properties + master dimmer
  const effectiveBrightness = (fixture.brightness / 100) * (masterDimmer / 100);
  
  // ✅ Dynamic beam properties based on semantic properties
  const beamSpread = 15 + (fixture.speed / 100) * 10; // 15-25° based on speed
  const beamLength = 25 + (effectiveBrightness * 20); // 25-45 based on brightness
  
  const isPointingDown = tiltAngle > 30;
  const beamVisibility = Math.cos(Math.abs(tiltAngle) * Math.PI / 180);
  
  return (
    <g>
      {/* ✅ Fixture brightness from semantic property + master dimmer */}
      <circle
        cx={x}
        cy={y}
        r="3.75"
        fill="#FF0000"
        stroke="#000000"
        strokeWidth="0.3"
        opacity={effectiveBrightness}
      />
      
      {/* ✅ Pan/tilt indicator from semantic properties */}
      <circle
        cx={x + Math.sin((panAngle * Math.PI) / 180) * 2.25}
        cy={y + Math.cos((panAngle * Math.PI) / 180) * 2.25}
        r="1.2"
        fill="#FF4444"
        opacity={effectiveBrightness}
      />
      
      {/* ✅ DYNAMIC BEAM - Direction from semantic pan/tilt, size from brightness */}
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
      
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
        opacity={Math.max(0.3, effectiveBrightness)}
      >
        {fixture.id}
      </text>
    </g>
  );
};

// ✅ UPDATED SABER BEAM - No hardcoded targets + dynamic properties
const SaberBeamFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
  masterDimmer: number;
  targetPosition?: { x: number; y: number };
  gridToLaserPosition: (gridX: number, gridY: number) => { x: number; y: number };
}> = ({ fixture, x, y, masterDimmer, targetPosition, gridToLaserPosition }) => {
  
  // ✅ Use semantic brightness property + master dimmer
  const effectiveBrightness = (fixture.brightness / 100) * (masterDimmer / 100);
  
  // ✅ Configurable target (no more hardcoded yellow star)
  const getDefaultTarget = () => {
    return gridToLaserPosition(7, 7); // Default to center
  };
  
  const target = targetPosition || getDefaultTarget();
  
  // Calculate beam direction
  const deltaX = target.x - x;
  const deltaY = target.y - y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // ✅ Dynamic beam properties based on semantic brightness
  const beamLength = Math.max(10, 25 * effectiveBrightness);
  const beamWidth = 2 + (effectiveBrightness * 3);
  
  const normalizedX = distance > 0 ? (deltaX / distance) * beamLength : 0;
  const normalizedY = distance > 0 ? (deltaY / distance) * beamLength : 0;
  const perpX = distance > 0 ? (-deltaY / distance) * beamWidth : 0;
  const perpY = distance > 0 ? (deltaX / distance) * beamWidth : 0;
  
  return (
    <g>
      {/* ✅ Main fixture with semantic brightness */}
      <circle
        cx={x}
        cy={y}
        r="3.75"
        fill="#FF0000"
        stroke="#000000"
        strokeWidth="0.3"
        opacity={effectiveBrightness}
      />
      
      {/* ✅ Dynamic beam with semantic brightness-based scaling */}
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
      
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
        opacity={Math.max(0.3, effectiveBrightness)}
      >
        {fixture.id}
      </text>
    </g>
  );
};

// ✅ UPDATED JOLT - Uses semantic zone properties + master dimmer
const JoltFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
  masterDimmer: number;
}> = ({ fixture, x, y, masterDimmer }) => {
  
  // ✅ Use semantic zone properties
  const zone1Brightness = Math.max(fixture.zones.zone1.red, fixture.zones.zone1.white) / 100;
  const zone2Brightness = Math.max(fixture.zones.zone2.red, fixture.zones.zone2.white) / 100;
  const zone3Brightness = Math.max(fixture.zones.zone3.red, fixture.zones.zone3.white) / 100;
  
  // ✅ Apply master dimmer to semantic properties
  const masterFactor = masterDimmer / 100;
  const effectiveZone1 = zone1Brightness * masterFactor;
  const effectiveZone2 = zone2Brightness * masterFactor;
  const effectiveZone3 = zone3Brightness * masterFactor;
  
  // ✅ Calculate zone colors from semantic properties
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
  
  // ✅ Overall fixture brightness from semantic properties
  const overallBrightness = (fixture.brightness / 100) * masterFactor;
  const activeBrightness = (effectiveZone1 + effectiveZone2 + effectiveZone3) / 3;
  const finalBrightness = Math.max(overallBrightness, activeBrightness);
  
  const width = 7.5;
  const height = 7.5;
  const zoneWidth = width / 3;
  
  return (
    <g>
      {/* ✅ Zone rectangles with semantic property-based brightness */}
      {[0, 1, 2].map(zoneIndex => (
        <rect
          key={zoneIndex}
          x={x - width/2 + zoneIndex * zoneWidth}
          y={y - height/2}
          width={zoneWidth}
          height={height}
          fill={zoneColors[zoneIndex]}
          stroke="#000000"
          strokeWidth="0.1"
          opacity={zoneOpacities[zoneIndex]}
        />
      ))}
      
      {/* ✅ DYNAMIC MULTI-LAYER GLOW - Scales with semantic brightness */}
      {finalBrightness > 0 && (
        <>
          <circle
            cx={x}
            cy={y}
            r={25 * Math.max(0.3, finalBrightness)}
            fill="url(#joltSpotlight)"
            opacity={finalBrightness * 0.7}
          />
          <circle
            cx={x}
            cy={y}
            r={15 * Math.max(0.5, finalBrightness)}
            fill="url(#joltSpotlight)"
            opacity={finalBrightness * 0.9}
          />
          <circle
            cx={x}
            cy={y}
            r={8 * Math.max(0.3, finalBrightness)}
            fill="#FF0000"
            opacity={finalBrightness * 0.6}
          />
        </>
      )}
      
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
        opacity={Math.max(0.3, finalBrightness)}
      >
        {fixture.id}
      </text>
    </g>
  );
};

// ✅ UPDATED SHOCKER - Uses semantic zone properties + master dimmer
const ShockerFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
  masterDimmer: number;
}> = ({ fixture, x, y, masterDimmer }) => {
  
  // ✅ Use semantic zone boolean properties
  const zoneStates = [
    fixture.zones.zone1,
    fixture.zones.zone2,
    fixture.zones.zone3,
    fixture.zones.zone4,
  ];
  
  // ✅ Calculate brightness from semantic properties
  const baseBrightness = (fixture.brightness / 100) * (masterDimmer / 100);
  const activeZones = zoneStates.filter(Boolean).length;
  const zoneFactor = activeZones / 4;
  const effectiveBrightness = baseBrightness * zoneFactor;
  
  const zoneColors = zoneStates.map(isOn => isOn ? '#FF0000' : '#374151');
  
  const width = 7.5;
  const height = 7.5;
  const zoneWidth = width / 4;
  
  return (
    <g>
      {/* ✅ Zone rectangles based on semantic zone states */}
      {[0, 1, 2, 3].map(zoneIndex => (
        <rect
          key={zoneIndex}
          x={x - width/2 + zoneIndex * zoneWidth}
          y={y - height/2}
          width={zoneWidth}
          height={height}
          fill={zoneColors[zoneIndex]}
          stroke="#000000"
          strokeWidth="0.1"
          opacity={zoneStates[zoneIndex] ? baseBrightness : 0.3}
        />
      ))}
      
      {/* ✅ DYNAMIC GLOW - Based on semantic brightness and active zones */}
      {effectiveBrightness > 0 && (
        <>
          <circle
            cx={x}
            cy={y}
            r={28 * Math.max(0.3, effectiveBrightness)}
            fill="url(#shockerSpotlight)"
            opacity={effectiveBrightness * 0.8}
          />
          <circle
            cx={x}
            cy={y}
            r={18 * Math.max(0.5, effectiveBrightness)}
            fill="url(#shockerSpotlight)"
            opacity={effectiveBrightness * 0.9}
          />
          <circle
            cx={x}
            cy={y}
            r={10 * Math.max(0.3, effectiveBrightness)}
            fill="#FF0000"
            opacity={effectiveBrightness * 0.7}
          />
        </>
      )}
      
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
        opacity={Math.max(0.3, effectiveBrightness)}
      >
        {fixture.id}
      </text>
    </g>
  );
};

// ✅ MAIN COMPONENT - Property-based architecture
const LaserSimulator: React.FC<LaserSimulatorProps> = ({ 
  lasers, 
  showLaserOrigins, 
  hazeDensity, 
  linearGradient,
  fixtures,
  masterDimmer,
  saberTargets
}) => {
  const calculatePosition = (index: number, count: number): number => {
    if (count <= 1) {
      return 50;
    }
    return (index / (count - 1)) * 100;
  };

  const gridToLaserPosition = (gridX: number, gridY: number) => {
    const calculatePosition = (index: number, count: number): number => {
      if (count <= 1) {
        return 50;
      }
      return (index / (count - 1)) * 100;
    };
    
    const xPercent = calculatePosition(gridX, 15);
    const yPercent = calculatePosition(gridY, 15);
    
    return { x: xPercent, y: yPercent };
  };

  const topLasers = lasers.filter(l => l.orientation === LaserOrientation.Top);
  const sideLasers = lasers.filter(l => l.orientation === LaserOrientation.Side);

  const containerStyle: React.CSSProperties = {
    boxShadow: `0 0 30px rgba(255,0,0,0.3), inset 0 0 ${hazeDensity * 1.5}px rgba(255,0,0,${hazeDensity / 400})`,
  };

  // ✅ Use semantic fixture positions (no hardcoded positions)
  const fixturePositions = fixtures ? {
    MH1: gridToLaserPosition(fixtures.MH1.position.x, fixtures.MH1.position.y),
    MH2: gridToLaserPosition(fixtures.MH2.position.x, fixtures.MH2.position.y),
    SA1: gridToLaserPosition(fixtures.SA1.position.x, fixtures.SA1.position.y),
    SA2: gridToLaserPosition(fixtures.SA2.position.x, fixtures.SA2.position.y),
    SA3: gridToLaserPosition(fixtures.SA3.position.x, fixtures.SA3.position.y),
    J1: gridToLaserPosition(fixtures.J1.position.x, fixtures.J1.position.y),
    J2: gridToLaserPosition(fixtures.J2.position.x, fixtures.J2.position.y),
    SH1: gridToLaserPosition(fixtures.SH1.position.x, fixtures.SH1.position.y),
    SH2: gridToLaserPosition(fixtures.SH2.position.x, fixtures.SH2.position.y),
  } : {};

  // ✅ Calculate effective brightness for dynamic gradients
  const getEffectiveBrightness = (fixture: any) => {
    const masterFactor = masterDimmer / 100;
    
    switch (fixture.type) {
      case FixtureType.MovingHead:
        return (fixture.brightness / 100) * masterFactor;
      
      case FixtureType.SaberBeam:
        return (fixture.brightness / 100) * masterFactor;
      
      case FixtureType.Jolt:
        const joltAvg = (
          Math.max(fixture.zones.zone1.red, fixture.zones.zone1.white) +
          Math.max(fixture.zones.zone2.red, fixture.zones.zone2.white) +
          Math.max(fixture.zones.zone3.red, fixture.zones.zone3.white)
        ) / 3;
        return (joltAvg / 100) * masterFactor;
      
      case FixtureType.Shocker:
        const activeZones = [
          fixture.zones.zone1,
          fixture.zones.zone2,
          fixture.zones.zone3,
          fixture.zones.zone4,
        ].filter(Boolean).length;
        return (fixture.brightness / 100) * (activeZones / 4) * masterFactor;
      
      default:
        return 0;
    }
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
        {/* ✅ DYNAMIC GRADIENTS BASED ON SEMANTIC PROPERTIES */}
        <defs>
          {/* Moving head beam gradient - Enhanced but still static for now */}
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
            <stop offset="0%" stopColor="#FF0000" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#FF4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="shockerSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF0000" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#FF4444" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* ✅ ALL FIXTURES USE SEMANTIC PROPERTIES + MASTER DIMMER */}
        {fixtures && (
          <g>
            <MovingHeadFixture 
              fixture={fixtures.MH1} 
              x={fixturePositions.MH1.x} 
              y={fixturePositions.MH1.y}
              masterDimmer={masterDimmer}
            />
            <MovingHeadFixture 
              fixture={fixtures.MH2} 
              x={fixturePositions.MH2.x} 
              y={fixturePositions.MH2.y}
              masterDimmer={masterDimmer}
            />
            
            <SaberBeamFixture 
              fixture={fixtures.SA1} 
              x={fixturePositions.SA1.x} 
              y={fixturePositions.SA1.y}
              masterDimmer={masterDimmer}
              targetPosition={saberTargets?.SA1}
              gridToLaserPosition={gridToLaserPosition}
            />
            <SaberBeamFixture 
              fixture={fixtures.SA2} 
              x={fixturePositions.SA2.x} 
              y={fixturePositions.SA2.y}
              masterDimmer={masterDimmer}
              targetPosition={saberTargets?.SA2}
              gridToLaserPosition={gridToLaserPosition}
            />
            <SaberBeamFixture 
              fixture={fixtures.SA3} 
              x={fixturePositions.SA3.x} 
              y={fixturePositions.SA3.y}
              masterDimmer={masterDimmer}
              targetPosition={saberTargets?.SA3}
              gridToLaserPosition={gridToLaserPosition}
            />
            
            <JoltFixture 
              fixture={fixtures.J1} 
              x={fixturePositions.J1.x} 
              y={fixturePositions.J1.y}
              masterDimmer={masterDimmer}
            />
            <JoltFixture 
              fixture={fixtures.J2} 
              x={fixturePositions.J2.x} 
              y={fixturePositions.J2.y}
              masterDimmer={masterDimmer}
            />
            
            <ShockerFixture 
              fixture={fixtures.SH1} 
              x={fixturePositions.SH1.x} 
              y={fixturePositions.SH1.y}
              masterDimmer={masterDimmer}
            />
            <ShockerFixture 
              fixture={fixtures.SH2} 
              x={fixturePositions.SH2.x} 
              y={fixturePositions.SH2.y}
              masterDimmer={masterDimmer}
            />
          </g>
        )}
      </svg>
      
      {/* Original laser beams overlay */}
      {topLasers.map((laser, index) => (
        <LaserBeam
          key={laser.id}
          orientation={laser.orientation}
          brightness={laser.brightness}
          position={calculatePosition(index, TOP_LASER_COUNT)}
          showOrigin={showLaserOrigins}
          hazeDensity={hazeDensity}
          linearGradient={linearGradient}
        />
      ))}
      
      {sideLasers.map((laser, index) => (
        <LaserBeam
          key={laser.id}
          orientation={laser.orientation}
          brightness={laser.brightness}
          position={calculatePosition(index, SIDE_LASER_COUNT)}
          showOrigin={showLaserOrigins}
          hazeDensity={hazeDensity}
          linearGradient={linearGradient}
        />
      ))}
    </div>
  );
};

export default LaserSimulator;