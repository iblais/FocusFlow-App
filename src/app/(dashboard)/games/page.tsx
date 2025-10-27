import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GamesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 pb-20 lg:pb-8">
      <div>
        <h1 className="text-3xl font-bold">EF Training Games</h1>
        <p className="text-muted-foreground">
          Build your executive function skills through fun games
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Working Memory</CardTitle>
            <CardDescription>
              Improve your short-term memory and recall
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inhibition Control</CardTitle>
            <CardDescription>
              Practice resisting distractions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mental Flexibility</CardTitle>
            <CardDescription>
              Switch between tasks smoothly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
