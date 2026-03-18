// ─── World Scale ───────────────────────────────────────
export const UNIT_SCALE = 1; // 1 unit = 1 metre

// ─── Car Dimensions ───────────────────────────────────
export const CAR_LENGTH = 4.5;  // metres (x-axis = forward)
export const CAR_WIDTH = 2.0;   // metres (z-axis = lateral)
export const CAR_HEIGHT = 1.5;  // metres (y-axis)

// ─── Road ─────────────────────────────────────────────
export const ROAD_WIDTH = 8.0;

// ─── Parking Zone ─────────────────────────────────────
export const PARKING_LENGTH = 6.0;
export const PARKING_WIDTH = 3.0;

// ─── Physics ──────────────────────────────────────────
export const MAX_FORWARD_SPEED = 15;   // m/s  (~54 km/h)
export const MAX_REVERSE_SPEED = 5;    // m/s
export const ACCELERATION = 8;         // m/s²
export const BRAKE_DECEL = 12;         // m/s²
export const FRICTION = 3;             // m/s²  (natural deceleration)
export const MAX_STEER_ANGLE = 0.6;    // radians
export const WHEELBASE = 3.0;          // metres (front-to-rear axle)
export const COLLISION_SPEED_FACTOR = 0.4;

// ─── Parking Detection Thresholds ─────────────────────
export const PARK_SPEED_THRESHOLD = 0.3;   // m/s
export const PARK_ANGLE_THRESHOLD = 15;    // degrees

// ─── Game Loop ────────────────────────────────────────
export const MAX_DELTA = 0.05; // seconds

// ─── Camera ───────────────────────────────────────────
export const CAMERA_OFFSET_Y = 5;
export const CAMERA_OFFSET_Z = -10;
export const CAMERA_LERP_FACTOR = 4;  // higher = snappier follow

// ─── Renderer ─────────────────────────────────────────
export const BACKGROUND_COLOR = 0x1a1a1a;

// ─── Lighting ─────────────────────────────────────────
export const AMBIENT_INTENSITY = 0.4;
export const DIR_LIGHT_INTENSITY = 1.0;
export const DIR_LIGHT_POSITION = { x: 10, y: 20, z: 10 } as const;
export const SHADOW_MAP_SIZE = 2048;
