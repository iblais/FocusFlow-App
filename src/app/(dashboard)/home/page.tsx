'use client';

import { Plus, Zap, Target, TrendingUp, Sparkles } from "lucide-react";
import { AnimatedBackground } from "@/components/design/AnimatedBackground";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/design/GlassCard";
import { NeumorphButton } from "@/components/design/NeumorphButton";
import { AnimatedStat } from "@/components/design/AnimatedNumber";
import { FloatingParticles } from "@/components/design/FloatingParticles";
import { motion } from "framer-motion";
import { useParticleRewards } from "@/hooks/use-particle-rewards";

export default function HomePage() {
  const { triggerConfetti } = useParticleRewards();

  const handleStartCheckin = () => {
    triggerConfetti('focusSession');
  };

  return (
    <AnimatedBackground>
      <FloatingParticles count={10} colorScheme="focus" />

      <div className="p-6 lg:p-8 space-y-8 pb-20 lg:pb-8">
        {/* Header */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-slate-600">
            Ready to focus and make progress today?
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard variant="light">
            <AnimatedStat
              value={0}
              label="Current Streak"
              suffix=" days"
              icon={<Zap className="h-5 w-5 text-white" />}
              gradient="from-amber-400 to-orange-500"
            />
            <p className="text-xs text-slate-600 mt-2">
              Keep it going!
            </p>
          </GlassCard>

          <GlassCard variant="light">
            <AnimatedStat
              value={0}
              label="Tasks Today"
              suffix="/0"
              icon={<Target className="h-5 w-5 text-white" />}
              gradient="from-indigo-500 to-purple-500"
            />
            <p className="text-xs text-slate-600 mt-2">
              No tasks yet
            </p>
          </GlassCard>

          <GlassCard variant="light">
            <AnimatedStat
              value={0}
              label="Total XP"
              suffix=" XP"
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              gradient="from-emerald-400 to-teal-500"
            />
            <p className="text-xs text-slate-600 mt-2">
              Level 1
            </p>
          </GlassCard>
        </div>

        {/* Daily Check-in */}
        <GlassCard variant="medium">
          <GlassCardHeader>
            <GlassCardTitle>Daily Check-in</GlassCardTitle>
            <GlassCardDescription>
              How are you feeling today? Set your intentions for a productive day.
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <NeumorphButton
              variant="primary"
              onClick={handleStartCheckin}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Start Daily Check-in
            </NeumorphButton>
          </GlassCardContent>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard variant="medium">
          <GlassCardHeader>
            <GlassCardTitle>Quick Actions</GlassCardTitle>
            <GlassCardDescription>
              Get started with your most common tasks
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="grid gap-3 md:grid-cols-2">
            <NeumorphButton
              variant="secondary"
              icon={<Plus className="h-4 w-4" />}
            >
              Add New Task
            </NeumorphButton>
            <NeumorphButton
              variant="energy"
              icon={<Zap className="h-4 w-4" />}
            >
              Start Focus Session
            </NeumorphButton>
          </GlassCardContent>
        </GlassCard>

        {/* Today's Tasks */}
        <GlassCard variant="light">
          <GlassCardHeader>
            <GlassCardTitle>Today&apos;s Tasks</GlassCardTitle>
            <GlassCardDescription>
              Your top priorities for today
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="text-sm text-slate-600 text-center py-8">
              No tasks scheduled for today. Add your first task to get started!
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </AnimatedBackground>
  );
}
