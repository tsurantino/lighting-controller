import React from 'react';
import { Laser, LaserOrientation, FixtureType, Fixture } from '../types';
import { TOP_LASER_COUNT, SIDE_LASER_COUNT } from '../constants';
import LaserBeam from './LaserBeam';

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
}

// Component for rendering moving head fixtures
const MovingHeadFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
}> = ({ fixture, x, y }) => {
  // Calculate beam direction based on pan/tilt
  const panAngle = ((fixture.panMove - 127.5) / 127.5) * 180; // -180 to 180 degrees
  const tiltAngle = ((fixture.tiltMove - 127.5) / 127.5) * 90; // -90 to 90 degrees
  
  const isPointingDown = tiltAngle > 45; // Consider pointing at ground if tilt > 45°
  
  return (
    <g>
      {/* Main fixture circle */}
      <circle
        cx={x}
        cy={y}
        r="3.75"
        fill="#FF0000"
        stroke="#000000"
        strokeWidth="0.3"
        opacity={fixture.brightness / 100}
      />
      
      {/* Pan/tilt indicator circle */}
      <circle
        cx={x + Math.sin((panAngle * Math.PI) / 180) * 2.25}
        cy={y + Math.cos((panAngle * Math.PI) / 180) * 2.25}
        r="1.2"
        fill="#FF4444"
        opacity={fixture.brightness / 100}
      />
      
      {/* Beam effect */}
      {fixture.brightness > 0 && (
        <>
          {isPointingDown ? (
            // Spotlight on ground
            <ellipse
              cx={x + Math.sin((panAngle * Math.PI) / 180) * 12}
              cy={y + Math.cos((panAngle * Math.PI) / 180) * 12}
              rx="8"
              ry="11"
              fill="url(#movingHeadSpotlight)"
              opacity={(fixture.brightness / 100) * 0.6}
              transform={`rotate(${panAngle} ${x + Math.sin((panAngle * Math.PI) / 180) * 12} ${y + Math.cos((panAngle * Math.PI) / 180) * 12})`}
            />
          ) : (
            // Widening beam
            <path
              d={`M ${x} ${y} 
                  L ${x + Math.sin(((panAngle - 15) * Math.PI) / 180) * 24} ${y + Math.cos(((panAngle - 15) * Math.PI) / 180) * 24}
                  L ${x + Math.sin(((panAngle + 15) * Math.PI) / 180) * 24} ${y + Math.cos(((panAngle + 15) * Math.PI) / 180) * 24}
                  Z`}
              fill="url(#movingHeadBeam)"
              opacity={(fixture.brightness / 100) * 0.4}
            />
          )}
        </>
      )}
      
      {/* Fixture label */}
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
      >
        {fixture.id}
      </text>
    </g>
  );
};

// Component for rendering saber beam fixtures
const SaberBeamFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
}> = ({ fixture, x, y }) => {
  // Calculate direction to yellow star at grid position (12, 2)
  const gridToLaserPosition = (gridX: number, gridY: number) => {
    const calculatePosition = (index: number, count: number): number => {
      if (count <= 1) return 50;
      return (index / (count - 1)) * 100;
    };
    const xPercent = calculatePosition(gridX, 15);
    const yPercent = calculatePosition(gridY, 15);
    return { x: xPercent, y: yPercent };
  };
  
  const starPosition = gridToLaserPosition(12, 2); // Yellow star location
  const deltaX = starPosition.x - x;
  const deltaY = starPosition.y - y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Normalize direction and scale for beam
  const beamLength = 18; // Scaled up beam length
  const beamWidth = 3; // Scaled up beam width
  const normalizedX = (deltaX / distance) * beamLength;
  const normalizedY = (deltaY / distance) * beamLength;
  const perpX = (-deltaY / distance) * beamWidth;
  const perpY = (deltaX / distance) * beamWidth;
  
  return (
    <g>
      {/* Main fixture circle */}
      <circle
        cx={x}
        cy={y}
        r="3.75"
        fill="#FF0000"
        stroke="#000000"
        strokeWidth="0.3"
        opacity={fixture.brightness / 100}
      />
      
      {/* Beam pointing toward yellow star */}
      {fixture.brightness > 0 && (
        <path
          d={`M ${x} ${y} 
              L ${x + normalizedX - perpX} ${y + normalizedY - perpY}
              L ${x + normalizedX + perpX} ${y + normalizedY + perpY}
              Z`}
          fill="url(#saberBeam)"
          opacity={(fixture.brightness / 100) * 0.5}
        />
      )}
      
      {/* Fixture label */}
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
      >
        {fixture.id}
      </text>
    </g>
  );
};

