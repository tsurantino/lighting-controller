// src/types/laser.ts
export enum LaserOrientation {
  Top = 'top',
  Side = 'side',
}

export interface Laser {
  id: string;
  orientation: LaserOrientation;
  brightness: number;
  dmxAddress: number;
  x?: number;
  y?: number;
}

export interface LaserData {
  id: string;
  orientation: LaserOrientation;
  brightness: number;
  dmxAddress: number;
}

// src/types/fixtures.ts
export enum FixtureType {
  MovingHead = 'MovingHead',
  SaberBeam = 'SaberBeam',
  Jolt = 'Jolt',
  Shocker = 'Shocker',
}

export interface BaseFixture {
  id: string;
  type: FixtureType;
  name: string;
  brightness: number;
  dmxChannels: Record<string, number>;
}

export interface MovingHeadFixture extends BaseFixture {
  type: FixtureType.MovingHead;
  panMove: number;
  tiltMove: number;
  speed: number;
}