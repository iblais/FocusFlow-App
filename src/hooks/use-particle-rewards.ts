'use client';

import confetti from 'canvas-confetti';
import { premiumTheme } from '@/lib/design/premium-theme';

export type ParticleRewardType = 'taskComplete' | 'levelUp' | 'streak' | 'achievement' | 'focusSession';

export function useParticleRewards() {
  const triggerConfetti = (type: ParticleRewardType) => {
    const colors = getColorsForType(type);

    switch (type) {
      case 'taskComplete':
        quickBurst(colors);
        break;
      case 'levelUp':
        explosiveCelebration(colors);
        break;
      case 'streak':
        streamingConfetti(colors);
        break;
      case 'achievement':
        goldShower(colors);
        break;
      case 'focusSession':
        gentleFloat(colors);
        break;
    }
  };

  const quickBurst = (colors: string[]) => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 45,
      origin: { x: 0.5, y: 0.5 },
      colors,
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
    });
  };

  const explosiveCelebration = (colors: string[]) => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const streamingConfetti = (colors: string[]) => {
    const duration = 3000;
    const end = Date.now() + duration;

    const interval: NodeJS.Timeout = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors,
      });
    }, 50);
  };

  const goldShower = (colors: string[]) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.2 },
      colors,
      ticks: 300,
      gravity: 0.8,
      decay: 0.92,
      startVelocity: 45,
      shapes: ['star'],
      scalar: 1.2,
    });
  };

  const gentleFloat = (colors: string[]) => {
    confetti({
      particleCount: 30,
      angle: 90,
      spread: 360,
      origin: { x: 0.5, y: 0.8 },
      colors,
      ticks: 400,
      gravity: 0.4,
      decay: 0.96,
      startVelocity: 20,
      shapes: ['circle'],
      scalar: 0.8,
    });
  };

  const getColorsForType = (type: ParticleRewardType): string[] => {
    switch (type) {
      case 'taskComplete':
        return premiumTheme.particles.success;
      case 'levelUp':
        return premiumTheme.particles.dopamine;
      case 'streak':
        return premiumTheme.particles.energy;
      case 'achievement':
        return ['#FFD700', '#FFA500', '#FFFF00', '#FFE55C'];
      case 'focusSession':
        return premiumTheme.particles.focus;
      default:
        return premiumTheme.particles.dopamine;
    }
  };

  return { triggerConfetti };
}
