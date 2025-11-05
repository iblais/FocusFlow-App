'use client';

import { useSpring, animated } from '@react-spring/web';
import { useEffect } from 'react';
import { premiumTheme } from '@/lib/design/premium-theme';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  formatValue?: (value: number) => string;
  springConfig?: 'gentle' | 'bouncy' | 'smooth' | 'snappy';
}

export function AnimatedNumber({
  value,
  className = '',
  formatValue = (val) => Math.floor(val).toString(),
  springConfig = 'smooth'
}: AnimatedNumberProps) {
  const [{ number }, api] = useSpring(() => ({
    number: 0,
    config: premiumTheme.springs[springConfig],
  }));

  useEffect(() => {
    api.start({ number: value });
  }, [value, api]);

  return (
    <animated.span className={className}>
      {number.to((n) => formatValue(n))}
    </animated.span>
  );
}

interface AnimatedStatProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  gradient?: string;
  className?: string;
}

export function AnimatedStat({
  value,
  label,
  suffix = '',
  prefix = '',
  icon,
  gradient = 'from-indigo-500 to-purple-500',
  className = ''
}: AnimatedStatProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
            {icon}
          </div>
        )}
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {prefix}
        <AnimatedNumber value={value} springConfig="bouncy" />
        {suffix}
      </div>
    </div>
  );
}
