export type TileType = 'safe' | 'bounce' | 'slide' | 'crumble' | 'mystery' | 'entry' | 'exit';

export interface TileData {
  id: string;
  x: number; // grid coordinate X
  z: number; // grid coordinate Z
  type: TileType;
  label?: string;
  route?: 'short' | 'long' | 'cross' | 'hub';
  staggerOffset: number; // phase shift for floating animation
}

export interface ArenaLayout {
  id: string;
  entryPos: [number, number, number];
  exitPos: [number, number, number];
  tiles: TileData[];
}

export type CameraMode = 'follow' | 'overview';
