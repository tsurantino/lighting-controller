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