import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from 'three';
import { CAR_LENGTH, CAR_WIDTH, CAR_HEIGHT } from '../constants.ts';

/**
 * Builds a simple car mesh from primitives.
 * The Group pivot is at center-bottom of the body.
 * Forward direction is +X local.
 */
export function createCarMesh(): Group {
  const car = new Group();

  // ─── Body ────────────────────────────────────────────
  const bodyGeo = new BoxGeometry(CAR_LENGTH, CAR_HEIGHT, CAR_WIDTH);
  const bodyMat = new MeshStandardMaterial({ color: 0xcc2222 });
  const body = new Mesh(bodyGeo, bodyMat);
  body.position.y = CAR_HEIGHT / 2; // bottom at y = 0
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  // ─── Roof ────────────────────────────────────────────
  const roofW = CAR_LENGTH * 0.45;
  const roofH = CAR_HEIGHT * 0.45;
  const roofD = CAR_WIDTH * 0.85;
  const roofGeo = new BoxGeometry(roofW, roofH, roofD);
  const roofMat = new MeshStandardMaterial({ color: 0x333333 });
  const roof = new Mesh(roofGeo, roofMat);
  roof.position.set(-CAR_LENGTH * 0.05, CAR_HEIGHT + roofH / 2, 0);
  roof.castShadow = true;
  car.add(roof);

  // ─── Wheels ──────────────────────────────────────────
  const wheelRadius = 0.35;
  const wheelWidth = 0.25;
  const wheelGeo = new CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
  const wheelMat = new MeshStandardMaterial({ color: 0x111111 });

  const axleX = CAR_LENGTH * 0.35; // distance from center to front/rear axle
  const wheelZ = CAR_WIDTH / 2 + wheelWidth / 2 - 0.05;
  const wheelY = wheelRadius;

  const wheelPositions: [number, number, number][] = [
    [ axleX, wheelY,  wheelZ],  // front-right
    [ axleX, wheelY, -wheelZ],  // front-left
    [-axleX, wheelY,  wheelZ],  // rear-right
    [-axleX, wheelY, -wheelZ],  // rear-left
  ];

  for (const [wx, wy, wz] of wheelPositions) {
    const wheel = new Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2; // rotate cylinder to lie on Z axis
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    car.add(wheel);
  }

  return car;
}
