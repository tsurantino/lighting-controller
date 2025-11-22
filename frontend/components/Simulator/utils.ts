import { FixtureType } from '../../types';

export const gridToLaserPosition = (gridX: number, gridY: number) => {
  const calculatePosition = (index: number, count: number): number => {
    if (count <= 1) {
      return 50;
    }
    return (index / (count - 1)) * 100;
  };
  
  const xPercent = calculatePosition(gridX, 15);
  const yPercent = calculatePosition(gridY, 15);
  
  return { x: xPercent, y: yPercent };
};

export const getEffectiveBrightness = (fixture: any, masterDimmer: number) => {
  const masterFactor = masterDimmer / 100;
  
  switch (fixture.type) {
    case FixtureType.MovingHead:
      return (fixture.brightness / 100) * masterFactor;
    
    case FixtureType.SaberBeam:
      return (fixture.brightness / 100) * masterFactor;
    
    case FixtureType.Jolt:
      const joltAvg = (
        Math.max(fixture.zones.zone1.red, fixture.zones.zone1.white) +
        Math.max(fixture.zones.zone2.red, fixture.zones.zone2.white) +
        Math.max(fixture.zones.zone3.red, fixture.zones.zone3.white)
      ) / 3;
      return (joltAvg / 100) * masterFactor;
    
    case FixtureType.Shocker:
      const activeZones = [
        fixture.zones.zone1,
        fixture.zones.zone2,
        fixture.zones.zone3,
        fixture.zones.zone4,
      ].filter(Boolean).length;
      return (fixture.brightness / 100) * (activeZones / 4) * masterFactor;
    
    default:
      return 0;
  }
};