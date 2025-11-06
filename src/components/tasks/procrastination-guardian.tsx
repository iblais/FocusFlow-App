'use client';

/**
 * Procrastination Guardian
 * Predicts procrastination patterns and provides gentle,
 * ADHD-friendly interventions to help users stay on track
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Coffee,
  Zap,
  Users,
  Target,
  TrendingUp,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/design/GlassCard';
import { Badge } from '@/components/ui/badge';
import type {
  ProcrastinationEvent,
  InterventionMessage,
  InterventionType,
  EmotionalState,
} from '@/types/adhd-task-system';

interface ProcrastinationGuardianProps {
  userId: string;
  taskId: string;
  taskTitle: string;
  onAction?: (action: string, data?: any) => void;
}

const INTERVENTION_ICONS: Record<InterventionType, React.ElementType> = {
  break_suggestion: Coffee,
  task_breakdown: Target,
  accountability_ping: Users,
  energy_boost: Zap,
  micro_win: TrendingUp,
};

const INTERVENTION_COLORS: Record<InterventionType, string> = {
  break_suggestion: 'text-blue-500 bg-blue-500/20',
  task_breakdown: 'text-purple-500 bg-purple-500/20',
  accountability_ping: 'text-pink-500 bg-pink-500/20',
  energy_boost: 'text-orange-500 bg-orange-500/20',
  micro_win: 'text-green-500 bg-green-500/20',
};

const TONE_EMOJIS = {
  encouraging: '💪',
  understanding: '🤗',
  celebratory: '🎉',
  gentle: '💙',
};

export function ProcrastinationGuardian({
  userId,
  taskId,
  taskTitle,
  onAction,
}: ProcrastinationGuardianProps) {
  const [showIntervention, setShowIntervention] = useState(false);
  const [intervention, setIntervention] = useState<InterventionMessage | null>(null);
  const [procrastinationRisk, setProcrastinationRisk] = useState<number>(0);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const logIntervention = useCallback(async (
    interventionData: InterventionMessage,
    accepted: boolean
  ) => {
    try {
      await fetch('/api/analytics/procrastination-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          taskId,
          eventType: 'intervention',
          interventionShown: true,
          interventionType: interventionData.type,
          interventionAccepted: accepted,
          emotionalState,
          timeOfDay: getTimeOfDay(),
          energyLevel: await getCurrentEnergyLevel(),
        }),
      });
    } catch (error) {
      console.error('Failed to log intervention:', error);
    }
  }, [userId, taskId, emotionalState]);

  const calculateProcrastinationRisk = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch('/api/analytics/procrastination-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          taskId,
        }),
      });

      if (response.ok) {
        const { risk, factors } = await response.json();
        return risk;
      }
    } catch (error) {
      console.error('Failed to calculate procrastination risk:', error);
    }

    return 0;
  }, [userId, taskId]);

  const generateIntervention = useCallback(async (risk: number) => {
    try {
      const response = await fetch('/api/ai/generate-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          taskId,
          taskTitle,
          risk,
          emotionalState,
        }),
      });

      if (response.ok) {
        const interventionData: InterventionMessage = await response.json();
        setIntervention(interventionData);
        setShowIntervention(true);

        // Log intervention shown
        await logIntervention(interventionData, false);
      }
    } catch (error) {
      console.error('Failed to generate intervention:', error);
    }
  }, [userId, taskId, taskTitle, emotionalState, logIntervention]);

  const startMonitoring = useCallback(async () => {
    setIsMonitoring(true);

    // Check for procrastination patterns
    const risk = await calculateProcrastinationRisk();
    setProcrastinationRisk(risk);

    if (risk > 0.6) {
      // High risk - show intervention
      await generateIntervention(risk);
    }

    // Set up periodic checks
    const intervalId = setInterval(async () => {
      const newRisk = await calculateProcrastinationRisk();
      setProcrastinationRisk(newRisk);

      if (newRisk > 0.7 && !showIntervention) {
        await generateIntervention(newRisk);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [calculateProcrastinationRisk, generateIntervention, showIntervention]);

  useEffect(() => {
    startMonitoring();
    return () => setIsMonitoring(false);
  }, [startMonitoring]);

  const handleInterventionAction = async (action: string, data?: any) => {
    if (!intervention) return;

    // Log intervention acceptance
    await logIntervention(intervention, true);

    setShowIntervention(false);

    // Execute action
    switch (action) {
      case 'break':
        onAction?.('take_break', { duration: data?.duration || 5 });
        break;

      case 'breakdown':
        onAction?.('show_breakdown');
        break;

      case 'notify_partner':
        await notifyAccountabilityPartner();
        break;

      case 'defer':
        onAction?.('defer_task', { reason: data?.reason });
        break;

      case 'simplify':
        onAction?.('simplify_task');
        break;

      case 'dismiss':
        // Just close
        break;

      default:
        console.warn('Unknown intervention action:', action);
    }
  };

  const notifyAccountabilityPartner = async () => {
    try {
      await fetch('/api/collaboration/notify-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          taskId,
          taskTitle,
          message: 'needs_support',
        }),
      });
    } catch (error) {
      console.error('Failed to notify partner:', error);
    }
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const getCurrentEnergyLevel = async (): Promise<number> => {
    // Would normally fetch from user's current state or biometric data
    return 3; // Default medium energy
  };

  const renderIntervention = () => {
    if (!intervention) return null;

    const Icon = INTERVENTION_ICONS[intervention.type];
    const colorClass = INTERVENTION_COLORS[intervention.type];
    const toneEmoji = TONE_EMOJIS[intervention.tone];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className="fixed bottom-20 right-4 z-50 max-w-md"
      >
        <GlassCard variant="medium" className="p-5 shadow-2xl border-2 border-purple-300">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-1">
                  <span>{toneEmoji}</span>
                  {intervention.title}
                </h4>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInterventionAction('dismiss')}
              className="text-gray-400 hover:text-gray-600 -mt-1 -mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Message */}
          <p className="text-gray-700 mb-4 leading-relaxed">{intervention.message}</p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {intervention.actions.map((action, index) => {
              const isPositive = ['break', 'breakdown', 'notify_partner'].includes(
                action.action
              );

              return (
                <Button
                  key={index}
                  variant={isPositive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInterventionAction(action.action, action.data)}
                  className={
                    isPositive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : ''
                  }
                >
                  {action.label}
                </Button>
              );
            })}
          </div>

          {/* Risk indicator */}
          {procrastinationRisk > 0.5 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <AlertCircle className="h-3 w-3" />
                <span>
                  Procrastination risk:{' '}
                  <span
                    className={
                      procrastinationRisk > 0.7
                        ? 'text-red-600 font-bold'
                        : 'text-orange-600 font-bold'
                    }
                  >
                    {Math.round(procrastinationRisk * 100)}%
                  </span>
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    );
  };

  const renderEmotionalCheckIn = () => {
    if (showIntervention || emotionalState) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-20 right-4 z-40"
      >
        <GlassCard variant="light" className="p-4">
          <p className="text-sm text-gray-700 mb-3">How are you feeling about this task?</p>

          <div className="grid grid-cols-3 gap-2">
            {(['overwhelmed', 'anxious', 'unmotivated', 'energized', 'calm', 'frustrated'] as EmotionalState[]).map(
              (state) => (
                <Button
                  key={state}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmotionalState(state);
                    generateIntervention(procrastinationRisk);
                  }}
                  className="text-xs capitalize"
                >
                  {state}
                </Button>
              )
            )}
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {showIntervention && renderIntervention()}
      {isMonitoring && procrastinationRisk > 0.5 && renderEmotionalCheckIn()}
    </AnimatePresence>
  );
}

