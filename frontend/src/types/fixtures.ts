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