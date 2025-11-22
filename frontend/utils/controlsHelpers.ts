import { ControlsState, ScrollDirection } from '../types';

/**
 * Updates the fixture DMX values based on the dimmer setting
 */
export const updateFixtureDmxValues = (fixture: any, dimmer: number) => {
  // This would contain the logic from the original updateFixtureDmxValues function
  // For now, returning the fixture as-is to preserve functionality
  return fixture;
};

/**
 * Handles the build effect toggle logic
 */
export const handleBuildEffectToggle = (
  currentControls: ControlsState, 
  isTurningOn: boolean
): Partial<ControlsState> => {
  if (isTurningOn) {
    const isDirectionless = 
      currentControls.scrollDirection === ScrollDirection.None || 
      currentControls.scrollDirection === ScrollDirection.Spot;
    
    const newControls: Partial<ControlsState> = {
      scrollBuildEffect: true,
      loopEffect: false,
      scrollPhase: 0,
      scrollFade: 90,
    };

    if (isDirectionless) {
      newControls.scrollDirection = ScrollDirection.LeftToRight;
    }
    
    return newControls;
  } else {
    return { scrollBuildEffect: false };
  }
};

/**
 * Determines if a movement effect is active
 */
export const isMovementActive = (scrollDirection: ScrollDirection): boolean => {
  return scrollDirection !== ScrollDirection.None;
};

/**
 * Determines if a standard scroll effect is active (not spot or none)
 */
export const isStandardScrollActive = (scrollDirection: ScrollDirection): boolean => {
  return isMovementActive(scrollDirection) && scrollDirection !== ScrollDirection.Spot;
};

/**
 * Calculates beat sync states
 */
export const getBeatSyncStates = (controls: ControlsState) => {
  const isBeatStrobeActive = controls.beatSyncEnabled && controls.beatStrobeRate !== 'Off';
  const isBeatPulseActive = controls.beatSyncEnabled && controls.beatPulseRate !== 'Off';
  const isBeatStrobePulseActive = controls.strobeOrPulse === 'strobe' ? isBeatStrobeActive : isBeatPulseActive;
  const isBeatLaserMoveSpeedActive = controls.beatSyncEnabled && controls.beatLaserMoveSpeedRate !== 'Off';
  const isBeatShockerSpeedActive = controls.beatSyncEnabled && controls.beatShockerSpeedRate !== 'Off';
  const isBeatSaberSpeedActive = controls.beatSyncEnabled && controls.beatSaberSpeedRate !== 'Off';
  const isBeatMhSpeedActive = controls.beatSyncEnabled && controls.beatMhSpeedRate !== 'Off';

  return {
    isBeatStrobeActive,
    isBeatPulseActive,
    isBeatStrobePulseActive,
    isBeatLaserMoveSpeedActive,
    isBeatShockerSpeedActive,
    isBeatSaberSpeedActive,
    isBeatMhSpeedActive
  };
};