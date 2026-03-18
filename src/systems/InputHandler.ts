import type { InputState } from '../types.ts';

/**
 * Tracks keyboard state and exposes a per-frame InputState snapshot.
 * Supports WASD + Arrow keys.
 * Designed for easy extension (mobile, gamepad).
 */
export class InputHandler {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  /** Read the current input state. Call once per frame. */
  read(): InputState {
    let steering: -1 | 0 | 1 = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) steering = 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) steering = -1;

    const accelerate =
      this.keys.has('ArrowUp') || this.keys.has('KeyW');
    const brake =
      this.keys.has('ArrowDown') || this.keys.has('KeyS') || this.keys.has('Space');

    return { steering, accelerate, brake };
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  // ── Private ──────────────────────────────────────────
  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };
}
