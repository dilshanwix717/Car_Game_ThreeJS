/**
 * Pure-DOM UI overlay.
 * - Speed display (bottom-left, km/h)
 * - Controls hint (top-center, fades after 4s)
 * - Level Complete screen with "Play Again" button
 */
export class UI {
  private readonly container: HTMLDivElement;
  private readonly speedEl: HTMLDivElement;
  private readonly hintEl: HTMLDivElement;
  private readonly completeOverlay: HTMLDivElement;
  private hintTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // ─── Container (covers viewport, pointer-events passthrough) ──
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '10',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.container);

    // ─── Speed Display ──────────────────────────────────
    this.speedEl = document.createElement('div');
    Object.assign(this.speedEl.style, {
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      color: '#ffffff',
      fontSize: '28px',
      fontWeight: '700',
      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
      letterSpacing: '1px',
    } satisfies Partial<CSSStyleDeclaration>);
    this.speedEl.textContent = '0 km/h';
    this.container.appendChild(this.speedEl);

    // ─── Controls Hint ──────────────────────────────────
    this.hintEl = document.createElement('div');
    Object.assign(this.hintEl.style, {
      position: 'absolute',
      top: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#ffffffcc',
      fontSize: '16px',
      fontWeight: '500',
      textAlign: 'center',
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(6px)',
      transition: 'opacity 0.8s ease',
      opacity: '1',
      lineHeight: '1.6',
    } satisfies Partial<CSSStyleDeclaration>);
    this.hintEl.innerHTML = `
      <strong>W / ↑</strong> Accelerate &nbsp;&nbsp;
      <strong>S / ↓</strong> Brake / Reverse<br>
      <strong>A / ←</strong> Steer Left &nbsp;&nbsp;
      <strong>D / →</strong> Steer Right
    `;
    this.container.appendChild(this.hintEl);

    // Fade hint after 4 seconds
    this.hintTimer = setTimeout(() => {
      this.hintEl.style.opacity = '0';
    }, 4000);

    // ─── Level Complete Overlay ─────────────────────────
    this.completeOverlay = document.createElement('div');
    Object.assign(this.completeOverlay.style, {
      position: 'absolute',
      inset: '0',
      display: 'none',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement('h1');
    Object.assign(title.style, {
      color: '#00ff88',
      fontSize: '56px',
      fontWeight: '800',
      margin: '0 0 12px 0',
      textShadow: '0 0 30px rgba(0,255,136,0.4)',
      letterSpacing: '2px',
    } satisfies Partial<CSSStyleDeclaration>);
    title.textContent = '🏁 Level Complete!';
    this.completeOverlay.appendChild(title);

    const subtitle = document.createElement('p');
    Object.assign(subtitle.style, {
      color: '#ffffffbb',
      fontSize: '20px',
      margin: '0 0 32px 0',
    } satisfies Partial<CSSStyleDeclaration>);
    subtitle.textContent = 'You parked perfectly!';
    this.completeOverlay.appendChild(subtitle);

    const btn = document.createElement('button');
    btn.id = 'play-again-btn';
    Object.assign(btn.style, {
      padding: '14px 48px',
      fontSize: '20px',
      fontWeight: '700',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      background: 'linear-gradient(135deg, #00cc66, #00aa55)',
      color: '#ffffff',
      boxShadow: '0 4px 20px rgba(0,204,102,0.4)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);
    btn.textContent = 'Play Again';
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 6px 28px rgba(0,204,102,0.55)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 20px rgba(0,204,102,0.4)';
    });
    this.completeOverlay.appendChild(btn);

    this.container.appendChild(this.completeOverlay);
  }

  updateSpeed(kmh: number): void {
    this.speedEl.textContent = `${Math.round(kmh)} km/h`;
  }

  showComplete(onRestart: () => void): void {
    this.completeOverlay.style.display = 'flex';
    const btn = this.completeOverlay.querySelector('#play-again-btn') as HTMLButtonElement;
    const handler = (): void => {
      btn.removeEventListener('click', handler);
      onRestart();
    };
    btn.addEventListener('click', handler);
  }

  hideComplete(): void {
    this.completeOverlay.style.display = 'none';
  }

  showHint(): void {
    this.hintEl.style.opacity = '1';
    if (this.hintTimer) clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => {
      this.hintEl.style.opacity = '0';
    }, 4000);
  }

  dispose(): void {
    if (this.hintTimer) clearTimeout(this.hintTimer);
    this.container.remove();
  }
}
