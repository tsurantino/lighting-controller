import { ControlsState, VisualPreset, ScrollDirection, EffectApplication, FixtureType } from './types';

export const TOP_LASER_COUNT = 14;
export const SIDE_LASER_COUNT = 14;
export const DEFAULT_BRIGHTNESS = 255;

// Helper function to recalculate DMX values based on current fixture properties
export const updateFixtureDmxValues = (fixture: any, masterDimmer: number = 100): any => {
  switch (fixture.type) {
    case FixtureType.MovingHead:
      return {
        ...fixture,
        dmxChannels: {
          ...fixture.dmxChannels,
          DMX_1_PANMOVE: fixture.panMove, // Controlled by lighting system
          DMX_2_TILTMOVE: fixture.tiltMove, // Controlled by lighting system
          DMX_6_DIMMER: Math.round(((fixture.brightness * masterDimmer) / 10000) * 255), // brightness * master dimmer
          DMX_10_PANTILTMOVEMENTSPEED: Math.round((fixture.speed / 100) * 255), // Based on speed property
        }
      };
    
    case FixtureType.SaberBeam:
      return {
        ...fixture,
        dmxChannels: {
          ...fixture.dmxChannels,
          DMX_1_RED: Math.round(((fixture.brightness * masterDimmer) / 10000) * 255), // brightness * master dimmer
        }
      };
    
    case FixtureType.Jolt:
      return {
        ...fixture,
        dmxChannels: {
          ...fixture.dmxChannels,
          DMX_1_RED_Z1: Math.round(((fixture.zones.zone1.red * masterDimmer) / 10000) * 255),
          DMX_4_WHITE_Z1: Math.round(((fixture.zones.zone1.white * masterDimmer) / 10000) * 255),
          DMX_5_RED_Z2: Math.round(((fixture.zones.zone2.red * masterDimmer) / 10000) * 255),
          DMX_8_WHITE_Z2: Math.round(((fixture.zones.zone2.white * masterDimmer) / 10000) * 255),
          DMX_9_RED_Z3: Math.round(((fixture.zones.zone3.red * masterDimmer) / 10000) * 255),
          DMX_12_WHITE_Z3: Math.round(((fixture.zones.zone3.white * masterDimmer) / 10000) * 255),
        }
      };
    
    case FixtureType.Shocker:
      return {
        ...fixture,
        dmxChannels: {
          ...fixture.dmxChannels,
          DMX_1_Z1: fixture.zones.zone1 ? 255 : 0,
          DMX_2_Z2: fixture.zones.zone2 ? 255 : 0,
          DMX_3_Z3: fixture.zones.zone3 ? 255 : 0,
          DMX_4_Z4: fixture.zones.zone4 ? 255 : 0,
          DMX_7_DIMMER: Math.round(((fixture.brightness * masterDimmer) / 10000) * 255), // brightness * master dimmer
        }
      };
    
    default:
      return fixture;
  }
};

// Helper function to create default moving head fixture
const createDefaultMovingHead = (id: string, startDmxAddress: number, x: number, y: number) => {
  const brightness = 100; // 0-100%
  const speed = 50; // 0-100%
  
  return {
    id,
    type: FixtureType.MovingHead as const,
    position: { x, y },
    startDmxAddress,
    brightness,
    panMove: 127, // Center position (0-255)
    tiltMove: 127, // Center position (0-255)
    speed,
    dmxChannels: {
      DMX_1_PANMOVE: 127, // Center position
      DMX_2_TILTMOVE: 127, // Center position
      DMX_3_COLORS: 13, // Red (fixed)
      DMX_4_GOBO: 0, // Open (fixed)
      DMX_5_SHUTTERSTROBE: 8, // Shutter Open (fixed)
      DMX_6_DIMMER: Math.round((brightness / 100) * 255), // Based on brightness property
      DMX_7_MACRO: 0, // Fixed
      DMX_8_PanTiltMacroSpeed: 0, // Fixed
      DMX_9_DIMMERCURVE: 0, // Fixed
      DMX_10_PANTILTMOVEMENTSPEED: Math.round((speed / 100) * 255), // Based on speed property
      DMX_11_SPECIALFUNC: 0, // Fixed
    },
  };
};

// Helper function to create default saber beam fixture
const createDefaultSaberBeam = (id: string, startDmxAddress: number, x: number, y: number) => {
  const brightness = 100; // 0-100%
  
  return {
    id,
    type: FixtureType.SaberBeam as const,
    position: { x, y },
    startDmxAddress,
    brightness,
    dmxChannels: {
      DMX_1_RED: Math.round((brightness / 100) * 255), // Based on brightness property (always red)
      DMX_2_GREEN: 0, // Fixed
      DMX_3_BLUE: 0, // Fixed
      DMX_4_WHITE: 0, // Fixed
    },
  };
};

