'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { premiumTheme } from '@/lib/design/premium-theme';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface BreathingGuideProps {
  isActive: boolean;
  size?: number;
}

export function BreathingGuide({ isActive, size = 200 }: BreathingGuideProps) {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);

  // Breathing pattern: 4-7-8 technique (inhale 4s, hold 7s, exhale 8s)
  const breathingPattern = {
    inhale: 4000,
    'hold-in': 7000,
    exhale: 8000,
    'hold-out': 2000,
  };

  useEffect(() => {
    if (!isActive) return;

    const runBreathingCycle = () => {
      const phases: BreathPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];
      let currentPhaseIndex = 0;

      const nextPhase = () => {
        const currentPhase = phases[currentPhaseIndex];
        setPhase(currentPhase);

        setTimeout(() => {
          currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
          if (currentPhaseIndex === 0) {
            setCycleCount((prev) => prev + 1);
          }
          nextPhase();
        }, breathingPattern[currentPhase]);
      };

      nextPhase();
    };

    runBreathingCycle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const getScaleForPhase = (): number => {
    switch (phase) {
      case 'inhale':
      case 'hold-in':
        return 1.5;
      case 'exhale':
      case 'hold-out':
        return 0.7;
    }
  };

  const getTextForPhase = (): string => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold-in':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'hold-out':
        return 'Hold';
    }
  };

  const getDurationForPhase = (): number => {
    return breathingPattern[phase] / 1000;
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Breathing Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer pulsing rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Main breathing circle */}
        <motion.div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: premiumTheme.gradients.focus,
          }}
          animate={{
            scale: getScaleForPhase(),
          }}
          transition={{
            duration: getDurationForPhase(),
            ease: phase.includes('hold') ? 'linear' : 'easeInOut',
          }}
        >
          <div className="text-white text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xl font-semibold">{getTextForPhase()}</p>
                <p className="text-sm opacity-80">{getDurationForPhase()}s</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Heart rate visualization ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-pink-400"
          style={{
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Cycle counter */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm text-slate-600">
          Breathing Cycles: <span className="font-bold text-indigo-600">{cycleCount}</span>
        </p>
      </motion.div>
    </div>
  );
}
