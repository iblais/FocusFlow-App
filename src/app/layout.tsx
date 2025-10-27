import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FocusFlow - ADHD Task Management & Focus Training",
  description: "AI-powered task breakdown and focus training designed for ADHD minds",
  manifest: "/manifest.json",
  themeColor: "#6366F1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FocusFlow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
