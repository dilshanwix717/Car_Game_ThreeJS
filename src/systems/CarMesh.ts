import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from "three";
import { loadModel } from "./ModelLoader.ts";
import { CAR_LENGTH, CAR_WIDTH, CAR_HEIGHT } from "../constants.ts";

/**
 * Builds car mesh from external model (low_poly_car_4).
 * The model's "forward" direction is corrected by rotating -90° around Y axis.
 * Wrapper group ensures correct pivot and forward direction (+X local).
 */
export async function createCarMesh(): Promise<Group> {
  const car = new Group();

  try {
    // Load the external model
    const model = await loadModel("/models/super_car.glb");

    // Correct the model's rotation: rotate -90° around Y axis
    // This assumes your model originally faces +Z instead of +X
    model.rotation.y = Math.PI / 2;

    // Scale up the model
    model.scale.set(6, 6, 6);

    car.add(model);
  } catch (error) {
    console.warn("Failed to load car model, using fallback box mesh:", error);
    // ─── Fallback: Simple box mesh ────────────────────
    const bodyGeo = new BoxGeometry(CAR_LENGTH, CAR_HEIGHT, CAR_WIDTH);
    const bodyMat = new MeshStandardMaterial({ color: 0xcc2222 });
    const body = new Mesh(bodyGeo, bodyMat);
    body.position.y = CAR_HEIGHT / 2;
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
    const wheelGeo = new CylinderGeometry(
      wheelRadius,
      wheelRadius,
      wheelWidth,
      16,
    );
    const wheelMat = new MeshStandardMaterial({ color: 0x111111 });

    const axleX = CAR_LENGTH * 0.35;
    const wheelZ = CAR_WIDTH / 2 + wheelWidth / 2 - 0.05;
    const wheelY = wheelRadius;

    const wheelPositions: [number, number, number][] = [
      [axleX, wheelY, wheelZ],
      [axleX, wheelY, -wheelZ],
      [-axleX, wheelY, wheelZ],
      [-axleX, wheelY, -wheelZ],
    ];

    for (const [wx, wy, wz] of wheelPositions) {
      const wheel = new Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      car.add(wheel);
    }
  }

  return car;
}
