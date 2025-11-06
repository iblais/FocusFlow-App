/**
 * Working Memory Matrix Game
 * Grid of symbols that flash briefly - player must recall positions/sequences
 * Adaptive difficulty (2x2 to 6x6), power-ups, satisfying feedback
 */

import { BaseGameEngine } from './game-engine';
import type {
  MatrixGameState,
  MatrixConfig,
  MatrixCell,
  PowerUp,
} from '@/types/cognitive-games';

const DEFAULT_CONFIG: MatrixConfig = {
  startGridSize: 2,
  maxGridSize: 6,
  startFlashDuration: 2000,
  minFlashDuration: 500,
  sequenceLength: 3,
  symbols: ['●', '■', '▲', '◆', '★', '♦', '♥', '♣', '♠'],
  lives: 3,
  pointsPerCorrect: 10,
  streakMultiplier: 1.5,
};

export class WorkingMemoryMatrix extends BaseGameEngine {
  private state: MatrixGameState;
  private config: MatrixConfig;
  private cellSize: number = 0;
  private gridOffsetX: number = 0;
  private gridOffsetY: number = 0;
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
  }> = [];

  constructor(canvas: HTMLCanvasElement, config?: Partial<MatrixConfig>) {
    super(canvas);
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.initializeState();
    this.startNewRound();
  }

  private initializeState(): MatrixGameState {
    return {
      gridSize: this.config.startGridSize,
      cells: [],
      sequence: [],
      currentSequenceIndex: 0,
      phase: 'memorize',
      flashDuration: this.config.startFlashDuration,
      timeRemaining: this.config.startFlashDuration,
      score: 0,
      level: 1,
      lives: this.config.lives,
      streak: 0,
      powerUps: this.initializePowerUps(),
    };
  }

  private initializePowerUps(): PowerUp[] {
    return [
      {
        id: 'slow-motion',
        name: 'Slow Motion',
        description: 'Doubles memorization time',
        icon: '⏱️',
        cost: 50,
        cooldown: 30,
        duration: 5,
        isActive: false,
      },
      {
        id: 'hint',
        name: 'Hint',
        description: 'Reveals one correct cell',
        icon: '💡',
        cost: 30,
        cooldown: 20,
        isActive: false,
      },
      {
        id: 'skip',
        name: 'Skip',
        description: 'Skip current round without penalty',
        icon: '⏭️',
        cost: 40,
        cooldown: 45,
        isActive: false,
      },
    ];
  }

  private startNewRound(): void {
    this.state.cells = this.generateGrid();
    this.state.sequence = this.selectRandomCells();
    this.state.currentSequenceIndex = 0;
    this.state.phase = 'memorize';
    this.state.timeRemaining = this.state.flashDuration;

    // Reset cell states
    this.state.cells.forEach((cell) => {
      cell.revealed = false;
      cell.correct = undefined;
    });
  }

  private generateGrid(): MatrixCell[] {
    const cells: MatrixCell[] = [];
    const { gridSize, symbols } = this.state;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        cells.push({
          x,
          y,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          revealed: false,
        });
      }
    }

    return cells;
  }

  private selectRandomCells(): MatrixCell[] {
    const sequence: MatrixCell[] = [];
    const availableCells = [...this.state.cells];
    const sequenceLength = Math.min(
      this.config.sequenceLength + Math.floor(this.state.level / 3),
      this.state.gridSize * this.state.gridSize
    );

    for (let i = 0; i < sequenceLength; i++) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      sequence.push(availableCells[randomIndex]);
      availableCells.splice(randomIndex, 1);
    }

    return sequence;
  }

  protected update(deltaTime: number): void {
    this.updateParticles(deltaTime);

    switch (this.state.phase) {
      case 'memorize':
        this.updateMemorizePhase(deltaTime);
        break;
      case 'recall':
        this.updateRecallPhase();
        break;
      case 'feedback':
        this.updateFeedbackPhase(deltaTime);
        break;
    }
  }

  private updateMemorizePhase(deltaTime: number): void {
    this.state.timeRemaining -= deltaTime * 1000;

    if (this.state.timeRemaining <= 0) {
      // Transition to recall phase
      this.state.phase = 'recall';
      this.state.cells.forEach((cell) => (cell.revealed = false));
    } else {
      // Show sequence cells
      this.state.sequence.forEach((cell) => {
        const gridCell = this.state.cells.find((c) => c.x === cell.x && c.y === cell.y);
        if (gridCell) {
          gridCell.revealed = true;
        }
      });
    }
  }

  private updateRecallPhase(): void {
    // Handle cell clicks
    if (this.isMouseClicked() || this.isTouchStarted()) {
      const clickedCell = this.getCellAtPosition(
        this.inputState.mouse.x || this.inputState.touch.x,
        this.inputState.mouse.y || this.inputState.touch.y
      );

      if (clickedCell && !clickedCell.revealed) {
        this.handleCellClick(clickedCell);
      }
    }

    // Check if recall complete
    const revealedCount = this.state.cells.filter((c) => c.revealed).length;
    if (revealedCount === this.state.sequence.length) {
      this.checkAnswers();
    }
  }

  private updateFeedbackPhase(deltaTime: number): void {
    this.state.timeRemaining -= deltaTime * 1000;

    if (this.state.timeRemaining <= 0) {
      const correctCount = this.state.cells.filter((c) => c.correct === true).length;

      if (correctCount === this.state.sequence.length) {
        // Perfect! Increase difficulty
        this.state.streak++;
        this.levelUp();
      } else {
        // Wrong, lose a life
        this.state.lives--;
        this.state.streak = 0;

        if (this.state.lives <= 0) {
          this.state.phase = 'complete';
          return;
        }
      }

      this.startNewRound();
    }
  }

  private handleCellClick(cell: MatrixCell): void {
    cell.revealed = true;

    // Check if this cell is in the sequence
    const isCorrect = this.state.sequence.some((c) => c.x === cell.x && c.y === cell.y);

    if (isCorrect) {
      // Correct! Show satisfying pop effect
      this.createPopEffect(cell, '#00ff88');
      this.playSound('pop');
    } else {
      // Wrong! Show gentle wobble
      this.createWobbleEffect(cell, '#ff4444');
      this.playSound('wobble');
    }
  }

  private checkAnswers(): void {
    this.state.phase = 'feedback';
    this.state.timeRemaining = 1500;

    let correctCount = 0;

    this.state.cells.forEach((cell) => {
      if (cell.revealed) {
        const isInSequence = this.state.sequence.some((c) => c.x === cell.x && c.y === cell.y);
        cell.correct = isInSequence;

        if (isInSequence) {
          correctCount++;
        }
      }
    });

    // Calculate points with streak multiplier
    const basePoints = correctCount * this.config.pointsPerCorrect;
    const streakBonus = Math.floor(
      basePoints * (this.state.streak * this.config.streakMultiplier)
    );
    this.state.score += basePoints + streakBonus;

    // Check if all correct
    if (correctCount === this.state.sequence.length) {
      this.screenShake(5, 200);
      this.createExplosionEffect();
    }
  }

  private levelUp(): void {
    this.state.level++;

    // Adaptive difficulty
    const levelsPerGridIncrease = 3;
    if (
      this.state.level % levelsPerGridIncrease === 0 &&
      this.state.gridSize < this.config.maxGridSize
    ) {
      this.state.gridSize++;
    }

    // Decrease flash duration
    if (this.state.flashDuration > this.config.minFlashDuration) {
      this.state.flashDuration -= 100;
    }
  }

  private getCellAtPosition(x: number, y: number): MatrixCell | null {
    const col = Math.floor((x - this.gridOffsetX) / this.cellSize);
    const row = Math.floor((y - this.gridOffsetY) / this.cellSize);

    if (col >= 0 && col < this.state.gridSize && row >= 0 && row < this.state.gridSize) {
      return this.state.cells.find((c) => c.x === col && c.y === row) || null;
    }

    return null;
  }

  // ===== RENDERING =====

  protected render(): void {
    this.clear('#1a1a2e');

    this.calculateGridLayout();
    this.renderGrid();
    this.renderUI();
    this.renderParticles();

    if (this.state.phase === 'complete') {
      this.renderGameOver();
    }
  }

  private calculateGridLayout(): void {
    const padding = 40;
    const availableWidth = this.width - padding * 2;
    const availableHeight = this.height - padding * 2 - 100; // Reserve space for UI

    this.cellSize = Math.min(availableWidth, availableHeight) / this.state.gridSize;

    const gridWidth = this.cellSize * this.state.gridSize;
    const gridHeight = this.cellSize * this.state.gridSize;

    this.gridOffsetX = (this.width - gridWidth) / 2;
    this.gridOffsetY = (this.height - gridHeight) / 2 + 50;
  }

  private renderGrid(): void {
    this.state.cells.forEach((cell) => {
      const x = this.gridOffsetX + cell.x * this.cellSize;
      const y = this.gridOffsetY + cell.y * this.cellSize;
      const padding = 5;

      // Cell background
      let bgColor = '#2d2d44';
      if (cell.revealed) {
        if (this.state.phase === 'feedback') {
          bgColor = cell.correct === true ? '#00ff88' : cell.correct === false ? '#ff4444' : '#4a4a6a';
        } else {
          bgColor = '#4a4a6a';
        }
      }

      this.drawRect(x + padding, y + padding, this.cellSize - padding * 2, this.cellSize - padding * 2, bgColor, 8);

      // Cell symbol (only show in memorize phase or if revealed)
      if ((this.state.phase === 'memorize' && cell.revealed) || (this.state.phase === 'feedback' && cell.revealed)) {
        this.drawText(
          cell.symbol,
          x + this.cellSize / 2,
          y + this.cellSize / 2,
          `${Math.floor(this.cellSize / 2)}px Arial`,
          '#ffffff',
          'center'
        );
      }

      // Cell border
      this.ctx.strokeStyle = '#555';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + padding, y + padding, this.cellSize - padding * 2, this.cellSize - padding * 2);
    });
  }

  private renderUI(): void {
    const padding = 20;

    // Score
    this.drawText(`Score: ${this.state.score}`, padding, 30, 'bold 24px Arial', '#ffffff');

    // Level
    this.drawText(`Level: ${this.state.level}`, this.width / 2, 30, 'bold 24px Arial', '#ffffff', 'center');

    // Lives
    const livesX = this.width - padding;
    for (let i = 0; i < this.state.lives; i++) {
      this.drawText('❤️', livesX - i * 30, 30, '24px Arial', '#ff4444', 'right');
    }

    // Streak
    if (this.state.streak > 0) {
      this.drawText(
        `🔥 ${this.state.streak} streak!`,
        this.width / 2,
        this.height - 40,
        'bold 20px Arial',
        '#ff9900',
        'center'
      );
    }

    // Phase indicator
    let phaseText = '';
    let phaseColor = '#ffffff';

    switch (this.state.phase) {
      case 'memorize':
        phaseText = 'MEMORIZE!';
        phaseColor = '#00ff88';
        break;
      case 'recall':
        phaseText = 'RECALL!';
        phaseColor = '#ffaa00';
        break;
      case 'feedback':
        const correct = this.state.cells.filter((c) => c.correct === true).length;
        const total = this.state.sequence.length;
        phaseText = `${correct}/${total} correct`;
        phaseColor = correct === total ? '#00ff88' : '#ff4444';
        break;
    }

    if (phaseText) {
      this.drawText(phaseText, this.width / 2, this.gridOffsetY - 30, 'bold 28px Arial', phaseColor, 'center');
    }

    // Timer bar (during memorize phase)
    if (this.state.phase === 'memorize') {
      const barWidth = 200;
      const barHeight = 10;
      const barX = (this.width - barWidth) / 2;
      const barY = this.gridOffsetY - 10;
      const progress = this.state.timeRemaining / this.state.flashDuration;

      this.drawRect(barX, barY, barWidth, barHeight, '#333', 5);
      this.drawRect(barX, barY, barWidth * progress, barHeight, '#00ff88', 5);
    }
  }

  private renderGameOver(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Game over text
    this.drawText('GAME OVER', this.width / 2, this.height / 2 - 60, 'bold 48px Arial', '#ffffff', 'center');
    this.drawText(`Final Score: ${this.state.score}`, this.width / 2, this.height / 2, 'bold 32px Arial', '#00ff88', 'center');
    this.drawText(`Level Reached: ${this.state.level}`, this.width / 2, this.height / 2 + 40, '24px Arial', '#ffffff', 'center');
    this.drawText('Tap to play again', this.width / 2, this.height / 2 + 100, '20px Arial', '#aaaaaa', 'center');
  }

  // ===== EFFECTS =====

  private createPopEffect(cell: MatrixCell, color: string): void {
    const x = this.gridOffsetX + cell.x * this.cellSize + this.cellSize / 2;
    const y = this.gridOffsetY + cell.y * this.cellSize + this.cellSize / 2;

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 150,
        vy: Math.sin(angle) * 150,
        life: 0.5,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  }

  private createWobbleEffect(cell: MatrixCell, color: string): void {
    // TODO: Implement wobble animation
    this.createPopEffect(cell, color);
  }

  private createExplosionEffect(): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 100;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: Math.random() * 0.5 + 0.5,
        color: ['#00ff88', '#ffaa00', '#ff4444', '#4444ff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 6 + 3,
      });
    }
  }

  private updateParticles(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += 300 * deltaTime; // Gravity
      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private renderParticles(): void {
    this.particles.forEach((particle) => {
      this.ctx.globalAlpha = Math.max(0, particle.life);
      this.drawCircle(particle.x, particle.y, particle.size, particle.color);
      this.ctx.globalAlpha = 1;
    });
  }

  private playSound(type: 'pop' | 'wobble'): void {
    // TODO: Implement sound effects
    // For now, use Web Audio API or HTML5 Audio
  }

  protected onResize(): void {
    // Recalculate grid layout on resize
    this.calculateGridLayout();
  }

  // ===== PUBLIC API =====

  public getState(): MatrixGameState {
    return { ...this.state };
  }

  public usePowerUp(powerUpId: string): boolean {
    const powerUp = this.state.powerUps.find((p) => p.id === powerUpId);
    if (!powerUp || powerUp.isActive) return false;

    switch (powerUpId) {
      case 'slow-motion':
        this.state.flashDuration *= 2;
        this.state.timeRemaining *= 2;
        powerUp.isActive = true;
        setTimeout(() => {
          this.state.flashDuration /= 2;
          powerUp.isActive = false;
        }, (powerUp.duration || 5) * 1000);
        return true;

      case 'hint':
        const unrevealed = this.state.sequence.filter(
          (c) => !this.state.cells.find((cell) => cell.x === c.x && cell.y === c.y)?.revealed
        );
        if (unrevealed.length > 0) {
          const hint = unrevealed[0];
          const cell = this.state.cells.find((c) => c.x === hint.x && c.y === hint.y);
          if (cell) {
            this.handleCellClick(cell);
          }
        }
        return true;

      case 'skip':
        this.startNewRound();
        return true;

      default:
        return false;
    }
  }

  public reset(): void {
    this.state = this.initializeState();
    this.startNewRound();
  }
}