// Component for rendering jolt fixtures (3 zones)
const JoltFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
}> = ({ fixture, x, y }) => {
  const zoneColors = [
    fixture.zones.zone1.red > 0 ? '#FF0000' : fixture.zones.zone1.white > 0 ? '#FFFFFF' : '#374151',
    fixture.zones.zone2.red > 0 ? '#FF0000' : fixture.zones.zone2.white > 0 ? '#FFFFFF' : '#374151',
    fixture.zones.zone3.red > 0 ? '#FF0000' : fixture.zones.zone3.white > 0 ? '#FFFFFF' : '#374151'
  ];
  
  // Match circle height: 7.5 wide x 7.5 high, divided into 3 zones
  const width = 7.5;
  const height = 7.5;
  const zoneWidth = width / 3; // 2.5 each
  
  return (
    <g>
      {/* Main fixture rectangle with 3 zones */}
      <rect
        x={x - width/2}
        y={y - height/2}
        width={zoneWidth}
        height={height}
        fill={zoneColors[0]}
        stroke="#000000"
        strokeWidth="0.1"
        opacity={fixture.brightness / 100}
      />
      <rect
        x={x - width/2 + zoneWidth}
        y={y - height/2}
        width={zoneWidth}
        height={height}
        fill={zoneColors[1]}
        stroke="#000000"
        strokeWidth="0.1"
        opacity={fixture.brightness / 100}
      />
      <rect
        x={x - width/2 + 2*zoneWidth}
        y={y - height/2}
        width={zoneWidth}
        height={height}
        fill={zoneColors[2]}
        stroke="#000000"
        strokeWidth="0.1"
        opacity={fixture.brightness / 100}
      />
      
      {/* Large soft spotlight around fixture */}
      {fixture.brightness > 0 && (
        <circle
          cx={x}
          cy={y}
          r="12"
          fill="url(#joltSpotlight)"
          opacity={(fixture.brightness / 100) * 0.3}
        />
      )}
      
      {/* Fixture label */}
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
      >
        {fixture.id}
      </text>
    </g>
  );
};

// Component for rendering shocker fixtures (4 zones)
const ShockerFixture: React.FC<{
  fixture: any;
  x: number;
  y: number;
}> = ({ fixture, x, y }) => {
  const zoneColors = [
    fixture.zones.zone1 ? '#FF0000' : '#374151',
    fixture.zones.zone2 ? '#FF0000' : '#374151',
    fixture.zones.zone3 ? '#FF0000' : '#374151',
    fixture.zones.zone4 ? '#FF0000' : '#374151'
  ];
  
  // Match circle height: 7.5 wide x 7.5 high, divided into 4 zones
  const width = 7.5;
  const height = 7.5;
  const zoneWidth = width / 4; // 1.875 each
  
  return (
    <g>
      {/* Main fixture rectangle with 4 zones (horizontal tiles, same size as jolts) */}
      {/* Zone 1 */}
      <rect
        x={x - width/2}
        y={y - height/2}
        width={zoneWidth}
        height={height}
        fill={zoneColors[0]}
        stroke="#000000"
        strokeWidth="0.1"
        opacity={fixture.brightness / 100}
      />
      {/* Zone 2 */}
      <rect
        x={x - width/2 + zoneWidth}
        y={y - height/2}
        width={zoneWidth}
        height={height}
        fill={zoneColors[1]}
        stroke="#000000"
        strokeWidth="0.1"
        opacity={fixture.brightness / 100}
      />
      {/* Zone 3 */}
      <rect
        x={x - width/2 + 2*zoneWidth}
        y={y - height/2}
        width={zoneWidth}
        height={height}
        fill={zoneColors[2]}
        stroke="#000000"
        strokeWidth="0.1"
        opacity={fixture.brightness / 100}
      />
      {/* Zone 4 */}
      <rect
        x={x - width/2 + 3*zoneWidth}
        y={y - height/2}
        width={zoneWidth}
        height={height}
        fill={zoneColors[3]}
        stroke="#000000"
        strokeWidth="0.1"
        opacity={fixture.brightness / 100}
      />
      
      {/* Large soft spotlight around fixture */}
      {fixture.brightness > 0 && (
        <circle
          cx={x}
          cy={y}
          r="12"
          fill="url(#shockerSpotlight)"
          opacity={(fixture.brightness / 100) * 0.4}
        />
      )}
      
      {/* Fixture label */}
      <text
        x={x}
        y={y + 1.0}
        textAnchor="middle"
        fill="#000000"
        fontSize="2.0"
        fontWeight="bold"
      >
        {fixture.id}
      </text>
    </g>
  );
};

