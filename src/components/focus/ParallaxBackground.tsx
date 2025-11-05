'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getTimeBasedTheme } from '@/lib/design/premium-theme';

type TimeTheme = 'morning' | 'afternoon' | 'evening' | 'night';

interface Layer {
  id: string;
  speed: number;
  opacity: number;
  blur: number;
}

export function ParallaxBackground() {
  const [timeTheme, setTimeTheme] = useState<TimeTheme>('afternoon');
  const { scrollY } = useScroll();

  useEffect(() => {
    setTimeTheme(getTimeBasedTheme());

    const interval = setInterval(() => {
      setTimeTheme(getTimeBasedTheme());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const layers: Layer[] = [
    { id: 'layer-1', speed: 0.1, opacity: 0.3, blur: 0 },
    { id: 'layer-2', speed: 0.3, opacity: 0.4, blur: 1 },
    { id: 'layer-3', speed: 0.5, opacity: 0.5, blur: 2 },
  ];

  const getThemeGradients = () => {
    switch (timeTheme) {
      case 'morning':
        return {
          sky: 'from-orange-200 via-pink-200 to-blue-300',
          mountain1: 'from-purple-400/40 to-indigo-400/40',
          mountain2: 'from-indigo-300/30 to-blue-300/30',
          mountain3: 'from-blue-200/20 to-cyan-200/20',
        };
      case 'afternoon':
        return {
          sky: 'from-blue-300 via-cyan-200 to-blue-400',
          mountain1: 'from-blue-500/40 to-indigo-500/40',
          mountain2: 'from-indigo-400/30 to-purple-400/30',
          mountain3: 'from-purple-300/20 to-pink-300/20',
        };
      case 'evening':
        return {
          sky: 'from-orange-400 via-red-300 to-purple-400',
          mountain1: 'from-purple-600/40 to-pink-600/40',
          mountain2: 'from-pink-500/30 to-orange-500/30',
          mountain3: 'from-orange-400/20 to-yellow-400/20',
        };
      case 'night':
        return {
          sky: 'from-indigo-900 via-purple-900 to-slate-900',
          mountain1: 'from-indigo-800/40 to-purple-800/40',
          mountain2: 'from-purple-700/30 to-slate-700/30',
          mountain3: 'from-slate-600/20 to-indigo-600/20',
        };
    }
  };

  const gradients = getThemeGradients();

  // Pre-create parallax transforms (must be outside map)
  const layer1Y = useTransform(scrollY, [0, 1000], [0, layers[0].speed * 500]);
  const layer2Y = useTransform(scrollY, [0, 1000], [0, layers[1].speed * 500]);
  const layer3Y = useTransform(scrollY, [0, 1000], [0, layers[2].speed * 500]);
  const layerTransforms = [layer1Y, layer2Y, layer3Y];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Sky background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${gradients.sky}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Stars (night only) */}
      {timeTheme === 'night' && (
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Sun/Moon */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          right: '10%',
          top: timeTheme === 'morning' ? '15%' : timeTheme === 'afternoon' ? '10%' : '20%',
          background:
            timeTheme === 'night'
              ? 'radial-gradient(circle, rgba(226, 232, 240, 1) 0%, rgba(203, 213, 225, 0.8) 100%)'
              : 'radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(251, 146, 60, 0.8) 100%)',
          boxShadow:
            timeTheme === 'night'
              ? '0 0 60px rgba(226, 232, 240, 0.6)'
              : '0 0 80px rgba(251, 191, 36, 0.6)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Clouds (day only) */}
      {timeTheme !== 'night' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute bg-white/20 rounded-full blur-xl"
              style={{
                width: 150 + i * 50,
                height: 60 + i * 20,
                left: `${20 + i * 25}%`,
                top: `${15 + i * 10}%`,
              }}
              animate={{
                x: [-50, 50, -50],
              }}
              transition={{
                duration: 20 + i * 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </>
      )}

      {/* Mountain layers with parallax */}
      {layers.map((layer, index) => (
          <motion.div
            key={layer.id}
            className="absolute bottom-0 left-0 right-0"
            style={{ y: layerTransforms[index] }}
          >
            <svg
              viewBox="0 0 1200 400"
              className="w-full"
              style={{
                opacity: layer.opacity,
                filter: `blur(${layer.blur}px)`,
              }}
            >
              <defs>
                <linearGradient id={`mountain-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor={
                      index === 0
                        ? gradients.mountain1.split(' ')[0].replace('from-', '')
                        : index === 1
                        ? gradients.mountain2.split(' ')[0].replace('from-', '')
                        : gradients.mountain3.split(' ')[0].replace('from-', '')
                    }
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      index === 0
                        ? gradients.mountain1.split(' ')[1].replace('to-', '')
                        : index === 1
                        ? gradients.mountain2.split(' ')[1].replace('to-', '')
                        : gradients.mountain3.split(' ')[1].replace('to-', '')
                    }
                    stopOpacity="0.3"
                  />
                </linearGradient>
              </defs>

              {/* Mountain path */}
              <motion.path
                d={
                  index === 0
                    ? 'M0,400 L0,200 Q300,100 600,150 T1200,100 L1200,400 Z'
                    : index === 1
                    ? 'M0,400 L0,250 Q300,180 600,200 T1200,180 L1200,400 Z'
                    : 'M0,400 L0,300 Q300,250 600,270 T1200,250 L1200,400 Z'
                }
                fill={`url(#mountain-gradient-${index})`}
                animate={{
                  d:
                    index === 0
                      ? [
                          'M0,400 L0,200 Q300,100 600,150 T1200,100 L1200,400 Z',
                          'M0,400 L0,195 Q300,105 600,145 T1200,105 L1200,400 Z',
                          'M0,400 L0,200 Q300,100 600,150 T1200,100 L1200,400 Z',
                        ]
                      : undefined,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </svg>
          </motion.div>
      ))}

      {/* Foreground trees/vegetation silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/20 to-transparent" />
    </div>
  );
}
