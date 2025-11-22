import React from 'react';
import { MovingHeadFixture } from './MovingHeadFixture';
import { SaberBeamFixture } from './SaberBeamFixture';
import { JoltFixture } from './JoltFixture';
import { ShockerFixture } from './ShockerFixture';
import { gridToLaserPosition } from './utils';

interface FixturesLayerProps {
  fixtures: {
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
  masterDimmer: number;
  saberTargets?: {
    SA1?: { x: number; y: number };
    SA2?: { x: number; y: number };
    SA3?: { x: number; y: number };
  };
  strobeRate?: number;
  pulseRate?: number;
  strobeOrPulse?: 'strobe' | 'pulse';
}

export const FixturesLayer: React.FC<FixturesLayerProps> = ({ 
  fixtures, 
  masterDimmer, 
  saberTargets,
  strobeRate = 0,
  pulseRate = 0,
  strobeOrPulse = 'strobe'
}) => {
  // Use semantic fixture positions (no hardcoded positions)
  const fixturePositions = {
    MH1: gridToLaserPosition(fixtures.MH1.position.x, fixtures.MH1.position.y),
    MH2: gridToLaserPosition(fixtures.MH2.position.x, fixtures.MH2.position.y),
    SA1: gridToLaserPosition(fixtures.SA1.position.x, fixtures.SA1.position.y),
    SA2: gridToLaserPosition(fixtures.SA2.position.x, fixtures.SA2.position.y),
    SA3: gridToLaserPosition(fixtures.SA3.position.x, fixtures.SA3.position.y),
    J1: gridToLaserPosition(fixtures.J1.position.x, fixtures.J1.position.y),
    J2: gridToLaserPosition(fixtures.J2.position.x, fixtures.J2.position.y),
    SH1: gridToLaserPosition(fixtures.SH1.position.x, fixtures.SH1.position.y),
    SH2: gridToLaserPosition(fixtures.SH2.position.x, fixtures.SH2.position.y),
  };

  return (
    <g>
      {/* Moving Head Fixtures */}
      <MovingHeadFixture 
        fixture={fixtures.MH1} 
        x={fixturePositions.MH1.x} 
        y={fixturePositions.MH1.y}
        masterDimmer={masterDimmer}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      <MovingHeadFixture 
        fixture={fixtures.MH2} 
        x={fixturePositions.MH2.x} 
        y={fixturePositions.MH2.y}
        masterDimmer={masterDimmer}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      
      {/* Saber Beam Fixtures */}
      <SaberBeamFixture 
        fixture={fixtures.SA1} 
        x={fixturePositions.SA1.x} 
        y={fixturePositions.SA1.y}
        masterDimmer={masterDimmer}
        targetPosition={saberTargets?.SA1}
        gridToLaserPosition={gridToLaserPosition}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      <SaberBeamFixture 
        fixture={fixtures.SA2} 
        x={fixturePositions.SA2.x} 
        y={fixturePositions.SA2.y}
        masterDimmer={masterDimmer}
        targetPosition={saberTargets?.SA2}
        gridToLaserPosition={gridToLaserPosition}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      <SaberBeamFixture 
        fixture={fixtures.SA3} 
        x={fixturePositions.SA3.x} 
        y={fixturePositions.SA3.y}
        masterDimmer={masterDimmer}
        targetPosition={saberTargets?.SA3}
        gridToLaserPosition={gridToLaserPosition}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      
      {/* Jolt Fixtures */}
      <JoltFixture 
        fixture={fixtures.J1} 
        x={fixturePositions.J1.x} 
        y={fixturePositions.J1.y}
        masterDimmer={masterDimmer}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      <JoltFixture 
        fixture={fixtures.J2} 
        x={fixturePositions.J2.x} 
        y={fixturePositions.J2.y}
        masterDimmer={masterDimmer}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      
      {/* Shocker Fixtures */}
      <ShockerFixture 
        fixture={fixtures.SH1} 
        x={fixturePositions.SH1.x} 
        y={fixturePositions.SH1.y}
        masterDimmer={masterDimmer}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
      <ShockerFixture 
        fixture={fixtures.SH2} 
        x={fixturePositions.SH2.x} 
        y={fixturePositions.SH2.y}
        masterDimmer={masterDimmer}
        strobeRate={strobeRate}
        pulseRate={pulseRate}
        strobeOrPulse={strobeOrPulse}
      />
    </g>
  );
};