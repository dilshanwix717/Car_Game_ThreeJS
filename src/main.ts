import { createRenderer } from "./systems/RendererSetup.ts";
import { createScene } from "./systems/SceneSetup.ts";
import { createCarMesh } from "./systems/CarMesh.ts";
import { CarController } from "./systems/CarController.ts";
import { CameraController } from "./systems/CameraController.ts";
import { InputHandler } from "./systems/InputHandler.ts";
import { buildLevel, LEVEL_1 } from "./systems/LevelBuilder.ts";
import { CollisionSystem } from "./systems/CollisionSystem.ts";
import { ParkingDetector } from "./systems/ParkingDetector.ts";
import { UI } from "./ui/UI.ts";
import { Game } from "./Game.ts";

/**
 * Startup sequence — loads model asynchronously then starts game.
 */
async function main(): Promise<void> {
  // 1. Create renderer + camera
  const { renderer, camera } = createRenderer();

  // 2. Create scene + lights
  const scene = createScene();

  // 3. Build level with simple Three.js box walls
  const { walls, parkingZone } = buildLevel(scene, LEVEL_1);

  // 4. Create car (loads model async)
  const carGroup = await createCarMesh();
  carGroup.position.set(LEVEL_1.start.position.x, 0, LEVEL_1.start.position.z);
  carGroup.rotation.y = LEVEL_1.start.rotation;
  scene.add(carGroup);

  // 5. Create car controller
  const carController = new CarController(carGroup);
  carController.heading = LEVEL_1.start.rotation;

  // 6. Create camera controller
  const cameraController = new CameraController(camera, carGroup);

  // 7. Create input handler
  const inputHandler = new InputHandler();

  // 8. Create collision system
  const collisionSystem = new CollisionSystem(walls);

  // 9. Create UI
  const ui = new UI();

  // 10. Create parking detector
  const parkingDetector = new ParkingDetector(parkingZone, () => {
    ui.showComplete(() => game.reset());
  });

  // 11. Assemble and start game
  const game = new Game({
    renderer,
    scene,
    camera,
    carGroup,
    carController,
    cameraController,
    collisionSystem,
    parkingDetector,
    inputHandler,
    ui,
    startDef: LEVEL_1.start,
  });

  game.start();
}

// ── Boot ────────────────────────────────────────────────
main();
