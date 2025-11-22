export interface BaseFixtureProps {
  fixture: any;
  x: number;
  y: number;
  masterDimmer: number;
  strobeRate?: number;  // 0-100 strobe rate
  pulseRate?: number;   // 0-100 pulse rate
  strobeOrPulse?: 'strobe' | 'pulse'; // Which effect is active
}

export interface SaberBeamFixtureProps extends BaseFixtureProps {
  targetPosition?: { x: number; y: number };
  gridToLaserPosition: (gridX: number, gridY: number) => { x: number; y: number };
}