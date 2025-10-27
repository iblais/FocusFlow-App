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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Mobile App Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-xl font-bold text-white">
            FocusFlow
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <span className="text-sm font-medium text-white">Level 1</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with padding for fixed nav */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom navigation - Always visible (mobile app style) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] rounded-xl transition-all",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-500 active:scale-95"
                )}
              >
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-all",
                    isActive && "scale-110"
                  )}
                />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
