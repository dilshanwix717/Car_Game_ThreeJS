// ─── Input ─────────────────────────────────────────────
export interface InputState {
  steering: -1 | 0 | 1;
  accelerate: boolean;
  brake: boolean;
}

// ─── Level Data ────────────────────────────────────────
export interface Vec2 {
  x: number;
  z: number;
}

export interface RoadSegment {
  position: Vec2;
  width: number;
  length: number;
  rotation: number; // radians
}

export interface WallDef {
  position: Vec2;
  width: number;
  length: number;
  rotation: number; // radians
}

export interface ParkingZoneDef {
  position: Vec2;
  width: number;
  length: number;
  rotation: number; // radians
}

export interface StartDef {
  position: Vec2;
  rotation: number; // radians
}

export interface LevelData {
  roads: RoadSegment[];
  walls: WallDef[];
  start: StartDef;
  parkingZone: ParkingZoneDef;
}

// ─── Collision ─────────────────────────────────────────
export interface AABB {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}
