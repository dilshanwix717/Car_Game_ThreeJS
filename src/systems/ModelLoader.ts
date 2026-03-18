import { Group } from "three";
// @ts-ignore — Three.js examples may not have bundled type declarations
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// @ts-ignore — Three.js examples may not have bundled type declarations
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Load a GLB/GLTF model and return its scene graph.
 */
export function loadModel(url: string): Promise<Group> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    // Set up DRACO decoder for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf: { scene: Group }) => {
        resolve(gltf.scene);
      },
      undefined,
      (error: unknown) => {
        reject(error);
      },
    );
  });
}
