// src/components/visualization/LaserVisualization.tsx
import React from 'react';
import { Laser, LaserOrientation, Fixture, FixtureType } from '../../types';
import LaserBeam from './LaserBeam';
import { 
  MovingHeadFixtureComponent,
  SaberBeamFixtureComponent, 
  JoltFixtureComponent,
  ShockerFixtureComponent 
} from './FixtureComponents';

interface LaserVisualizationProps {
  lasers: Laser[];
  fixtures?: Record<string, Fixture>;
  showLaserOrigins?: boolean;
  hazeDensity?: number;
  linearGradient?: number;
  masterDimmer?: number;
  className?: string;
}

const LaserVisualization: React.FC<LaserVisualizationProps> = ({
  lasers,
  fixtures = {},
  showLaserOrigins = false,
  hazeDensity = 50,
  linearGradient = 75,
  masterDimmer = 100,
  className = "",
}) => {
  const TOP_LASER_COUNT = 14;
  const SIDE_LASER_COUNT = 14;

  // Separate lasers by orientation
  const topLasers = lasers.filter(laser => laser.orientation === LaserOrientation.Top);
  const sideLasers = lasers.filter(laser => laser.orientation === LaserOrientation.Side);

  // Calculate laser positions
  const calculatePosition = (index: number, totalCount: number) => {
    return {
      x: ((index + 1) / (totalCount + 1)) * 100,
      y: ((index + 1) / (totalCount + 1)) * 100,
    };
  };

  // Fixture positions (these would normally come from configuration)
  const fixturePositions = {
    MH1: { x: 20, y: 20 },
    MH2: { x: 80, y: 20 },
    SA1: { x: 20, y: 50 },
    SA2: { x: 80, y: 50 },
    J1: { x: 20, y: 80 },
    J2: { x: 80, y: 80 },
    SH1: { x: 40, y: 30 },
    SH2: { x: 60, y: 70 },
  };

  // Container style for responsive sizing
  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
  };

  return (
    <div 
      className={`relative w-full aspect-square max-w-2xl mx-auto bg-black border-2 border-red-500/30 rounded-lg overflow-hidden ${className}`}
      style={containerStyle}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="-5 -5 110 110"
        className="absolute inset-0"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definitions for fixtures */}
        <defs>
          <radialGradient id="movingHeadBeam" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#FF0000" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FF4444" stopOpacity="0.6" />
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
        </defs>

        {/* Grid lines */}
        <g opacity="0.1" stroke="#666" strokeWidth="0.2">
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line x1={i * 10} y1="0" x2={i * 10} y2="100" />
              <line x1="0" y1={i * 10} x2="100" y2={i * 10} />
            </g>
          ))}
        </g>

        {/* Fixtures */}
        {Object.keys(fixtures).map((fixtureId) => {
          const fixture = fixtures[fixtureId];
          const position = fixturePositions[fixtureId as keyof typeof fixturePositions];
          if (!position || !fixture) return null;

          switch (fixture.type) {
            case FixtureType.MovingHead:
              return (
                <MovingHeadFixtureComponent
                  key={fixtureId}
                  fixture={fixture}
                  x={position.x}
                  y={position.y}
                  masterDimmer={masterDimmer}
                />
              );
            case FixtureType.SaberBeam:
              return (
                <SaberBeamFixtureComponent
                  key={fixtureId}
                  fixture={fixture}
                  x={position.x}
                  y={position.y}
                  masterDimmer={masterDimmer}
                />
              );
            case FixtureType.Jolt:
              return (
                <JoltFixtureComponent
                  key={fixtureId}
                  fixture={fixture}
                  x={position.x}
                  y={position.y}
                  masterDimmer={masterDimmer}
                />
              );
            case FixtureType.Shocker:
              return (
                <ShockerFixtureComponent
                  key={fixtureId}
                  fixture={fixture}
                  x={position.x}
                  y={position.y}
                  masterDimmer={masterDimmer}
                />
              );
            default:
              return null;
          }
        })}
      </svg>
      
      {/* Laser beams overlay */}
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

export default LaserVisualization;