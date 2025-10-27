import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerMode = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused";

interface TimerState {
  // Timer settings
  focusDuration: number; // in seconds
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // after how many focus sessions

  // Current session
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number; // in seconds
  sessionsCompleted: number;

  // Current task
  currentTaskId: string | null;

  // Session stats
  distractionCount: number;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  tick: () => void;
  completeSession: () => void;
  setMode: (mode: TimerMode) => void;
  setCurrentTask: (taskId: string | null) => void;
  addDistraction: () => void;
  updateSettings: (settings: {
    focusDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
    longBreakInterval?: number;
  }) => void;
}

const DEFAULT_FOCUS_DURATION = 25 * 60; // 25 minutes
const DEFAULT_SHORT_BREAK = 5 * 60; // 5 minutes
const DEFAULT_LONG_BREAK = 15 * 60; // 15 minutes
const DEFAULT_LONG_BREAK_INTERVAL = 4; // Every 4 focus sessions

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial settings
      focusDuration: DEFAULT_FOCUS_DURATION,
      shortBreakDuration: DEFAULT_SHORT_BREAK,
      longBreakDuration: DEFAULT_LONG_BREAK,
      longBreakInterval: DEFAULT_LONG_BREAK_INTERVAL,

      // Initial state
      mode: "focus",
      status: "idle",
      timeRemaining: DEFAULT_FOCUS_DURATION,
      sessionsCompleted: 0,
      currentTaskId: null,
      distractionCount: 0,

      startTimer: () => {
        set({ status: "running" });
      },

      pauseTimer: () => {
        set({ status: "paused" });
      },

      resetTimer: () => {
        const state = get();
        const duration =
          state.mode === "focus"
            ? state.focusDuration
            : state.mode === "shortBreak"
            ? state.shortBreakDuration
            : state.longBreakDuration;

        set({
          status: "idle",
          timeRemaining: duration,
          distractionCount: 0,
        });
      },

      skipSession: () => {
        const state = get();
        let newMode: TimerMode = "focus";

        if (state.mode === "focus") {
          // Determine if it's time for a long break
          const nextSessionNumber = state.sessionsCompleted + 1;
          if (nextSessionNumber % state.longBreakInterval === 0) {
            newMode = "longBreak";
          } else {
            newMode = "shortBreak";
          }
        }

        const duration =
          newMode === "focus"
            ? state.focusDuration
            : newMode === "shortBreak"
            ? state.shortBreakDuration
            : state.longBreakDuration;

        set({
          mode: newMode,
          status: "idle",
          timeRemaining: duration,
          distractionCount: 0,
        });
      },

      tick: () => {
        const state = get();

        if (state.status !== "running") return;

        const newTimeRemaining = state.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          get().completeSession();
        } else {
          set({ timeRemaining: newTimeRemaining });
        }
      },

      completeSession: async () => {
        const state = get();

        // If it was a focus session, save to database
        if (state.mode === "focus") {
          const startTime = new Date(Date.now() - state.focusDuration * 1000);
          const xpEarned = 10 + (state.distractionCount === 0 ? 5 : 0); // Bonus XP for no distractions

          try {
            await fetch("/api/focus-sessions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                taskId: state.currentTaskId,
                duration: state.focusDuration,
                distractionCount: state.distractionCount,
                completed: true,
                xpEarned,
              }),
            });
          } catch (error) {
            console.error("Failed to save focus session:", error);
          }

          set({ sessionsCompleted: state.sessionsCompleted + 1 });
        }

        // Determine next mode
        let nextMode: TimerMode = "focus";

        if (state.mode === "focus") {
          // Determine if it's time for a long break
          if (state.sessionsCompleted % state.longBreakInterval === 0) {
            nextMode = "longBreak";
          } else {
            nextMode = "shortBreak";
          }
        }

        const duration =
          nextMode === "focus"
            ? state.focusDuration
            : nextMode === "shortBreak"
            ? state.shortBreakDuration
            : state.longBreakDuration;

        set({
          mode: nextMode,
          status: "idle",
          timeRemaining: duration,
          distractionCount: 0,
        });
      },

      setMode: (mode: TimerMode) => {
        const state = get();
        const duration =
          mode === "focus"
            ? state.focusDuration
            : mode === "shortBreak"
            ? state.shortBreakDuration
            : state.longBreakDuration;

        set({
          mode,
          status: "idle",
          timeRemaining: duration,
          distractionCount: 0,
        });
      },

      setCurrentTask: (taskId: string | null) => {
        set({ currentTaskId: taskId });
      },

      addDistraction: () => {
        set((state) => ({
          distractionCount: state.distractionCount + 1,
        }));
      },

      updateSettings: (settings) => {
        const state = get();
        const newState: Partial<TimerState> = { ...settings };

        // If we're updating the duration for the current mode, update timeRemaining
        if (state.status === "idle") {
          if (settings.focusDuration && state.mode === "focus") {
            newState.timeRemaining = settings.focusDuration;
          } else if (settings.shortBreakDuration && state.mode === "shortBreak") {
            newState.timeRemaining = settings.shortBreakDuration;
          } else if (settings.longBreakDuration && state.mode === "longBreak") {
            newState.timeRemaining = settings.longBreakDuration;
          }
        }

        set(newState);
      },
    }),
    {
      name: "focusflow-timer",
      partialize: (state) => ({
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        longBreakInterval: state.longBreakInterval,
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);
