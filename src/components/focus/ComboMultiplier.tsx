'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Star, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParticleRewards } from '@/hooks/use-particle-rewards';

export type PowerUpType = 'double-xp' | 'shield' | 'star-power' | 'none';

interface PowerUp {
  type: PowerUpType;
  name: string;
  icon: React.ReactNode;
  description: string;
  duration: number; // in seconds
  color: string;
}

const powerUps: PowerUp[] = [
  {
    type: 'double-xp',
    name: '2X XP',
    icon: <Zap className="h-5 w-5" />,
    description: 'Double experience points',
    duration: 300, // 5 minutes
    color: 'from-yellow-400 to-orange-500',
  },
  {
    type: 'shield',
    name: 'Focus Shield',
    icon: <Shield className="h-5 w-5" />,
    description: 'No penalty for distractions',
    duration: 600, // 10 minutes
    color: 'from-blue-400 to-cyan-500',
  },
  {
    type: 'star-power',
    name: 'Star Power',
    icon: <Star className="h-5 w-5" />,
    description: 'Triple XP and immunity',
    duration: 180, // 3 minutes
    color: 'from-purple-400 to-pink-500',
  },
];

interface ComboMultiplierProps {
  consecutiveSessions: number;
  activePowerUp?: PowerUpType;
  onPowerUpExpired?: () => void;
}

export function ComboMultiplier({
  consecutiveSessions,
  activePowerUp = 'none',
  onPowerUpExpired,
}: ComboMultiplierProps) {
  const [showCombo, setShowCombo] = useState(false);
  const { triggerConfetti } = useParticleRewards();

  const multiplier = Math.min(consecutiveSessions, 10);
  const currentPowerUp = powerUps.find((p) => p.type === activePowerUp);

  useEffect(() => {
    if (consecutiveSessions > 1) {
      setShowCombo(true);
      if (consecutiveSessions % 5 === 0) {
        triggerConfetti('streak');
      }
    }
  }, [consecutiveSessions, triggerConfetti]);

  return (
    <div className="space-y-4">
      {/* Combo Counter */}
      <AnimatePresence>
        {showCombo && consecutiveSessions > 1 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="flex items-center justify-center gap-3"
          >
            <motion.div
              className="relative"
              animate={{
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <Flame className="h-8 w-8 text-orange-500" />
              <motion.div
                className="absolute inset-0 blur-lg"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, transparent 70%)',
                }}
              />
            </motion.div>

            <div className="text-center">
              <motion.div
                key={consecutiveSessions}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
              >
                {consecutiveSessions}x
              </motion.div>
              <p className="text-xs text-slate-600 font-medium">COMBO</p>
            </div>

            {/* Multiplier badge */}
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              +{multiplier * 10}% XP
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Power-up Display */}
      <AnimatePresence>
        {currentPowerUp && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`bg-gradient-to-r ${currentPowerUp.color} rounded-2xl p-4 text-white shadow-xl`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1, repeat: Infinity },
                }}
              >
                {currentPowerUp.icon}
              </motion.div>

              <div className="flex-1">
                <h4 className="font-bold text-sm">{currentPowerUp.name}</h4>
                <p className="text-xs opacity-90">{currentPowerUp.description}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Math.floor(currentPowerUp.duration / 60)}
                </div>
                <div className="text-xs opacity-90">min left</div>
              </div>
            </div>

            {/* Power-up progress bar */}
            <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: currentPowerUp.duration, ease: 'linear' }}
                onAnimationComplete={() => onPowerUpExpired?.()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Milestone Indicators */}
      {consecutiveSessions > 0 && (
        <div className="flex items-center justify-center gap-2">
          {[5, 10, 20, 50].map((milestone) => (
            <div
              key={milestone}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                consecutiveSessions >= milestone
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-110'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {milestone}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
