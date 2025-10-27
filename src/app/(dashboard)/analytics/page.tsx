import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 pb-20 lg:pb-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your progress and insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Focus Time This Week</CardTitle>
            <CardDescription>Total time spent in focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed</CardTitle>
            <CardDescription>Tasks finished this week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Focus Duration</CardTitle>
            <CardDescription>Avg session length</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Score</CardTitle>
            <CardDescription>Overall productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
