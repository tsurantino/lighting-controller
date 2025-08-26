// src/constants/index.ts
import { ControlsState, VisualPreset, ScrollDirection, EffectApplication, BeatRate } from '../types';

export const TOP_LASER_COUNT = 14;
export const SIDE_LASER_COUNT = 14;
export const DEFAULT_BRIGHTNESS = 255;

// Socket configuration
export const SOCKET_CONFIG = {
  URL: 'http://localhost:5000',
  TIMEOUT: 5000,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  MAX_RECONNECTION_ATTEMPTS: 5,
} as const;

// Initial controls state
export const INITIAL_CONTROLS_STATE: ControlsState = {
  // Global controls
  dimmer: 100,
  strobeOrPulse: 'pulse',
  strobePulseRate: 0,
  effectApplication: EffectApplication.All,
  
  // Visual controls
  visualPreset: VisualPreset.Grid,
  
  // Movement controls
  scrollDirection: ScrollDirection.None,
  scrollRate: 50,
  scrollFade: 20,
  scrollLaserCount: 5,
  scrollPhase: 0,
  loopEffect: false,
  scrollBuildEffect: false,
  
  // Beat sync
  beatSyncStrobe: false,
  beatSyncPulse: false,
  beatSyncMovement: false,
  beatRate: BeatRate.Quarter,
  
  // MH controls
  mhSpeed: 50,
  
  // Display options
  showLaserOrigins: false,
  hazeDensity: 30,        // Added missing property
  linearGradient: 70,     // Added missing property
  
  // Fixture configuration (initialize as empty)
  fixtures: {},
  lasers: [],
};