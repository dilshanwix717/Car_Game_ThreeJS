import {
  Scene,
  Mesh,
  BoxGeometry,
  Box3,
  Vector3,
  PlaneGeometry,
  MeshStandardMaterial,
  Group,
} from 'three';
import type { LevelData, AABB, ParkingZoneDef } from '../types.ts';

/**
 * Builds level geometry from a data definition and returns
 * collision walls + parking zone info for other systems.
 */
export interface LevelObjects {
  walls: AABB[];
  parkingZone: ParkingZoneDef;
}

export function buildLevel(scene: Scene, data: LevelData, fenceModel?: Group): LevelObjects {
  const levelGroup = new Group();

  // ─── Measure fence model if provided ───────────────
  let fenceUnitLength = 1;
  let fenceUnitHeight = 1.2;
  if (fenceModel) {
    const box = new Box3().setFromObject(fenceModel);
    const size = new Vector3();
    box.getSize(size);
    fenceUnitLength = size.x || 2; // length along local X
    fenceUnitHeight = size.y || 1.2;
    // Normalise the model so it sits on y=0
    const minY = box.min.y;
    fenceModel.position.y = -minY;
  }

  // ─── Ground plane ──────────────────────────────────
  const groundGeo = new PlaneGeometry(200, 200);
  const groundMat = new MeshStandardMaterial({ color: 0x2a5a2a }); // dark green grass
  const ground = new Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01; // slightly below road to avoid z-fighting
  ground.receiveShadow = true;
  levelGroup.add(ground);

  // ─── Roads ─────────────────────────────────────────
  const roadMat = new MeshStandardMaterial({ color: 0x444444 });
  for (const seg of data.roads) {
    const geo = new BoxGeometry(seg.length, 0.05, seg.width);
    const mesh = new Mesh(geo, roadMat);
    mesh.position.set(seg.position.x, 0.025, seg.position.z);
    mesh.rotation.y = seg.rotation;
    mesh.receiveShadow = true;
    levelGroup.add(mesh);
  }

  // ─── Walls (visual + collision) ─────────────────────
  const wallMat = new MeshStandardMaterial({ color: 0x888888 });
  const wallHeight = fenceModel ? fenceUnitHeight : 1.2;
  const walls: AABB[] = [];

  for (const w of data.walls) {
    if (fenceModel) {
      // ── Tile fence models along the wall segment ──
      // Determine the "long" axis: length runs along X locally, width along Z.
      const longAxis = w.length >= w.width ? 'x' : 'z';
      const span = longAxis === 'x' ? w.length : w.width;
      const count = Math.max(1, Math.round(span / fenceUnitLength));
      const step = span / count;

      for (let i = 0; i < count; i++) {
        const clone = fenceModel.clone();

        // Scale the clone to fit the step size
        const scaleX = step / fenceUnitLength;
        clone.scale.set(scaleX, 1, 1);

        // Position along the wall
        if (longAxis === 'x') {
          const startX = w.position.x - w.length / 2 + step / 2 + i * step;
          clone.position.set(startX, 0, w.position.z);
          clone.rotation.y = w.rotation;
        } else {
          const startZ = w.position.z - w.width / 2 + step / 2 + i * step;
          clone.position.set(w.position.x, 0, startZ);
          clone.rotation.y = w.rotation + Math.PI / 2;
        }

        // Enable shadows on all children
        clone.traverse((child) => {
          if ((child as Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        levelGroup.add(clone);
      }
    } else {
      // Fallback: simple box walls
      const geo = new BoxGeometry(w.length, wallHeight, w.width);
      const mesh = new Mesh(geo, wallMat);
      mesh.position.set(w.position.x, wallHeight / 2, w.position.z);
      mesh.rotation.y = w.rotation;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      levelGroup.add(mesh);
    }

    // AABB for collision (axis-aligned approximation)
    const halfL = w.length / 2;
    const halfW = w.width / 2;
    const cos = Math.abs(Math.cos(w.rotation));
    const sin = Math.abs(Math.sin(w.rotation));
    const extentX = halfL * cos + halfW * sin;
    const extentZ = halfL * sin + halfW * cos;

    walls.push({
      minX: w.position.x - extentX,
      maxX: w.position.x + extentX,
      minZ: w.position.z - extentZ,
      maxZ: w.position.z + extentZ,
    });
  }

  // ─── Parking Zone (visual marker) ──────────────────
  const pz = data.parkingZone;
  const pzMat = new MeshStandardMaterial({
    color: 0x00cc66,
    transparent: true,
    opacity: 0.35,
  });
  const pzGeo = new BoxGeometry(pz.length, 0.06, pz.width);
  const pzMesh = new Mesh(pzGeo, pzMat);
  pzMesh.position.set(pz.position.x, 0.035, pz.position.z);
  pzMesh.rotation.y = pz.rotation;
  pzMesh.receiveShadow = true;
  levelGroup.add(pzMesh);

  // Parking border lines
  const borderMat = new MeshStandardMaterial({ color: 0xffffff });
  const lineThickness = 0.1;

  // Long sides (along length)
  for (const side of [-1, 1]) {
    const geo = new BoxGeometry(pz.length, 0.07, lineThickness);
    const mesh = new Mesh(geo, borderMat);
    mesh.position.set(
      pz.position.x,
      0.04,
      pz.position.z + (side * pz.width) / 2,
    );
    mesh.rotation.y = pz.rotation;
    levelGroup.add(mesh);
  }
  // Short sides (along width)
  for (const side of [-1, 1]) {
    const geo = new BoxGeometry(lineThickness, 0.07, pz.width);
    const mesh = new Mesh(geo, borderMat);
    mesh.position.set(
      pz.position.x + (side * pz.length) / 2,
      0.04,
      pz.position.z,
    );
    mesh.rotation.y = pz.rotation;
    levelGroup.add(mesh);
  }

  scene.add(levelGroup);

  return { walls, parkingZone: data.parkingZone };
}

// ═══════════════════════════════════════════════════════
// Level 1 — Data definition
// ═══════════════════════════════════════════════════════

/**
 * Level 1 — U-shaped track
 *
 * Layout (top-down, X→right, Z↓down on screen):
 *
 *   Start → ══════════════╗
 *                          ║
 *          [P] ← ═════════╝
 *
 * Road 1: east (+X)
 * Turn 1: right → south
 * Road 2: south (-Z)
 * Turn 2: right → west
 * Road 3: west (-X) → parking at end
 */
export const LEVEL_1: LevelData = {
  start: {
    position: { x: 0, z: 0 },
    rotation: 0, // facing +X (east)
  },
  roads: [
    // Road 1 — east (along +X)
    { position: { x: 20, z: 0 }, width: 8, length: 48, rotation: 0 },
    // Corner 1 — fills the right-turn area
    { position: { x: 44, z: -6 }, width: 16, length: 12, rotation: 0 },
    // Road 2 — south (along -Z)
    { position: { x: 46, z: -22 }, width: 8, length: 24, rotation: Math.PI / 2 },
    // Corner 2 — fills the second right-turn area
    { position: { x: 40, z: -34 }, width: 12, length: 16, rotation: 0 },
    // Road 3 — west (along -X), toward parking
    { position: { x: 22, z: -36 }, width: 8, length: 28, rotation: 0 },
  ],
  walls: [
    // ─── Road 1 — north wall (top edge) ──────────────
    { position: { x: 20, z: 4.5 }, width: 0.5, length: 48, rotation: 0 },
    // ─── Road 1 — south wall (bottom edge, stops before corner 1) ──
    { position: { x: 17, z: -4.5 }, width: 0.5, length: 38, rotation: 0 },
    // ─── Start wall (west end of road 1) ─────────────
    { position: { x: -4.5, z: 0 }, width: 9, length: 0.5, rotation: 0 },

    // ─── Outer east wall (right edge of roads 1→2, continuous) ──
    { position: { x: 50.5, z: -16 }, width: 42, length: 0.5, rotation: 0 },
    // ─── Inner west wall of Road 2 (stops with gaps at both corners) ──
    { position: { x: 41.5, z: -20 }, width: 16, length: 0.5, rotation: 0 },

    // ─── Road 3 — south wall (bottom edge, continuous with corner 2) ──
    { position: { x: 28, z: -40.5 }, width: 0.5, length: 46, rotation: 0 },
    // ─── Road 3 — north wall (top edge, stops before corner 2) ──
    { position: { x: 20, z: -31.5 }, width: 0.5, length: 24, rotation: 0 },

    // ─── End wall (west end of road 3) ───────────────
    { position: { x: 7.5, z: -36 }, width: 9, length: 0.5, rotation: 0 },
  ],
  parkingZone: {
    position: { x: 14, z: -36 },
    width: 3,
    length: 6,
    rotation: 0, // aligned along X-axis (car arrives heading -X / west)
  },
};
