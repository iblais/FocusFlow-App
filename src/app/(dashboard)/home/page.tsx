import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Target, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="p-6 lg:p-8 space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Ready to focus and make progress today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 days</div>
            <p className="text-xs text-muted-foreground">
              Keep it going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Today
            </CardTitle>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground">
              No tasks yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total XP
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 XP</div>
            <p className="text-xs text-muted-foreground">
              Level 1
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Check-in</CardTitle>
          <CardDescription>
            How are you feeling today? Set your intentions for a productive day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            Start Daily Check-in
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="justify-start">
            <Plus className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
          <Button variant="outline" className="justify-start">
            <Zap className="mr-2 h-4 w-4" />
            Start Focus Session
          </Button>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
          <CardDescription>
            Your top priorities for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            No tasks scheduled for today. Add your first task to get started!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
