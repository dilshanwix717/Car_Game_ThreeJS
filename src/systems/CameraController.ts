import { PerspectiveCamera, Group, Vector3 } from 'three';
import { CAMERA_OFFSET_Y, CAMERA_OFFSET_Z, CAMERA_LERP_FACTOR } from '../constants.ts';

/**
 * Smooth third-person follow camera.
 * Trails behind the car with configurable offset and lerp speed.
 */
export class CameraController {
  private readonly camera: PerspectiveCamera;
  private readonly target: Group;
  private readonly desiredPosition = new Vector3();
  private readonly lookTarget = new Vector3();

  constructor(camera: PerspectiveCamera, target: Group) {
    this.camera = camera;
    this.target = target;

    // Initialise camera immediately (no lerp on first frame)
    this.computeDesired();
    this.camera.position.copy(this.desiredPosition);
    this.camera.lookAt(this.target.position);
  }

  update(dt: number): void {
    this.computeDesired();

    // Smooth lerp toward desired position
    const t = 1 - Math.exp(-CAMERA_LERP_FACTOR * dt);
    this.camera.position.lerp(this.desiredPosition, t);

    // Look slightly ahead of the car
    this.lookTarget.copy(this.target.position);
    this.lookTarget.y += 1.5;
    this.camera.lookAt(this.lookTarget);
  }

  private computeDesired(): void {
    const heading = this.target.rotation.y;

    // Offset behind the car in world space
    this.desiredPosition.set(
      this.target.position.x - Math.cos(heading) * (-CAMERA_OFFSET_Z),
      this.target.position.y + CAMERA_OFFSET_Y,
      this.target.position.z + Math.sin(heading) * (-CAMERA_OFFSET_Z),
    );
  }
}
