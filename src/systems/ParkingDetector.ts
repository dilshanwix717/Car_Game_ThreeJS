import type { ParkingZoneDef } from '../types.ts';
import { CarController } from './CarController.ts';
import { PARK_SPEED_THRESHOLD, PARK_ANGLE_THRESHOLD } from '../constants.ts';

/**
 * Checks whether the car is correctly parked each frame.
 * Conditions:
 *   1. Car center inside parking zone bounds
 *   2. Speed near zero
 *   3. Heading aligned with parking orientation
 */
export class ParkingDetector {
  private readonly zone: ParkingZoneDef;
  private readonly onParked: () => void;

  /** Prevent firing multiple times */
  private fired = false;

  constructor(zone: ParkingZoneDef, onParked: () => void) {
    this.zone = zone;
    this.onParked = onParked;
  }

  check(car: CarController): void {
    if (this.fired) return;

    // 1. Position check — is the car center inside the zone AABB?
    const pz = this.zone;
    const halfL = pz.length / 2;
    const halfW = pz.width / 2;
    const cos = Math.abs(Math.cos(pz.rotation));
    const sin = Math.abs(Math.sin(pz.rotation));
    const extentX = halfL * cos + halfW * sin;
    const extentZ = halfL * sin + halfW * cos;

    const cx = car.group.position.x;
    const cz = car.group.position.z;

    if (
      cx < pz.position.x - extentX ||
      cx > pz.position.x + extentX ||
      cz < pz.position.z - extentZ ||
      cz > pz.position.z + extentZ
    ) {
      return; // outside zone
    }

    // 2. Speed check
    if (Math.abs(car.speed) > PARK_SPEED_THRESHOLD) return;

    // 3. Orientation check
    const angleDiff = this.angleDifference(car.heading, pz.rotation);
    const thresholdRad = (PARK_ANGLE_THRESHOLD * Math.PI) / 180;

    // Accept both 0° and 180° (car can face either direction)
    if (angleDiff > thresholdRad && Math.abs(angleDiff - Math.PI) > thresholdRad) {
      return;
    }

    this.fired = true;
    this.onParked();
  }

  reset(): void {
    this.fired = false;
  }

  /**
   * Returns the absolute smallest angle difference in [0, π].
   */
  private angleDifference(a: number, b: number): number {
    let diff = ((a - b) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff;
  }
}
