import { createRenderer } from "./systems/RendererSetup.ts";
import { createScene } from "./systems/SceneSetup.ts";
import { createCarMesh } from "./systems/CarMesh.ts";
import { CarController } from "./systems/CarController.ts";
import { CameraController } from "./systems/CameraController.ts";
import { InputHandler } from "./systems/InputHandler.ts";
import { buildLevel } from "./systems/LevelBuilder.ts";
import { loadLevel } from "./systems/LevelLoader.ts";
import { CollisionSystem } from "./systems/CollisionSystem.ts";
import { ParkingDetector } from "./systems/ParkingDetector.ts";
import { UI } from "./ui/UI.ts";
import { Game } from "./Game.ts";

/**
 * Startup sequence — loads level + model asynchronously then starts game.
 */
async function main(): Promise<void> {
  // 1. Create renderer + camera
  const { renderer, camera } = createRenderer();

  // 2. Create scene + lights
  const scene = createScene();

  // 3. Load level from JSON
  const levelData = await loadLevel("level1");

  // 4. Build level with simple Three.js box walls
  const { walls, parkingZone } = buildLevel(scene, levelData);

  // 5. Create car (loads model async)
  const carGroup = await createCarMesh();
  carGroup.position.set(
    levelData.start.position.x,
    0,
    levelData.start.position.z,
  );
  carGroup.rotation.y = levelData.start.rotation;
  scene.add(carGroup);

  // 6. Create car controller
  const carController = new CarController(carGroup);
  carController.heading = levelData.start.rotation;

  // 7. Create camera controller
  const cameraController = new CameraController(camera, carGroup);

  // 8. Create input handler
  const inputHandler = new InputHandler();

  // 9. Create collision system
  const collisionSystem = new CollisionSystem(walls);

  // 10. Create UI
  const ui = new UI();

  // 11. Create parking detector
  const parkingDetector = new ParkingDetector(parkingZone, () => {
    ui.showComplete(() => game.reset());
  });

  // 12. Assemble and start game
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
    startDef: levelData.start,
  });

  game.start();
}

// ── Boot ────────────────────────────────────────────────
main();
