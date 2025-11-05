'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type PetMood = 'happy' | 'focused' | 'excited' | 'sleeping';
type PetStage = 'egg' | 'baby' | 'young' | 'adult' | 'master';

interface FocusPetProps {
  focusMinutes: number;
  isActive: boolean;
  onMilestone?: (stage: PetStage) => void;
}

export function FocusPet({ focusMinutes, isActive, onMilestone }: FocusPetProps) {
  const [mood, setMood] = useState<PetMood>('happy');
  const [stage, setStage] = useState<PetStage>('egg');
  const [petSize, setPetSize] = useState(50);

  // Determine pet stage based on total focus minutes
  useEffect(() => {
    let newStage: PetStage = 'egg';
    let newSize = 50;

    if (focusMinutes >= 300) {
      newStage = 'master';
      newSize = 120;
    } else if (focusMinutes >= 150) {
      newStage = 'adult';
      newSize = 100;
    } else if (focusMinutes >= 60) {
      newStage = 'young';
      newSize = 80;
    } else if (focusMinutes >= 25) {
      newStage = 'baby';
      newSize = 60;
    }

    if (newStage !== stage) {
      setStage(newStage);
      setPetSize(newSize);
      onMilestone?.(newStage);
    }
  }, [focusMinutes, stage, onMilestone]);

  // Change mood based on activity
  useEffect(() => {
    if (isActive) {
      setMood('focused');
    } else {
      setMood('happy');
    }
  }, [isActive]);

  const getPetEmoji = (): string => {
    switch (stage) {
      case 'egg':
        return '🥚';
      case 'baby':
        return '🐣';
      case 'young':
        return '🐥';
      case 'adult':
        return '🐓';
      case 'master':
        return '🦅';
    }
  };

  const getPetMessage = (): string => {
    if (isActive) {
      const messages = [
        "I'm focusing with you!",
        "We've got this!",
        "Stay strong!",
        "You're doing amazing!",
      ];
      return messages[Math.floor(focusMinutes / 5) % messages.length];
    }

    switch (stage) {
      case 'egg':
        return 'Start focusing to help me hatch!';
      case 'baby':
        return "I just hatched! Let's grow together!";
      case 'young':
        return "I'm getting stronger!";
      case 'adult':
        return "Look how much we've grown!";
      case 'master':
        return "We're focus masters now!";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pet Container */}
      <div className="relative">
        {/* Glow effect when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-indigo-400 to-purple-400"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Pet Character */}
        <motion.div
          className="relative text-center"
          style={{ fontSize: petSize }}
          animate={{
            y: isActive ? [-5, 5, -5] : 0,
            rotate: isActive ? [0, -5, 5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          {getPetEmoji()}
        </motion.div>

        {/* Focus particles around pet when active */}
        {isActive && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 2) * 40, 0],
                  y: [0, Math.sin((i * Math.PI) / 2) * 40, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Pet Stats */}
      <div className="text-center">
        <motion.p
          className="text-sm font-medium text-slate-700"
          key={getPetMessage()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getPetMessage()}
        </motion.p>
        <p className="text-xs text-slate-500 mt-1">
          Level: {stage.toUpperCase()} • {focusMinutes} min total
        </p>
      </div>

      {/* Progress to next stage */}
      {stage !== 'master' && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Next evolution</span>
            <span>
              {focusMinutes}/
              {stage === 'egg'
                ? 25
                : stage === 'baby'
                ? 60
                : stage === 'young'
                ? 150
                : 300}{' '}
              min
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  (focusMinutes /
                    (stage === 'egg'
                      ? 25
                      : stage === 'baby'
                      ? 60
                      : stage === 'young'
                      ? 150
                      : 300)) *
                  100
                }%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
