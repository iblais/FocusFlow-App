'use client';

import { motion } from 'framer-motion';
import { premiumTheme } from '@/lib/design/premium-theme';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'dark';
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  variant = 'light',
  hover = true,
  onClick
}: GlassCardProps) {
  const glassStyle = premiumTheme.glass[variant];

  return (
    <motion.div
      className={cn(
        glassStyle,
        'rounded-2xl p-6 transition-all duration-300',
        hover && 'hover:shadow-3xl hover:scale-[1.02]',
        onClick && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : undefined}
      transition={premiumTheme.springs.gentle}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface GlassCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardHeader({ children, className = '' }: GlassCardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

interface GlassCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardTitle({ children, className = '' }: GlassCardTitleProps) {
  return (
    <h3 className={cn('text-lg font-bold text-slate-900', className)}>
      {children}
    </h3>
  );
}

interface GlassCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardDescription({ children, className = '' }: GlassCardDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-600 mt-1', className)}>
      {children}
    </p>
  );
}

interface GlassCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardContent({ children, className = '' }: GlassCardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
