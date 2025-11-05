'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PomodoroTimer } from '@/components/focus/pomodoro-timer';
import { BreathingGuide } from '@/components/focus/BreathingGuide';
import { FocusPet } from '@/components/focus/FocusPet';
import { AmbientSoundscape } from '@/components/focus/AmbientSoundscape';
import { ComboMultiplier, PowerUpType } from '@/components/focus/ComboMultiplier';
import { AICoach } from '@/components/focus/AICoach';
import { ParallaxBackground } from '@/components/focus/ParallaxBackground';
import { BossBattle } from '@/components/focus/BossBattle';
import { GlassCard } from '@/components/design/GlassCard';
import { NeumorphButton } from '@/components/design/NeumorphButton';
import { Settings2, Target, Sparkles } from 'lucide-react';
import { useTimerStore } from '@/lib/stores/timer-store';

type FocusMode = 'standard' | 'breathing' | 'boss-battle';

export default function FocusPage() {
  const [focusMode, setFocusMode] = useState<FocusMode>('standard');
  const [showBreathing, setShowBreathing] = useState(false);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(75); // Demo value
  const [consecutiveSessions, setConsecutiveSessions] = useState(3); // Demo value
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>('none');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isFocusBubble, setIsFocusBubble] = useState(false);

  const { status, mode } = useTimerStore();
  const isTimerActive = status === 'running' && mode === 'focus';

  // Update session duration
  useEffect(() => {
    if (isTimerActive) {
      const interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSessionDuration(0);
    }
  }, [isTimerActive]);

  const handlePowerUpExpired = () => {
    setActivePowerUp('none');
  };

  const handleBossVictory = () => {
    setConsecutiveSessions((prev) => prev + 1);
    setTotalFocusMinutes((prev) => prev + 90);
  };

  return (
    <>
      {/* Immersive Parallax Background */}
      <ParallaxBackground />

      {/* Focus Bubble Effect */}
      <AnimatePresence>
        {isFocusBubble && isTimerActive && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 backdrop-blur-xl bg-slate-900/30" />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <div className="w-[600px] h-[600px] rounded-full bg-transparent border-4 border-white/20" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-6 lg:p-8 space-y-6 pb-20 lg:pb-8">
        {/* AI Coach at the top */}
        <div className="max-w-2xl mx-auto">
          <AICoach
            sessionDuration={sessionDuration}
            isActive={isTimerActive}
            consecutiveSessions={consecutiveSessions}
          />
        </div>

        {/* Header with Mode Selection */}
        <div className="text-center space-y-4">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Immersive Focus
          </motion.h1>

          {/* Mode Selector */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <NeumorphButton
              size="sm"
              variant={focusMode === 'standard' ? 'primary' : 'secondary'}
              onClick={() => setFocusMode('standard')}
              icon={<Target className="h-4 w-4" />}
            >
              Standard
            </NeumorphButton>
            <NeumorphButton
              size="sm"
              variant={focusMode === 'breathing' ? 'primary' : 'secondary'}
              onClick={() => {
                setFocusMode('breathing');
                setShowBreathing(true);
              }}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Breathing
            </NeumorphButton>
            <NeumorphButton
              size="sm"
              variant={focusMode === 'boss-battle' ? 'energy' : 'secondary'}
              onClick={() => setFocusMode('boss-battle')}
              icon={<Settings2 className="h-4 w-4" />}
            >
              Boss Battle
            </NeumorphButton>
          </div>

          {/* Focus Bubble Toggle */}
          <button
            onClick={() => setIsFocusBubble(!isFocusBubble)}
            className="text-xs text-slate-600 hover:text-indigo-600 transition-colors"
          >
            {isFocusBubble ? '⭕ Focus Bubble: ON' : '◯ Focus Bubble: OFF'}
          </button>
        </div>

        {/* Combo Multiplier */}
        <div className="max-w-2xl mx-auto">
          <ComboMultiplier
            consecutiveSessions={consecutiveSessions}
            activePowerUp={activePowerUp}
            onPowerUpExpired={handlePowerUpExpired}
          />
        </div>

        {/* Main Focus Area */}
        <div className="max-w-4xl mx-auto grid gap-6 lg:grid-cols-2">
          {/* Timer Section */}
          <div className="space-y-6">
            {focusMode === 'breathing' && showBreathing ? (
              <GlassCard variant="light" className="p-8">
                <BreathingGuide isActive={isTimerActive || showBreathing} />
                <div className="mt-6">
                  <NeumorphButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBreathing(false)}
                    className="w-full"
                  >
                    Show Timer
                  </NeumorphButton>
                </div>
              </GlassCard>
            ) : (
              <PomodoroTimer />
            )}

            {/* Ambient Soundscape */}
            <AmbientSoundscape isActive={isTimerActive} />
          </div>

          {/* Right Column: Pet & Boss Battle */}
          <div className="space-y-6">
            {/* Focus Pet */}
            <GlassCard variant="medium" className="p-6">
              <FocusPet
                focusMinutes={totalFocusMinutes}
                isActive={isTimerActive}
                onMilestone={(stage) => {
                  console.log('Pet evolved to:', stage);
                }}
              />
            </GlassCard>

            {/* Boss Battle Mode */}
            {focusMode === 'boss-battle' && (
              <BossBattle
                isActive={isTimerActive}
                sessionDuration={sessionDuration}
                targetDuration={90 * 60} // 90 minutes
                distractionCount={0}
                onVictory={handleBossVictory}
              />
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard variant="light">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Immersive Features</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                  <p className="font-medium">Breathing Guide</p>
                </div>
                <p className="text-sm text-slate-600">
                  4-7-8 breathing technique for optimal focus and relaxation
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-600">
                  <Target className="h-5 w-5" />
                  <p className="font-medium">Focus Pet</p>
                </div>
                <p className="text-sm text-slate-600">
                  Watch your companion grow as you build consistent focus habits
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-pink-600">
                  <Settings2 className="h-5 w-5" />
                  <p className="font-medium">Boss Battles</p>
                </div>
                <p className="text-sm text-slate-600">
                  Epic challenges for extended deep work sessions with massive rewards
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
}
