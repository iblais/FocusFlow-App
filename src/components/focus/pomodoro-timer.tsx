"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Timer as TimerIcon } from "lucide-react";
import { motion } from "framer-motion";

export function PomodoroTimer() {
  const {
    mode,
    status,
    timeRemaining,
    sessionsCompleted,
    distractionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    tick,
  } = useTimerStore();

  // Timer tick effect
  useEffect(() => {
    if (status === "running") {
      const interval = setInterval(() => {
        tick();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, tick]);

  // Page visibility tracking for distraction detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === "running" && mode === "focus") {
        useTimerStore.getState().addDistraction();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status, mode]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const totalDuration =
    mode === "focus"
      ? useTimerStore.getState().focusDuration
      : mode === "shortBreak"
      ? useTimerStore.getState().shortBreakDuration
      : useTimerStore.getState().longBreakDuration;

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  const getModeConfig = () => {
    switch (mode) {
      case "focus":
        return {
          title: "Focus Time",
          icon: Brain,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          progressColor: "stroke-indigo-600",
        };
      case "shortBreak":
        return {
          title: "Short Break",
          icon: Coffee,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          progressColor: "stroke-emerald-600",
        };
      case "longBreak":
        return {
          title: "Long Break",
          icon: Coffee,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          progressColor: "stroke-amber-600",
        };
    }
  };

  const config = getModeConfig();
  const Icon = config.icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Mode indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
            <span className={`font-medium ${config.color}`}>{config.title}</span>
          </div>

          {/* Circular progress */}
          <div className="relative w-64 h-64">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-200"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="4"
                className={config.progressColor}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                initial={false}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100),
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {status === "idle" && "Ready to start"}
                {status === "running" && "Stay focused"}
                {status === "paused" && "Paused"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {status === "idle" || status === "paused" ? (
              <Button size="lg" onClick={startTimer} className="min-w-[120px]">
                <Play className="mr-2 h-5 w-5" />
                {status === "paused" ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button size="lg" onClick={pauseTimer} variant="outline" className="min-w-[120px]">
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </Button>
            )}

            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button size="lg" variant="outline" onClick={skipSession}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Session stats */}
          <div className="w-full grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{sessionsCompleted}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{distractionCount}</p>
              <p className="text-xs text-muted-foreground">Distractions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {status === "running" && mode === "focus" ? "10" : "0"}
              </p>
              <p className="text-xs text-muted-foreground">XP to Earn</p>
            </div>
          </div>

          {/* Tips based on mode */}
          <div className={`w-full p-4 rounded-lg ${config.bgColor} text-sm`}>
            {mode === "focus" && (
              <p className="text-center">
                💡 <strong>Tip:</strong> Remove distractions, close unnecessary tabs, and focus on one task at a time.
              </p>
            )}
            {(mode === "shortBreak" || mode === "longBreak") && (
              <p className="text-center">
                💡 <strong>Tip:</strong> Stand up, stretch, hydrate, or take a short walk. Avoid screens if possible.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
