import { ControlsState, VisualPreset, ScrollDirection, EffectApplication } from './types';

export const TOP_LASER_COUNT = 14;
export const SIDE_LASER_COUNT = 14;
export const DEFAULT_BRIGHTNESS = 255;

export const INITIAL_CONTROLS_STATE: ControlsState = {
  dimmer: 100,
  strobePulseRate: 0, // New combined rate
  strobeOrPulse: 'strobe', // Default to strobe
  effectApplication: EffectApplication.All,
  visualPreset: VisualPreset.Grid,
  scrollDirection: ScrollDirection.None,
  laserMoveSpeed: 60,
  shockerSpeed: 50,
  saberSpeed: 50,
  scrollLaserCount: 8,
  scrollFade: 90,
  scrollBuildEffect: false,
  scrollPhase: 0,
  loopEffect: false,
  hazeDensity: 80,
  linearGradient: 95,
  showLaserOrigins: false,
  beatSyncEnabled: false,
  bpm: 140,
  beatStrobeRate: 'Off',
  beatPulseRate: 'Off',
  beatLaserMoveSpeedRate: 'Off',
  beatShockerSpeedRate: 'Off',
  beatSaberSpeedRate: 'Off',
};