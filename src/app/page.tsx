export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          FocusFlow
        </h1>
        <p className="text-2xl text-muted-foreground">
          AI-Powered Task Management for ADHD Minds
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Break down complex tasks, stay focused, and build sustainable habits with gamification and neurofeedback.
        </p>
        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            Setting up your FocusFlow environment...
          </p>
        </div>
      </div>
    </main>
  );
}