/**
 * Procrastination Insights Dashboard
 * Shows user their procrastination patterns and progress
 */
export function ProcrastinationInsights({ userId }: { userId: string }) {
  const [events, setEvents] = useState<ProcrastinationEvent[]>([]);
  const [patterns, setPatterns] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/procrastination?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        setPatterns(data.patterns);
      }
    } catch (error) {
      console.error('Failed to load procrastination insights:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!patterns) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Procrastination Insights</h3>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard variant="light" className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {patterns.totalEvents}
          </div>
          <div className="text-xs text-gray-600">Events This Week</div>
        </GlassCard>

        <GlassCard variant="light" className="p-4">
          <div className="text-2xl font-bold text-orange-600">
            {patterns.mostCommonReason}
          </div>
          <div className="text-xs text-gray-600">Top Reason</div>
        </GlassCard>

        <GlassCard variant="light" className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(patterns.interventionSuccessRate * 100)}%
          </div>
          <div className="text-xs text-gray-600">Intervention Success</div>
        </GlassCard>
      </div>

      {/* Recent events */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Recent Events</h4>
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => (
            <GlassCard key={event.id} variant="light" className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {event.eventType}
                  </div>
                  {event.reason && (
                    <div className="text-xs text-gray-600 mt-1">{event.reason}</div>
                  )}
                </div>

                <Badge variant="outline" className="text-xs">
                  {event.emotionalState}
                </Badge>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Patterns */}
      {patterns.peakTimes && patterns.peakTimes.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Peak Procrastination Times</h4>
          <div className="flex gap-2">
            {patterns.peakTimes.map((time: string) => (
              <Badge key={time} variant="secondary">
                {time}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
