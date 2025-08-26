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

// New fixture types
export enum FixtureType {
  MovingHead = 'MovingHead',
  SaberBeam = 'SaberBeam',
  Jolt = 'Jolt',
  Shocker = 'Shocker',
}

export interface Position {
  x: number; // 0-13 (14x14 grid)
  y: number; // 0-13 (14x14 grid)
}

// Base fixture interface
export interface BaseFixture {
  id: string;
  type: FixtureType;
  position: Position;
  startDmxAddress: number;
  brightness: number; // 0-100 (master brightness)
}

export interface LaserData {
  id: string;
  orientation: LaserOrientation;
  brightness: number; // 0-255
  dmxAddress: number;
}

// Moving Head fixture (MH1, MH2)
export interface MovingHeadFixture extends BaseFixture {
  type: FixtureType.MovingHead;
  panMove: number; // 0-255
  tiltMove: number; // 0-255
  speed: number; // 0-100 (for MH Speed slider)
  dmxChannels: {
    DMX_1_PANMOVE: number;
    DMX_2_TILTMOVE: number;
    DMX_3_COLORS: number; // 13 (Red)
    DMX_4_GOBO: number; // 0 (Open)
    DMX_5_SHUTTERSTROBE: number; // 8 (Shutter Open)
    DMX_6_DIMMER: number; // 0-255 based on brightness
    DMX_7_MACRO: number; // 0
    DMX_8_PanTiltMacroSpeed: number; // 0
    DMX_9_DIMMERCURVE: number; // 0
    DMX_10_PANTILTMOVEMENTSPEED: number; // 0-255 based on speed
    DMX_11_SPECIALFUNC: number; // 0
  };
}

// Saber Beam fixture (SA1, SA2, SA3)
export interface SaberBeamFixture extends BaseFixture {
  type: FixtureType.SaberBeam;
  dmxChannels: {
    DMX_1_RED: number; // 0-255 based on brightness
    DMX_2_GREEN: number; // 0
    DMX_3_BLUE: number; // 0
    DMX_4_WHITE: number; // 0
  };
}

// Jolt fixture (J1, J2)
export interface JoltFixture extends BaseFixture {
  type: FixtureType.Jolt;
  zones: {
    zone1: { red: number; white: number }; // 0-100 each
    zone2: { red: number; white: number }; // 0-100 each
    zone3: { red: number; white: number }; // 0-100 each
  };
  dmxChannels: {
    DMX_1_RED_Z1: number; // 0-255 based on zone1.red
    DMX_2_GREEN_Z1: number; // 0
    DMX_3_BLUE_Z1: number; // 0
    DMX_4_WHITE_Z1: number; // 0-255 based on zone1.white
    DMX_5_RED_Z2: number; // 0-255 based on zone2.red
    DMX_6_GREEN_Z2: number; // 0
    DMX_7_BLUE_Z2: number; // 0
    DMX_8_WHITE_Z2: number; // 0-255 based on zone2.white
    DMX_9_RED_Z3: number; // 0-255 based on zone3.red
    DMX_10_GREEN_Z3: number; // 0
    DMX_11_BLUE_Z3: number; // 0
    DMX_12_WHITE_Z3: number; // 0-255 based on zone3.white
  };
}

// Shocker fixture (SH1, SH2)
export interface ShockerFixture extends BaseFixture {
  type: FixtureType.Shocker;
  zones: {
    zone1: boolean; // on/off
    zone2: boolean; // on/off
    zone3: boolean; // on/off
    zone4: boolean; // on/off
  };
  dmxChannels: {
    DMX_1_Z1: number; // 255 if zone1 on, 0 if off
    DMX_2_Z2: number; // 255 if zone2 on, 0 if off
    DMX_3_Z3: number; // 255 if zone3 on, 0 if off
    DMX_4_Z4: number; // 255 if zone4 on, 0 if off
    DMX_5_PROGRAM: number; // 0
    DMX_6_AUTOSPEED: number; // 0
    DMX_7_DIMMER: number; // 0-255 based on brightness
    DMX_8_STROBEALL: number; // 0
  };
}

export type Fixture = MovingHeadFixture | SaberBeamFixture | JoltFixture | ShockerFixture;

export interface ControlsState {
  lasers?: LaserData[];

  dimmer: number;
  strobePulseRate: number; // New combined rate
  strobeOrPulse: 'strobe' | 'pulse'; // New effect toggle
  effectApplication: EffectApplication;
  visualPreset: VisualPreset;
  scrollDirection: ScrollDirection;
  laserMoveSpeed: number;
  shockerSpeed: number;
  saberSpeed: number;
  mhSpeed: number; // New MH Speed slider
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
  beatMhSpeedRate: BeatRate; // New beat rate for MH Speed
  
  // New fixture configurations
  fixtures: {
    MH1: MovingHeadFixture;
    MH2: MovingHeadFixture;
    SA1: SaberBeamFixture;
    SA2: SaberBeamFixture;
    SA3: SaberBeamFixture;
    J1: JoltFixture;
    J2: JoltFixture;
    SH1: ShockerFixture;
    SH2: ShockerFixture;
  };
}

export interface LaserSimulatorProps {
  lasers: Laser[];
  showLaserOrigins: boolean;
  hazeDensity: number;
  linearGradient: number;
  fixtures?: {
    MH1: MovingHeadFixture;
    MH2: MovingHeadFixture;
    SA1: SaberBeamFixture;
    SA2: SaberBeamFixture;
    SA3: SaberBeamFixture;
    J1: JoltFixture;
    J2: JoltFixture;
    SH1: ShockerFixture;
    SH2: ShockerFixture;
  };
  masterDimmer: number; // ✅ 0-100 (master brightness control)
  saberTargets?: {      // ✅ Optional custom targets for saber beams
    SA1?: { x: number; y: number };
    SA2?: { x: number; y: number };
    SA3?: { x: number; y: number };
  };
}