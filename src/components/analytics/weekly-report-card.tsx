'use client';

/**
 * Weekly Report Card
 * Animated weekly summary with achievements and improvements
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeeklyStats, Achievement, Improvement } from '@/types/analytics';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

interface WeeklyReportCardProps {
  userId: string;
  stats: WeeklyStats;
  onShare?: () => void;
  onExportPDF?: () => void;
}

interface AnimatedStat {
  label: string;
  value: number;
  unit: string;
  trend: number;
  color: string;
  icon: string;
  delay: number;
}

export function WeeklyReportCard({
  userId,
  stats,
  onShare,
  onExportPDF,
}: WeeklyReportCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<AnimatedStat[]>([]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTrendEmoji = (trend: number) => {
    if (trend > 10) return '🚀';
    if (trend > 0) return '📈';
    if (trend < -10) return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const prepareAnimatedStats = useCallback(() => {
    const stats_array: AnimatedStat[] = [
      {
        label: 'Focus Time',
        value: stats.focusTime.total,
        unit: 'min',
        trend: stats.focusTime.trend,
        color: 'from-blue-500 to-blue-600',
        icon: '🎯',
        delay: 0.2,
      },
      {
        label: 'Tasks Completed',
        value: stats.tasksCompleted.total,
        unit: 'tasks',
        trend: stats.tasksCompleted.trend,
        color: 'from-green-500 to-green-600',
        icon: '✅',
        delay: 0.4,
      },
      {
        label: 'Avg Energy',
        value: stats.energy.average,
        unit: '/5',
        trend: stats.energy.trend,
        color: 'from-purple-500 to-purple-600',
        icon: '⚡',
        delay: 0.6,
      },
      {
        label: 'Distractions',
        value: stats.distractions.total,
        unit: '',
        trend: -stats.distractions.trend, // Inverted - fewer is better
        color: 'from-orange-500 to-orange-600',
        icon: '🎧',
        delay: 0.8,
      },
    ];

    setAnimatedStats(stats_array);
  }, [stats]);

  useEffect(() => {
    prepareAnimatedStats();
  }, [prepareAnimatedStats]);

  useEffect(() => {
    // Auto-advance through steps
    const timer = setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);

        // Trigger confetti on achievements reveal
        if (currentStep === 2 && stats.achievements.length > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentStep, stats.achievements.length]);

  const renderStatCard = (stat: AnimatedStat, index: number) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: stat.delay, duration: 0.5, type: 'spring' }}
      className="relative"
    >
      <div className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 shadow-lg`}>
        {/* Icon */}
        <div className="text-4xl mb-2">{stat.icon}</div>

        {/* Value with count-up animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: stat.delay + 0.3 }}
          className="space-y-1"
        >
          <p className="text-sm text-white/80 font-medium">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <CountUp end={stat.value} duration={1} delay={stat.delay} />
            <span className="text-lg text-white/80">{stat.unit}</span>
          </div>
        </motion.div>

        {/* Trend */}
        {stat.trend !== 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: stat.delay + 0.6 }}
            className="mt-3 flex items-center gap-2"
          >
            <span className="text-xl">{getTrendEmoji(stat.trend)}</span>
            <span className={`text-sm font-semibold ${getTrendColor(stat.trend)}`}>
              {Math.abs(stat.trend).toFixed(0)}% vs last week
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  const renderAchievements = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="space-y-4"
    >
      <h3 className="text-2xl font-bold text-white text-center mb-6">
        🏆 Achievements Unlocked!
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className={`relative overflow-hidden rounded-lg border-2 ${
              achievement.rarity === 'legendary'
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-900/30 to-purple-900/30'
                : achievement.rarity === 'epic'
                ? 'border-purple-400 bg-gradient-to-br from-purple-900/30 to-blue-900/30'
                : achievement.rarity === 'rare'
                ? 'border-blue-400 bg-gradient-to-br from-blue-900/30 to-gray-900/30'
                : 'border-gray-400 bg-gradient-to-br from-gray-900/30 to-gray-800/30'
            } p-4`}
          >
            {/* Rarity Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  achievement.rarity === 'legendary'
                    ? 'bg-yellow-500 text-black'
                    : achievement.rarity === 'epic'
                    ? 'bg-purple-500 text-white'
                    : achievement.rarity === 'rare'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {achievement.rarity.toUpperCase()}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-5xl flex-shrink-0">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-1">{achievement.title}</h4>
                <p className="text-sm text-gray-400">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Unlocked {formatDate(achievement.unlockedAt)}
                </p>
              </div>
            </div>

            {/* Celebration effect */}
            {achievement.celebration.confetti && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1, duration: 2 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 100}%`,
                      y: `${50 + (Math.random() - 0.5) * 100}%`,
                      scale: 1,
                      opacity: 0,
                    }}
                    transition={{ duration: 1.5, delay: i * 0.05 }}
                    className="absolute w-2 h-2 rounded-full bg-yellow-400"
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {stats.achievements.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg">No achievements this week</p>
          <p className="text-sm mt-2">Keep pushing! You'll unlock some next week 💪</p>
        </div>
      )}
    </motion.div>
  );

  const renderImprovements = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-2xl font-bold text-white mb-4">📊 Areas of Improvement</h3>

      <div className="space-y-3">
        {stats.improvements.map((improvement, index) => (
          <motion.div
            key={improvement.area}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border-l-4 ${
              improvement.priority === 'high'
                ? 'border-red-500 bg-red-900/20'
                : improvement.priority === 'medium'
                ? 'border-yellow-500 bg-yellow-900/20'
                : 'border-green-500 bg-green-900/20'
            } rounded-r-lg p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-lg font-semibold text-white">{improvement.area}</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {improvement.currentScore.toFixed(0)}
                </span>
                <div className="text-xs text-gray-400">
                  <div>was {improvement.previousScore.toFixed(0)}</div>
                  <div
                    className={
                      improvement.percentChange > 0 ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {improvement.percentChange > 0 ? '↑' : '↓'}{' '}
                    {Math.abs(improvement.percentChange).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${improvement.currentScore}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                className={`h-full ${
                  improvement.priority === 'high'
                    ? 'bg-red-500'
                    : improvement.priority === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              />
            </div>

            {/* Tips */}
            <div className="space-y-1">
              {improvement.tips.map((tip, tipIndex) => (
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + tipIndex * 0.1 + 0.5 }}
                  className="text-sm text-gray-300 flex items-start gap-2"
                >
                  <span className="text-green-400">•</span>
                  {tip}
                </motion.p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            📅 Weekly Report Card
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400"
          >
            {formatDate(stats.weekStart)} - {formatDate(stats.weekEnd)}
          </motion.p>
        </div>

        {/* Stats Grid */}
        {currentStep >= 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {animatedStats.map((stat, index) => renderStatCard(stat, index))}
          </div>
        )}

        {/* Best Day Highlight */}
        {currentStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-500/30 rounded-lg p-6 text-center"
          >
            <p className="text-sm text-gray-400 mb-2">🌟 Best Focus Day</p>
            <p className="text-3xl font-bold text-white">
              {formatDate(stats.focusTime.bestDay)}
            </p>
            <p className="text-lg text-emerald-400 mt-2">
              {stats.focusTime.average.toFixed(0)} minutes of deep focus
            </p>
          </motion.div>
        )}

        {/* Achievements */}
        {currentStep >= 2 && renderAchievements()}

        {/* Improvements */}
        {currentStep >= 3 && renderImprovements()}

        {/* Actions */}
        {currentStep >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-4 pt-4"
          >
            <Button
              onClick={onShare}
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              📱 Share Victory Card
            </Button>
            <Button
              onClick={onExportPDF}
              variant="outline"
              className="border-gray-600 hover:bg-gray-800"
            >
              📄 Export PDF
            </Button>
          </motion.div>
        )}

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50%',
                    y: -20,
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: window.innerHeight + 20,
                    rotate: Math.random() * 720,
                    opacity: 0,
                  }}
                  transition={{ duration: 3, delay: i * 0.05 }}
                  className={`absolute w-3 h-3 rounded-full ${
                    ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-red-400'][
                      i % 5
                    ]
                  }`}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

// Count-up animation component
function CountUp({ end, duration, delay }: { end: number; duration: number; delay: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return <span className="text-4xl font-bold text-white">{Math.floor(count)}</span>;
}
