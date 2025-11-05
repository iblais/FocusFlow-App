'use client';

import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';
import { premiumTheme } from '@/lib/design/premium-theme';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface NeumorphButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'success' | 'energy';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function NeumorphButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon
}: NeumorphButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const variantStyles = {
    primary: 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white',
    secondary: 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800',
    success: 'bg-gradient-to-br from-emerald-400 to-teal-400 text-white',
    energy: 'bg-gradient-to-br from-orange-400 to-red-400 text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Spring animation for press effect
  const [springs, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: premiumTheme.springs.bouncy,
  }));

  const handleMouseDown = () => {
    if (disabled || loading || isProcessing) return;
    setIsPressed(true);
    api.start({ scale: 0.95, y: 2 });
  };

  const handleMouseUp = async () => {
    if (disabled || loading || isProcessing) return;
    setIsPressed(false);
    api.start({ scale: 1, y: 0 });

    if (onClick) {
      const result = onClick();
      if (result instanceof Promise) {
        setIsProcessing(true);
        try {
          await result;
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const handleMouseLeave = () => {
    if (isPressed) {
      setIsPressed(false);
      api.start({ scale: 1, y: 0 });
    }
  };

  const isDisabled = disabled || loading || isProcessing;
  const showLoading = loading || isProcessing;

  return (
    <animated.button
      style={springs}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
      className={cn(
        'relative rounded-xl font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        !isPressed ? premiumTheme.neomorph.raised : premiumTheme.neomorph.pressed,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'hover:brightness-110',
        className
      )}
    >
      <span className="flex items-center justify-center gap-2">
        {showLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </span>
    </animated.button>
  );
}
