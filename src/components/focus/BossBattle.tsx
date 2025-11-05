'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Heart, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/design/GlassCard';
import { useParticleRewards } from '@/hooks/use-particle-rewards';

interface BossBattleProps {
  isActive: boolean;
  sessionDuration: number; // in seconds
  targetDuration: number; // Boss battle duration target
  distractionCount: number;
  onVictory?: () => void;
  onDefeat?: () => void;
}

interface Boss {
  name: string;
  emoji: string;
  health: number;
  maxHealth: number;
  attacks: string[];
}

export function BossBattle({
  isActive,
  sessionDuration,
  targetDuration,
  distractionCount,
  onVictory,
  onDefeat,
}: BossBattleProps) {
  const { triggerConfetti } = useParticleRewards();
  const [boss, setBoss] = useState<Boss>({
    name: 'Distraction Dragon',
    emoji: '🐉',
    health: 100,
    maxHealth: 100,
    attacks: ['Social Media Blast', 'Notification Storm', 'Procrastination Pulse'],
  });

  const [playerHealth, setPlayerHealth] = useState(100);
  const [isAttacking, setIsAttacking] = useState(false);
  const [bossAttacking, setBossAttacking] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isVictorious, setIsVictorious] = useState(false);

  // Player deals damage based on focus time
  useEffect(() => {
    if (!isActive) return;

    const damagePerSecond = 100 / targetDuration;
    const totalDamage = sessionDuration * damagePerSecond;
    const newBossHealth = Math.max(0, 100 - totalDamage);

    setBoss((prev) => ({ ...prev, health: newBossHealth }));

    // Attack animation every 10 seconds
    if (sessionDuration % 10 === 0 && sessionDuration > 0) {
      setIsAttacking(true);
      addBattleLog(`💪 You deal ${damagePerSecond.toFixed(1)} focus damage!`);
      setTimeout(() => setIsAttacking(false), 500);
    }

    // Check for victory
    if (newBossHealth <= 0 && !isVictorious) {
      setIsVictorious(true);
      addBattleLog('🎉 VICTORY! You defeated the Distraction Dragon!');
      triggerConfetti('achievement');
      onVictory?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDuration, isActive, targetDuration, isVictorious]);

  // Boss attacks based on distractions
  useEffect(() => {
    if (distractionCount > 0) {
      const damagePerDistraction = 15;
      const totalDamage = distractionCount * damagePerDistraction;
      const newPlayerHealth = Math.max(0, 100 - totalDamage);

      setPlayerHealth(newPlayerHealth);
      setBossAttacking(true);

      const randomAttack = boss.attacks[Math.floor(Math.random() * boss.attacks.length)];
      addBattleLog(`🔥 Boss uses ${randomAttack}! You take ${damagePerDistraction} damage!`);

      setTimeout(() => setBossAttacking(false), 800);

      // Check for defeat
      if (newPlayerHealth <= 0) {
        addBattleLog('💀 DEFEATED! The boss was too powerful!');
        onDefeat?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distractionCount]);

  const addBattleLog = (message: string) => {
    setBattleLog((prev) => [message, ...prev].slice(0, 5));
  };

  const getBossDifficulty = (): string => {
    const minutes = targetDuration / 60;
    if (minutes >= 90) return '🔥 LEGENDARY';
    if (minutes >= 60) return '⚔️ EPIC';
    if (minutes >= 45) return '🛡️ HARD';
    return '⭐ NORMAL';
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <GlassCard variant="dark" className="relative overflow-hidden">
        {/* Epic background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-purple-500/20 to-orange-500/20"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        <div className="relative space-y-4 p-4">
          {/* Battle Header */}
          <div className="text-center">
            <motion.h3
              className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              BOSS BATTLE
            </motion.h3>
            <p className="text-xs text-slate-600 mt-1">{getBossDifficulty()}</p>
          </div>

          {/* Boss Section */}
          <div className="text-center">
            <motion.div
              className="text-8xl"
              animate={{
                scale: bossAttacking ? [1, 1.3, 1] : 1,
                rotate: bossAttacking ? [0, -10, 10, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              {boss.emoji}
            </motion.div>
            <h4 className="font-bold text-lg text-slate-900 mt-2">{boss.name}</h4>

            {/* Boss Health Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  Boss HP
                </span>
                <span>
                  {Math.round(boss.health)}/{boss.maxHealth}
                </span>
              </div>
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-300">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 relative overflow-hidden"
                  style={{ width: `${boss.health}%` }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/30"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Battle Arena Divider */}
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{
                rotate: isAttacking ? 360 : 0,
                scale: isAttacking ? 1.5 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              <Swords className="h-6 w-6 text-indigo-600" />
            </motion.div>
          </div>

          {/* Player Section */}
          <div className="text-center">
            <motion.div
              className="text-4xl"
              animate={{
                scale: isAttacking ? [1, 1.3, 1] : 1,
                y: isAttacking ? [0, -10, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              🧠
            </motion.div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">Your Focus</h4>

            {/* Player Health Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-500" />
                  Your HP
                </span>
                <span>{playerHealth}/100</span>
              </div>
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-300">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${playerHealth}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div className="bg-slate-900/80 rounded-lg p-3 min-h-[80px] max-h-[120px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {battleLog.map((log, index) => (
                <motion.p
                  key={`${log}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-white mb-1 font-mono"
                >
                  {log}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs text-slate-600">Damage Dealt</p>
              <p className="text-lg font-bold text-indigo-600">{Math.round(100 - boss.health)}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs text-slate-600">Time</p>
              <p className="text-lg font-bold text-purple-600">
                {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs text-slate-600">Distractions</p>
              <p className="text-lg font-bold text-red-600">{distractionCount}</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
