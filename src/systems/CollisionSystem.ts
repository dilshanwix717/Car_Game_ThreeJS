import type { AABB } from '../types.ts';
import { CarController } from './CarController.ts';
import { CAR_LENGTH, CAR_WIDTH, COLLISION_SPEED_FACTOR } from '../constants.ts';

/**
 * AABB collision detection and sliding response.
 * Walls are registered once at level build time.
 */
export class CollisionSystem {
  private readonly walls: AABB[];

  constructor(walls: AABB[]) {
    this.walls = walls;
  }

  /**
   * Check the car against all walls and apply sliding response.
   */
  resolve(car: CarController): void {
    const carAABB = this.getCarAABB(car);

    for (const wall of this.walls) {
      // Check overlap
      if (
        carAABB.maxX <= wall.minX ||
        carAABB.minX >= wall.maxX ||
        carAABB.maxZ <= wall.minZ ||
        carAABB.minZ >= wall.maxZ
      ) {
        continue; // no collision
      }

      // Compute penetration on each axis
      const overlapLeft = carAABB.maxX - wall.minX;
      const overlapRight = wall.maxX - carAABB.minX;
      const overlapTop = carAABB.maxZ - wall.minZ;
      const overlapBottom = wall.maxZ - carAABB.minZ;

      const minOverlapX = Math.min(overlapLeft, overlapRight);
      const minOverlapZ = Math.min(overlapTop, overlapBottom);

      // Push out on the shallowest axis
      if (minOverlapX < minOverlapZ) {
        // Push on X axis
        if (overlapLeft < overlapRight) {
          car.group.position.x -= overlapLeft;
        } else {
          car.group.position.x += overlapRight;
        }
        // Remove velocity component perpendicular to wall (X-facing wall)
        const heading = car.heading;
        const vx = Math.cos(heading) * car.speed;
        const vz = -Math.sin(heading) * car.speed;
        // Keep only Z-component (parallel to X-facing wall)
        const parallelSpeed = Math.sqrt(vz * vz); // simplified
        car.speed = parallelSpeed * Math.sign(car.speed) * COLLISION_SPEED_FACTOR;
        // We don't change heading, just reduce speed
        void vx; // consumed above
      } else {
        // Push on Z axis
        if (overlapTop < overlapBottom) {
          car.group.position.z -= overlapTop;
        } else {
          car.group.position.z += overlapBottom;
        }
        // Remove velocity component perpendicular to wall (Z-facing wall)
        const heading = car.heading;
        const vx = Math.cos(heading) * car.speed;
        // Keep only X-component (parallel to Z-facing wall)
        const parallelSpeed = Math.sqrt(vx * vx);
        car.speed = parallelSpeed * Math.sign(car.speed) * COLLISION_SPEED_FACTOR;
      }
    }
  }

  /**
   * Compute the car's axis-aligned bounding box from its current transform.
   * Accounts for rotation by expanding the box.
   */
  private getCarAABB(car: CarController): AABB {
    const halfL = CAR_LENGTH / 2;
    const halfW = CAR_WIDTH / 2;
    const cos = Math.abs(Math.cos(car.heading));
    const sin = Math.abs(Math.sin(car.heading));
    const extentX = halfL * cos + halfW * sin;
    const extentZ = halfL * sin + halfW * cos;

    return {
      minX: car.group.position.x - extentX,
      maxX: car.group.position.x + extentX,
      minZ: car.group.position.z - extentZ,
      maxZ: car.group.position.z + extentZ,
    };
  }
}
