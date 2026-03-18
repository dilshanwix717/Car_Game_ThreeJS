import {
  WebGLRenderer,
  PerspectiveCamera,
  PCFSoftShadowMap,
} from 'three';
import { BACKGROUND_COLOR } from '../constants.ts';

export interface RendererContext {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  dispose: () => void;
}

export function createRenderer(): RendererContext {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(BACKGROUND_COLOR);
  document.body.appendChild(renderer.domElement);

  const camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );

  const onResize = (): void => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  const dispose = (): void => {
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };

  return { renderer, camera, dispose };
}
