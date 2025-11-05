// Premium Design System - Neuroscience-Inspired Theme
export const premiumTheme = {
  // Glassmorphism
  glass: {
    light: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/5',
    medium: 'bg-white/50 backdrop-blur-2xl border border-white/30 shadow-2xl shadow-black/10',
    dark: 'bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20',
  },

  // Neumorphism
  neomorph: {
    raised: 'shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]',
    pressed: 'shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]',
    flat: 'shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]',
  },

  // Dynamic Gradients
  gradients: {
    calm: 'bg-gradient-to-br from-blue-400/80 via-purple-400/80 to-pink-400/80',
    energy: 'bg-gradient-to-br from-orange-400/80 via-red-400/80 to-pink-500/80',
    focus: 'bg-gradient-to-br from-indigo-500/80 via-purple-500/80 to-pink-500/80',
    success: 'bg-gradient-to-br from-emerald-400/80 via-teal-400/80 to-cyan-400/80',
    dawn: 'bg-gradient-to-br from-amber-300/80 via-orange-300/80 to-pink-300/80',
    dusk: 'bg-gradient-to-br from-purple-600/80 via-indigo-600/80 to-blue-700/80',
    night: 'bg-gradient-to-br from-slate-800/80 via-purple-900/80 to-indigo-900/80',
  },

  // Animated Mesh Gradients
  meshBackgrounds: {
    morning: 'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%)',
    afternoon: 'radial-gradient(at 40% 20%, hsla(217,100%,70%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(270,100%,70%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(340,100%,76%,0.3) 0px, transparent 50%)',
    evening: 'radial-gradient(at 40% 20%, hsla(240,100%,60%,0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280,100%,60%,0.4) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(320,100%,60%,0.4) 0px, transparent 50%)',
    night: 'radial-gradient(at 40% 20%, hsla(220,60%,20%,0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(260,60%,20%,0.5) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(240,60%,20%,0.5) 0px, transparent 50%)',
  },

  // Spring Animation Configs
  springs: {
    gentle: { tension: 300, friction: 30 },
    bouncy: { tension: 400, friction: 20 },
    smooth: { tension: 200, friction: 40 },
    snappy: { tension: 500, friction: 25 },
  },

  // Particle Colors
  particles: {
    dopamine: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'],
    focus: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'],
    success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    energy: ['#F59E0B', '#FB923C', '#FBBF24', '#FCD34D'],
  },
};

// Time-based theme selector
export const getTimeBasedTheme = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Energy-based color selector
export const getEnergyColor = (level: 'low' | 'medium' | 'high'): string => {
  switch (level) {
    case 'low':
      return 'from-blue-400 to-cyan-300';
    case 'medium':
      return 'from-purple-400 to-pink-400';
    case 'high':
      return 'from-orange-400 to-red-400';
  }
};

// User type themes
export const userTypeThemes = {
  adult: {
    primary: 'from-indigo-600 to-purple-600',
    accent: 'from-blue-500 to-cyan-500',
  },
  student: {
    primary: 'from-emerald-500 to-teal-500',
    accent: 'from-green-400 to-lime-400',
  },
  teen: {
    primary: 'from-pink-500 to-rose-500',
    accent: 'from-orange-400 to-amber-400',
  },
  parent: {
    primary: 'from-violet-600 to-indigo-600',
    accent: 'from-purple-400 to-pink-400',
  },
};
