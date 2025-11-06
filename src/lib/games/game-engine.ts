/**
 * Game Engine Base Class
 * Handles canvas rendering, input, and game loop at 60fps
 */

import type { GameEngine, InputState } from '@/types/cognitive-games';

export abstract class BaseGameEngine {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected width: number;
  protected height: number;
  protected running: boolean = false;
  protected paused: boolean = false;
  protected fps: number = 60;
  protected lastFrameTime: number = 0;
  protected deltaTime: number = 0;
  protected animationFrameId: number | null = null;

  protected inputState: InputState = {
    keys: new Set(),
    mouse: { x: 0, y: 0, down: false, clicked: false },
    touch: { x: 0, y: 0, active: false, started: false, ended: false },
    gestures: {},
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    this.setupInput();
    this.setupCanvas();
  }

  // ===== ABSTRACT METHODS (must be implemented by game) =====

  protected abstract update(deltaTime: number): void;
  protected abstract render(): void;
  protected abstract onResize(): void;

  // ===== GAME LOOP =====

  public start(): void {
    if (this.running) return;

    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  public stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
    this.lastFrameTime = performance.now();
  }

  protected gameLoop = (currentTime: number): void => {
    if (!this.running) return;

    // Calculate delta time
    this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // Cap delta time to prevent spiral of death
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.1;
    }

    // Update and render
    if (!this.paused) {
      this.update(this.deltaTime);
      this.resetInputFlags();
    }
    this.render();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  // ===== CANVAS SETUP =====

  protected setupCanvas(): void {
    // Enable image smoothing for better graphics
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Handle resize
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  protected handleResize = (): void => {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx.scale(dpr, dpr);
    this.onResize();
  };

  // ===== INPUT HANDLING =====

  protected setupInput(): void {
    // Keyboard
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Mouse
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);

    // Touch
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  protected handleKeyDown = (e: KeyboardEvent): void => {
    this.inputState.keys.add(e.key.toLowerCase());

    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  };

  protected handleKeyUp = (e: KeyboardEvent): void => {
    this.inputState.keys.delete(e.key.toLowerCase());
  };

  protected handleMouseDown = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.inputState.mouse.x = e.clientX - rect.left;
    this.inputState.mouse.y = e.clientY - rect.top;
    this.inputState.mouse.down = true;
    this.inputState.mouse.clicked = true;
  };

  protected handleMouseUp = (): void => {
    this.inputState.mouse.down = false;
  };

  protected handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.inputState.mouse.x = e.clientX - rect.left;
    this.inputState.mouse.y = e.clientY - rect.top;
  };

  protected handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.inputState.touch.x = touch.clientX - rect.left;
    this.inputState.touch.y = touch.clientY - rect.top;
    this.inputState.touch.active = true;
    this.inputState.touch.started = true;
  };

  protected handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    this.inputState.touch.active = false;
    this.inputState.touch.ended = true;
  };

  protected handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const newX = touch.clientX - rect.left;
    const newY = touch.clientY - rect.top;

    // Detect swipe gestures
    const deltaX = newX - this.inputState.touch.x;
    const deltaY = newY - this.inputState.touch.y;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.inputState.gestures.swipeDirection = deltaX > 0 ? 'right' : 'left';
      } else {
        this.inputState.gestures.swipeDirection = deltaY > 0 ? 'down' : 'up';
      }
    }

    this.inputState.touch.x = newX;
    this.inputState.touch.y = newY;
  };

  protected resetInputFlags(): void {
    this.inputState.mouse.clicked = false;
    this.inputState.touch.started = false;
    this.inputState.touch.ended = false;
    this.inputState.gestures.swipeDirection = undefined;
  };

  // ===== INPUT HELPERS =====

  protected isKeyPressed(key: string): boolean {
    return this.inputState.keys.has(key.toLowerCase());
  }

  protected isMouseClicked(): boolean {
    return this.inputState.mouse.clicked;
  }

  protected isTouchStarted(): boolean {
    return this.inputState.touch.started;
  }

  protected getSwipeDirection(): 'up' | 'down' | 'left' | 'right' | null {
    return this.inputState.gestures.swipeDirection || null;
  }

  // ===== DRAWING HELPERS =====

  protected clear(color: string = '#000000'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  protected drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    borderRadius: number = 0
  ): void {
    this.ctx.fillStyle = color;
    if (borderRadius > 0) {
      this.drawRoundedRect(x, y, width, height, borderRadius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(x, y, width, height);
    }
  }

  protected drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  protected drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  protected drawText(
    text: string,
    x: number,
    y: number,
    font: string = '16px Arial',
    color: string = '#ffffff',
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
  }

  protected drawImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (width && height) {
      this.ctx.drawImage(image, x, y, width, height);
    } else {
      this.ctx.drawImage(image, x, y);
    }
  }

  // ===== EFFECTS =====

  protected screenShake(intensity: number, duration: number): void {
    // Simple screen shake implementation
    const startTime = performance.now();
    const shake = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed > duration) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        return;
      }

      const progress = elapsed / duration;
      const currentIntensity = intensity * (1 - progress);
      const offsetX = (Math.random() - 0.5) * currentIntensity;
      const offsetY = (Math.random() - 0.5) * currentIntensity;

      this.ctx.setTransform(1, 0, 0, 1, offsetX, offsetY);
      requestAnimationFrame(shake);
    };
    shake();
  }

  protected drawParticles(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number = 2
  ): void {
    // Simple particle effect
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const particleX = x + Math.cos(angle) * speed * 10;
      const particleY = y + Math.sin(angle) * speed * 10;
      const size = Math.random() * 4 + 2;

      this.ctx.globalAlpha = 0.7;
      this.drawCircle(particleX, particleY, size, color);
      this.ctx.globalAlpha = 1;
    }
  }

  // ===== COLLISION DETECTION =====

  protected checkRectCollision(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  protected checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }

  protected checkPointInRect(
    px: number,
    py: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  // ===== CLEANUP =====

  public destroy(): void {
    this.stop();

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);

    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
  }
}
