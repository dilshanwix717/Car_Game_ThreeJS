import { WebGLRenderer, Scene, PerspectiveCamera, Group } from 'three';
import { CarController } from './systems/CarController.ts';
import { CameraController } from './systems/CameraController.ts';
import { CollisionSystem } from './systems/CollisionSystem.ts';
import { ParkingDetector } from './systems/ParkingDetector.ts';
import { InputHandler } from './systems/InputHandler.ts';
import { UI } from './ui/UI.ts';
import { MAX_DELTA } from './constants.ts';
import type { StartDef } from './types.ts';

export interface GameSystems {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  carGroup: Group;
  carController: CarController;
  cameraController: CameraController;
  collisionSystem: CollisionSystem;
  parkingDetector: ParkingDetector;
  inputHandler: InputHandler;
  ui: UI;
  startDef: StartDef;
}

/**
 * Game loop coordinator.
 * Calls each system's update in the correct order every frame.
 * Contains NO physics logic — only orchestration.
 */
export class Game {
  private readonly systems: GameSystems;
  private lastTime: number | null = null;
  private rafId = 0;
  private running = false;

  constructor(systems: GameSystems) {
    this.systems = systems;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = null;
    this.rafId = requestAnimationFrame(this.loop);
  }

  reset(): void {
    const { carController, parkingDetector, ui, startDef } = this.systems;

    // Reset car state
    carController.reset(startDef.position.x, startDef.position.z, startDef.rotation);

    // Reset systems
    parkingDetector.reset();
    ui.hideComplete();
    ui.showHint();
  }

  // ─── Private ──────────────────────────────────────────

  private loop = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);

    // Initialize lastTime on first frame
    if (this.lastTime === null) {
      this.lastTime = now;
      return;
    }

    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Cap delta to avoid physics explosion
    if (delta > MAX_DELTA) delta = MAX_DELTA;

    const {
      renderer,
      scene,
      camera,
      carController,
      cameraController,
      collisionSystem,
      parkingDetector,
      inputHandler,
      ui,
    } = this.systems;

    // 1. Read input
    const input = inputHandler.read();

    // 2. Update car physics
    carController.update(delta, input);

    // 3. Resolve collisions
    collisionSystem.resolve(carController);

    // 4. Check parking
    parkingDetector.check(carController);

    // 5. Update camera
    cameraController.update(delta);

    // 6. Update UI
    ui.updateSpeed(carController.speedKmh);

    // 7. Render
    renderer.render(scene, camera);
  };

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }
}
