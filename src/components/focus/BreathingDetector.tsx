'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Activity } from 'lucide-react';
import { GlassCard } from '@/components/design/GlassCard';

interface BreathingDetectorProps {
  onBreathDetected?: (intensity: number) => void;
  isActive: boolean;
}

export function BreathingDetector({ onBreathDetected, isActive }: BreathingDetectorProps) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [breathIntensity, setBreathIntensity] = useState(0);
  const [breathRate, setBreathRate] = useState(0); // breaths per minute
  const [stressLevel, setStressLevel] = useState<'low' | 'medium' | 'high'>('low');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const breathTimestampsRef = useRef<number[]>([]);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicActive(true);
      analyzeBreathing();
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access for breathing detection.');
    }
  };

  const stopMicrophone = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsMicActive(false);
    setBreathIntensity(0);
  };

  const analyzeBreathing = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!analyserRef.current || !isMicActive) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average amplitude (breathing intensity)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedIntensity = Math.min(average / 128, 1); // Normalize to 0-1

      setBreathIntensity(normalizedIntensity);

      // Detect breath (threshold-based)
      if (normalizedIntensity > 0.3) {
        const now = Date.now();
        breathTimestampsRef.current.push(now);

        // Keep only last minute of timestamps
        breathTimestampsRef.current = breathTimestampsRef.current.filter(
          (timestamp) => now - timestamp < 60000
        );

        // Calculate breaths per minute
        const bpm = breathTimestampsRef.current.length;
        setBreathRate(bpm);

        // Determine stress level based on breathing rate
        // Normal: 12-20 breaths/min, Stressed: >20 breaths/min
        if (bpm > 20) {
          setStressLevel('high');
        } else if (bpm > 16) {
          setStressLevel('medium');
        } else {
          setStressLevel('low');
        }

        onBreathDetected?.(normalizedIntensity);
      }

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  useEffect(() => {
    if (isActive && isMicActive) {
      analyzeBreathing();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isMicActive]);

  const getStressColor = () => {
    switch (stressLevel) {
      case 'low':
        return 'from-emerald-400 to-teal-500';
      case 'medium':
        return 'from-amber-400 to-orange-500';
      case 'high':
        return 'from-red-400 to-pink-500';
    }
  };

  const getStressLabel = () => {
    switch (stressLevel) {
      case 'low':
        return 'Calm & Relaxed';
      case 'medium':
        return 'Moderately Alert';
      case 'high':
        return 'High Arousal';
    }
  };

  return (
    <GlassCard variant="medium" className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Breathing Detection
          </h3>
          <button
            onClick={isMicActive ? stopMicrophone : startMicrophone}
            className={`p-2 rounded-lg transition-colors ${
              isMicActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {isMicActive ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Breathing Visualization */}
        {isMicActive && (
          <motion.div className="space-y-3">
            {/* Breathing Intensity Circle */}
            <div className="flex items-center justify-center">
              <motion.div
                className={`rounded-full bg-gradient-to-br ${getStressColor()}`}
                animate={{
                  scale: 1 + breathIntensity * 0.5,
                  opacity: 0.7 + breathIntensity * 0.3,
                }}
                transition={{ duration: 0.1 }}
                style={{
                  width: 100,
                  height: 100,
                  boxShadow: `0 0 ${breathIntensity * 40}px rgba(99, 102, 241, ${
                    breathIntensity * 0.6
                  })`,
                }}
              />
            </div>

            {/* Stress Level Indicator */}
            <div className="text-center">
              <motion.div
                className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getStressColor()} text-white font-semibold text-sm`}
                key={stressLevel}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {getStressLabel()}
              </motion.div>
            </div>

            {/* Breathing Rate */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-slate-600">Breath Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{breathRate}</p>
                <p className="text-xs text-slate-500">per min</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-slate-600">Intensity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(breathIntensity * 100)}%
                </p>
                <p className="text-xs text-slate-500">current</p>
              </div>
            </div>

            {/* Waveform Visualization */}
            <div className="h-16 bg-slate-900/80 rounded-lg relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-purple-500"
                style={{
                  height: `${breathIntensity * 100}%`,
                }}
                transition={{ duration: 0.1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-xs font-mono">
                  {isMicActive ? 'Listening...' : 'Mic Off'}
                </p>
              </div>
            </div>

            {/* Guidance */}
            <div className="text-xs text-slate-600 text-center space-y-1">
              <p>💡 Breathe normally near your microphone</p>
              <p className="text-emerald-600 font-medium">
                Optimal: 12-16 breaths/min for deep focus
              </p>
            </div>
          </motion.div>
        )}

        {/* Microphone Permission Info */}
        {!isMicActive && (
          <div className="text-center py-6 space-y-3">
            <Mic className="h-12 w-12 mx-auto text-slate-400" />
            <p className="text-sm text-slate-600">
              Enable microphone to detect your breathing patterns and measure stress levels in
              real-time.
            </p>
            <p className="text-xs text-slate-500">Your audio is never recorded or stored.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
