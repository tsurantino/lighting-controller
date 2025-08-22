export enum LaserOrientation {
  Top = "top",
  Side = "side",
}

export interface Laser {
  id: string;
  orientation: LaserOrientation;
  brightness: number; // 0-255
}

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
  Spot = 'Spot',
  LeftToRight = 'L to R',
  RightToLeft = 'R to L',
  TopToBottom = 'T to B',
  BottomToTop = 'B to T',
  ToTL = 'To TL',
  ToTR = 'To TR',
  ToBL = 'To BL',
  ToBR = 'To BR',
  OutFromCenter = 'Out from Center',
  TowardsCenter = 'Towards Center',
  Pinwheel = 'Pinwheel',
}

export enum EffectApplication {
  All = 'All',
  Alternate = 'Alternate',
}

export type BeatRate = 'Off' | '1/3' | '1/2' | '1' | '3' | '4';
export type ViewMode = 'pane' | 'landscape';

export interface ControlsState {
  dimmer: number;
  strobePulseRate: number; // New combined rate
  strobeOrPulse: 'strobe' | 'pulse'; // New effect toggle
  effectApplication: EffectApplication;
  visualPreset: VisualPreset;
  scrollDirection: ScrollDirection;
  laserMoveSpeed: number;
  shockerSpeed: number;
  saberSpeed: number;
  scrollLaserCount: number;
  scrollFade: number;
  scrollBuildEffect: boolean;
  scrollPhase: number;
  loopEffect: boolean;
  hazeDensity: number;
  linearGradient: number;
  showLaserOrigins: boolean;
  beatSyncEnabled: boolean;
  bpm: number;
  beatStrobeRate: BeatRate;
  beatPulseRate: BeatRate;
  beatLaserMoveSpeedRate: BeatRate;
  beatShockerSpeedRate: BeatRate;
  beatSaberSpeedRate: BeatRate;
}