// src/types/controls.ts
import { LaserData } from './laser';

export enum VisualPreset {
  Grid = 'Grid',
  Bracket = 'Bracket',
  LBracket = 'L Bracket',
  SCross = 'S Cross',
  Cross = 'Cross',
  LCross = 'L Cross',
  SDblCross = 'S Dbl Cross',
  DblCross = 'Dbl Cross',
  LDblCross = 'L Dbl Cross',
  Cube = 'Cube',
  FourCubes = '4 Cubes',
  NineCubes = '9 Cubes',
}

export enum ScrollDirection {
  None = 'None',
  LeftToRight = 'LeftToRight',
  RightToLeft = 'RightToLeft',
  TopToBottom = 'TopToBottom',
  BottomToTop = 'BottomToTop',
  ToTL = 'ToTL',
  ToTR = 'ToTR',
  ToBL = 'ToBL',
  ToBR = 'ToBR',
  FromTL = 'FromTL',
  FromTR = 'FromTR',
  FromBL = 'FromBL',
  FromBR = 'FromBR',
  Out = 'Out',
  In = 'In',
  Pinwheel = 'Pinwheel',
  Spot = 'Spot',
}

export enum EffectApplication {
  All = 'All',
  Alternate = 'Alternate',
}

export enum BeatRate {
  Quarter = 'Quarter',
  Half = 'Half',
  Whole = 'Whole',
  Double = 'Double',
}

export interface ControlsState {
  // Global controls
  dimmer: number;
  strobeOrPulse: 'strobe' | 'pulse';
  strobePulseRate: number;
  effectApplication: EffectApplication;
  
  // Visual controls
  visualPreset: VisualPreset;
  
  // Movement controls
  scrollDirection: ScrollDirection;
  scrollRate: number;
  scrollFade: number;
  scrollLaserCount: number;
  scrollPhase: number;
  loopEffect: boolean;
  scrollBuildEffect: boolean;
  
  // Beat sync
  beatSyncStrobe: boolean;
  beatSyncPulse: boolean;
  beatSyncMovement: boolean;
  beatRate: BeatRate;
  
  // MH controls
  mhSpeed: number;
  
  // Display options
  showLaserOrigins: boolean;
  
  // Fixture configuration
  fixtures: any; // Replace with proper fixture types
  lasers: LaserData[];
}