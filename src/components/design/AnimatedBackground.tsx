'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { premiumTheme, getTimeBasedTheme } from '@/lib/design/premium-theme';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBackground({ children, className = '' }: AnimatedBackgroundProps) {
  const [timeTheme, setTimeTheme] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');

  useEffect(() => {
    // Set initial theme
    setTimeTheme(getTimeBasedTheme());

    // Update theme every minute
    const interval = setInterval(() => {
      setTimeTheme(getTimeBasedTheme());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Animated Gradient Mesh Background */}
      <motion.div
        className="fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Base gradient layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: premiumTheme.meshBackgrounds[timeTheme],
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 1, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Secondary animated gradient layer */}
        <motion.div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(circle at 60% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tertiary animated gradient layer */}
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 20% 60%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5" />
      </motion.div>

      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}
