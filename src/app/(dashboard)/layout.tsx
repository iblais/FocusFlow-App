"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Timer, BarChart3, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Tasks", href: "/tasks", icon: Target },
  { name: "Focus", href: "/focus", icon: Timer },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Games", href: "/games", icon: Gamepad2 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-50 border-r">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              FocusFlow
            </h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>

        {/* Bottom navigation - Mobile */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t">
          <div className="flex justify-around py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg min-w-[64px]",
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-600"
                  )}
                >
                  <item.icon className={cn("h-6 w-6 mb-1", isActive && "text-indigo-600")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
