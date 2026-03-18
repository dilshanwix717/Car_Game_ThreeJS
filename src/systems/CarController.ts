import { Group } from 'three';
import type { InputState } from '../types.ts';
import {
  MAX_FORWARD_SPEED,
  MAX_REVERSE_SPEED,
  ACCELERATION,
  BRAKE_DECEL,
  FRICTION,
  MAX_STEER_ANGLE,
  WHEELBASE,
} from '../constants.ts';

/**
 * Bicycle-model car physics controller.
 * Operates on the car Group's world transform directly.
 *
 * Forward direction = +X local.
 * heading (rotation.y) = 0 → facing +X.
 */
export class CarController {
  readonly group: Group;

  /** Signed speed — positive = forward, negative = reverse */
  speed = 0;

  /** Current heading in radians (synced with group.rotation.y) */
  heading = 0;

  constructor(group: Group) {
    this.group = group;
  }

  /** Speed in km/h (absolute value) for UI display. */
  get speedKmh(): number {
    return Math.abs(this.speed) * 3.6;
  }

  /**
   * Step the physics simulation forward by `dt` seconds.
   */
  update(dt: number, input: InputState): void {
    // ─── Acceleration / braking / friction ───────────
    if (input.accelerate) {
      this.speed += ACCELERATION * dt;
    } else if (input.brake) {
      // Braking: decelerate toward zero, then allow reverse
      if (this.speed > 0) {
        this.speed -= BRAKE_DECEL * dt;
        if (this.speed < 0) this.speed = 0;
      } else {
        // Reverse
        this.speed -= ACCELERATION * dt;
      }
    } else {
      // Friction — decelerate toward zero
      if (this.speed > 0) {
        this.speed -= FRICTION * dt;
        if (this.speed < 0) this.speed = 0;
      } else if (this.speed < 0) {
        this.speed += FRICTION * dt;
        if (this.speed > 0) this.speed = 0;
      }
    }

    // ─── Speed caps ─────────────────────────────────
    if (this.speed > MAX_FORWARD_SPEED) this.speed = MAX_FORWARD_SPEED;
    if (this.speed < -MAX_REVERSE_SPEED) this.speed = -MAX_REVERSE_SPEED;

    // ─── Steering (bicycle model) ───────────────────
    if (input.steering !== 0 && Math.abs(this.speed) > 0.05) {
      // Steer angle decreases at high speed for stability
      const speedRatio = Math.abs(this.speed) / MAX_FORWARD_SPEED;
      const steerAngle =
        MAX_STEER_ANGLE * input.steering * (1 - speedRatio * 0.5);

      // Angular velocity from bicycle model: ω = v * tan(δ) / L
      const angularVelocity =
        (this.speed * Math.tan(steerAngle)) / WHEELBASE;

      this.heading += angularVelocity * dt;
    }

    // ─── Position update ────────────────────────────
    const dx = Math.cos(this.heading) * this.speed * dt;
    const dz = -Math.sin(this.heading) * this.speed * dt;

    this.group.position.x += dx;
    this.group.position.z += dz;
    this.group.rotation.y = this.heading;
  }

  /**
   * Reset car to a starting position and orientation.
   */
  reset(x: number, z: number, heading: number): void {
    this.speed = 0;
    this.heading = heading;
    this.group.position.set(x, 0, z);
    this.group.rotation.y = heading;
  }
}
