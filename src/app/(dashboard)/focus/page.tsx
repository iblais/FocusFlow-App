import { PomodoroTimer } from "@/components/focus/pomodoro-timer";

export default function FocusPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 pb-20 lg:pb-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Focus Timer</h1>
        <p className="text-muted-foreground mt-2">
          Use the Pomodoro technique to boost your productivity and maintain focus
        </p>
      </div>

      <PomodoroTimer />

      {/* Quick Tips */}
      <div className="max-w-2xl mx-auto space-y-4 pt-4">
        <h2 className="text-lg font-semibold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
            <p className="font-medium text-indigo-900 mb-1">1. Focus (25 min)</p>
            <p className="text-sm text-indigo-700">
              Work on a single task with full concentration
            </p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="font-medium text-emerald-900 mb-1">2. Short Break (5 min)</p>
            <p className="text-sm text-emerald-700">
              Stretch, hydrate, or take a quick walk
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
            <p className="font-medium text-amber-900 mb-1">3. Long Break (15 min)</p>
            <p className="text-sm text-amber-700">
              After 4 sessions, take a longer rest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