const LaserSimulator: React.FC<LaserSimulatorProps> = ({ 
  lasers, 
  showLaserOrigins, 
  hazeDensity, 
  linearGradient,
  fixtures 
}) => {
  const calculatePosition = (index: number, count: number): number => {
    if (count <= 1) {
      return 50;
    }
    return (index / (count - 1)) * 100;
  };

  // Convert grid position (0-14) to match laser positioning
  const gridToLaserPosition = (gridX: number, gridY: number) => {
    // Use the same calculation as laser positioning
    const calculatePosition = (index: number, count: number): number => {
      if (count <= 1) {
        return 50;
      }
      return (index / (count - 1)) * 100;
    };
    
    // For a 14x14 grid (positions 0-14), convert to percentages
    const xPercent = calculatePosition(gridX, 15); // 15 because we have positions 0-14
    const yPercent = calculatePosition(gridY, 15);
    
    // Convert percentages to actual coordinates within the container
    // The container is aspect-square, so we use the same calculation for both dimensions
    return { x: xPercent, y: yPercent };
  };

  const topLasers = lasers.filter(l => l.orientation === LaserOrientation.Top);
  const sideLasers = lasers.filter(l => l.orientation === LaserOrientation.Side);

  const containerStyle: React.CSSProperties = {
    boxShadow: `0 0 30px rgba(255,0,0,0.3), inset 0 0 ${hazeDensity * 1.5}px rgba(255,0,0,${hazeDensity / 400})`,
  };

  // Default fixture positions as specified
  const fixturePositions = {
    MH1: gridToLaserPosition(0, 0),     // top left
    MH2: gridToLaserPosition(14, 14),   // bottom right
    SA1: gridToLaserPosition(11, 0),    // 
    SA2: gridToLaserPosition(14, 0),    // 
    SA3: gridToLaserPosition(14, 3),    // 
    J1: gridToLaserPosition(8, 2),      // 
    J2: gridToLaserPosition(12, 8),     // 
    SH1: gridToLaserPosition(2, 8),     // 
    SH2: gridToLaserPosition(8, 2),     // 
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
        {/* Gradient definitions for lighting effects */}
        <defs>
          {/* Moving head beam gradient */}
          <radialGradient id="movingHeadBeam" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          
          {/* Moving head spotlight gradient */}
          <radialGradient id="movingHeadSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          
          {/* Saber beam gradient */}
          <linearGradient id="saberBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
          
          {/* Jolt spotlight gradient */}
          <radialGradient id="joltSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          
          {/* Shocker spotlight gradient */}
          <radialGradient id="shockerSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Render fixtures if provided */}
        {fixtures && (
          <g>
            {/* Moving Heads */}
            <MovingHeadFixture 
              fixture={fixtures.MH1} 
              x={fixturePositions.MH1.x} 
              y={fixturePositions.MH1.y}
            />
            <MovingHeadFixture 
              fixture={fixtures.MH2} 
              x={fixturePositions.MH2.x} 
              y={fixturePositions.MH2.y}
            />
            
            {/* Saber Beams */}
            <SaberBeamFixture 
              fixture={fixtures.SA1} 
              x={fixturePositions.SA1.x} 
              y={fixturePositions.SA1.y}
            />
            <SaberBeamFixture 
              fixture={fixtures.SA2} 
              x={fixturePositions.SA2.x} 
              y={fixturePositions.SA2.y}
            />
            <SaberBeamFixture 
              fixture={fixtures.SA3} 
              x={fixturePositions.SA3.x} 
              y={fixturePositions.SA3.y}
            />
            
            {/* Jolts */}
            <JoltFixture 
              fixture={fixtures.J1} 
              x={fixturePositions.J1.x} 
              y={fixturePositions.J1.y}
            />
            <JoltFixture 
              fixture={fixtures.J2} 
              x={fixturePositions.J2.x} 
              y={fixturePositions.J2.y}
            />
            
            {/* Shockers */}
            <ShockerFixture 
              fixture={fixtures.SH1} 
              x={fixturePositions.SH1.x} 
              y={fixturePositions.SH1.y}
            />
            <ShockerFixture 
              fixture={fixtures.SH2} 
              x={fixturePositions.SH2.x} 
              y={fixturePositions.SH2.y}
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