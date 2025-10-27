import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, Timer, TrendingUp, Zap, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            FocusFlow
          </h1>
          <p className="text-2xl md:text-3xl text-slate-700 font-medium">
            AI-Powered Task Management for ADHD Minds
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Break down complex tasks, stay focused, and build sustainable habits with AI-powered micro-steps, Pomodoro timer, and gamification.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground pt-2">
            Currently in beta • Built with focus, designed for ADHD minds
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to stay focused
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-indigo-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>AI Task Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Complex tasks automatically split into 5-15 minute micro-steps. No more overwhelm.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Timer className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Pomodoro Timer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Focus sessions with automatic breaks. Tracks distractions and rewards your progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-emerald-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Gamification</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Earn XP, maintain streaks, and unlock achievements. Make productivity rewarding.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-amber-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>Energy-Based Scheduling</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Match tasks to your natural energy patterns throughout the day.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>EF Training Games</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Strengthen working memory, inhibition, and cognitive flexibility.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100">
                  <Target className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>Daily Check-ins</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track mood, energy, and progress. Reflect on wins and challenges.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 border-0 text-white">
          <CardHeader>
            <CardTitle className="text-3xl text-white">
              Ready to transform your productivity?
            </CardTitle>
            <CardDescription className="text-indigo-100 text-lg">
              Join FocusFlow today and start building sustainable focus habits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Your Journey
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          FocusFlow 2.0 • Built with{" "}
          <a href="https://claude.ai" className="text-indigo-600 hover:underline">
            Claude Code
          </a>
        </p>
      </footer>
    </main>
  );
}
