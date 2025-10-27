import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

export default function FocusPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 pb-20 lg:pb-8">
      <div>
        <h1 className="text-3xl font-bold">Focus Timer</h1>
        <p className="text-muted-foreground">
          Start a focus session to boost your productivity
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Pomodoro Timer</CardTitle>
          <CardDescription>
            25 minutes of focused work, followed by a 5-minute break
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8">
          <div className="text-6xl font-bold text-indigo-600">
            25:00
          </div>
          <div className="flex gap-3">
            <Button size="lg">
              <Timer className="mr-2 h-5 w-5" />
              Start Session
            </Button>
            <Button size="lg" variant="outline">
              Reset
            </Button>
          </div>
          <div className="w-full space-y-2">
            <p className="text-sm text-muted-foreground">Session Stats</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Distractions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
