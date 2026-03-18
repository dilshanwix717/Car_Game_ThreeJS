import {
  Scene,
  AmbientLight,
  DirectionalLight,
  Color,
} from 'three';
import {
  AMBIENT_INTENSITY,
  DIR_LIGHT_INTENSITY,
  DIR_LIGHT_POSITION,
  SHADOW_MAP_SIZE,
  BACKGROUND_COLOR,
} from '../constants.ts';

export function createScene(): Scene {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND_COLOR);

  // Ambient fill
  const ambient = new AmbientLight(0xffffff, AMBIENT_INTENSITY);
  scene.add(ambient);

  // Main directional light with shadows
  const dirLight = new DirectionalLight(0xffffff, DIR_LIGHT_INTENSITY);
  dirLight.position.set(
    DIR_LIGHT_POSITION.x,
    DIR_LIGHT_POSITION.y,
    DIR_LIGHT_POSITION.z,
  );
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);

  // Shadow camera covers entire level
  const sc = dirLight.shadow.camera;
  sc.left = -60;
  sc.right = 60;
  sc.top = 60;
  sc.bottom = -60;
  sc.near = 0.5;
  sc.far = 100;

  scene.add(dirLight);

  return scene;
}