// Helper function to create default jolt fixture
const createDefaultJolt = (id: string, startDmxAddress: number, x: number, y: number) => {
  const brightness = 100; // 0-100%
  const zones = {
    zone1: { red: 100, white: 0 }, // Default: full red, no white
    zone2: { red: 100, white: 0 },
    zone3: { red: 100, white: 0 },
  };
  
  return {
    id,
    type: FixtureType.Jolt as const,
    position: { x, y },
    startDmxAddress,
    brightness,
    zones,
    dmxChannels: {
      DMX_1_RED_Z1: Math.round((zones.zone1.red / 100) * 255), // Based on zone1 red
      DMX_2_GREEN_Z1: 0, // Fixed
      DMX_3_BLUE_Z1: 0, // Fixed
      DMX_4_WHITE_Z1: Math.round((zones.zone1.white / 100) * 255), // Based on zone1 white
      DMX_5_RED_Z2: Math.round((zones.zone2.red / 100) * 255), // Based on zone2 red
      DMX_6_GREEN_Z2: 0, // Fixed
      DMX_7_BLUE_Z2: 0, // Fixed
      DMX_8_WHITE_Z2: Math.round((zones.zone2.white / 100) * 255), // Based on zone2 white
      DMX_9_RED_Z3: Math.round((zones.zone3.red / 100) * 255), // Based on zone3 red
      DMX_10_GREEN_Z3: 0, // Fixed
      DMX_11_BLUE_Z3: 0, // Fixed
      DMX_12_WHITE_Z3: Math.round((zones.zone3.white / 100) * 255), // Based on zone3 white
    },
  };
};

// Helper function to create default shocker fixture
const createDefaultShocker = (id: string, startDmxAddress: number, x: number, y: number) => {
  const brightness = 100; // 0-100%
  const zones = {
    zone1: true, // All zones on by default
    zone2: true,
    zone3: true,
    zone4: true,
  };
  
  return {
    id,
    type: FixtureType.Shocker as const,
    position: { x, y },
    startDmxAddress,
    brightness,
    zones,
    dmxChannels: {
      DMX_1_Z1: zones.zone1 ? 255 : 0, // 255 if zone on, 0 if off
      DMX_2_Z2: zones.zone2 ? 255 : 0, // 255 if zone on, 0 if off
      DMX_3_Z3: zones.zone3 ? 255 : 0, // 255 if zone on, 0 if off
      DMX_4_Z4: zones.zone4 ? 255 : 0, // 255 if zone on, 0 if off
      DMX_5_PROGRAM: 0, // Fixed
      DMX_6_AUTOSPEED: 0, // Fixed
      DMX_7_DIMMER: Math.round((brightness / 100) * 255), // Based on brightness property
      DMX_8_STROBEALL: 0, // Fixed
    },
  };
};

// Create default fixtures with positions as specified in the diagram
const DEFAULT_FIXTURES = {
  // Moving Heads
  MH1: createDefaultMovingHead('MH1', 1, 0, 0),     // Top left (position 0,0)
  MH2: createDefaultMovingHead('MH2', 12, 14, 14),  // Bottom right (position 14,14)
  
  // Saber Beams  
  SA1: createDefaultSaberBeam('SA1', 23, 11, 0),    // Position (11,0)
  SA2: createDefaultSaberBeam('SA2', 27, 14, 0),    // Position (14,0)
  SA3: createDefaultSaberBeam('SA3', 31, 14, 3),    // Position (14,3)
  
  // Jolts
  J1: createDefaultJolt('J1', 35, 7, 2),            // Position (8,2)  
  J2: createDefaultJolt('J2', 47, 12, 7),           // Position (12,8)
  
  // Shockers
  SH1: createDefaultShocker('SH1', 59, 2, 7),       // Position (2,8)
  SH2: createDefaultShocker('SH2', 67, 7, 12),       // Position (8,2)
};

export const INITIAL_CONTROLS_STATE: ControlsState = {
  dimmer: 100,
  strobePulseRate: 0,
  strobeOrPulse: 'strobe',
  effectApplication: EffectApplication.All,
  visualPreset: VisualPreset.Grid,
  scrollDirection: ScrollDirection.None,
  laserMoveSpeed: 50,
  shockerSpeed: 50,
  saberSpeed: 50,
  mhSpeed: 50,
  scrollLaserCount: 5,
  scrollFade: 50,
  scrollBuildEffect: false,
  scrollPhase: 0,
  loopEffect: false,
  hazeDensity: 30,
  linearGradient: 70,
  showLaserOrigins: false,
  beatSyncEnabled: false,
  bpm: 140,
  beatStrobeRate: 'Off',
  beatPulseRate: 'Off',
  beatLaserMoveSpeedRate: 'Off',
  beatShockerSpeedRate: 'Off',
  beatSaberSpeedRate: 'Off',
  beatMhSpeedRate: 'Off',
  
  // Initialize with default fixtures
  fixtures: DEFAULT_FIXTURES,
};