'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Cloud, CloudRain, Trees, Wind, Volume2, VolumeX, Music } from 'lucide-react';
import { GlassCard } from '@/components/design/GlassCard';
import { cn } from '@/lib/utils';

type SoundType = 'rain' | 'forest' | 'whitenoise' | 'binaural' | 'none';

interface Sound {
  id: SoundType;
  name: string;
  icon: React.ReactNode;
  frequency?: number; // For binaural beats
  description: string;
}

const sounds: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: <CloudRain className="h-5 w-5" />,
    description: 'Gentle rainfall',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: <Trees className="h-5 w-5" />,
    description: 'Nature sounds',
  },
  {
    id: 'whitenoise',
    name: 'White Noise',
    icon: <Wind className="h-5 w-5" />,
    description: 'Steady background',
  },
  {
    id: 'binaural',
    name: 'Binaural',
    icon: <Music className="h-5 w-5" />,
    frequency: 10, // Alpha waves for focus
    description: '10Hz focus beats',
  },
];

interface AmbientSoundscapeProps {
  isActive?: boolean;
}

export function AmbientSoundscape({ isActive = true }: AmbientSoundscapeProps) {
  const [selectedSound, setSelectedSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorGain | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  type OscillatorGain = {
    oscillator: OscillatorNode;
    gainNode: GainNode;
  };

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      stopAllSounds();
      audioContextRef.current?.close();
    };
  }, []);

  const stopAllSounds = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.oscillator.stop();
        oscillatorRef.current.gainNode.disconnect();
      } catch (e) {
        // Already stopped
      }
      oscillatorRef.current = null;
    }

    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch (e) {
        // Already stopped
      }
      noiseNodeRef.current = null;
    }
  };

  const generateWhiteNoise = (audioContext: AudioContext): AudioBufferSourceNode => {
    const bufferSize = 2 * audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    return whiteNoise;
  };

  const generateBinauralBeats = (
    audioContext: AudioContext,
    frequency: number
  ): OscillatorGain => {
    const baseFrequency = 200;

    const leftOscillator = audioContext.createOscillator();
    const rightOscillator = audioContext.createOscillator();
    const merger = audioContext.createChannelMerger(2);
    const gainNode = audioContext.createGain();

    leftOscillator.frequency.value = baseFrequency;
    rightOscillator.frequency.value = baseFrequency + frequency;

    leftOscillator.connect(merger, 0, 0);
    rightOscillator.connect(merger, 0, 1);
    merger.connect(gainNode);

    leftOscillator.start();
    rightOscillator.start();

    return { oscillator: leftOscillator, gainNode };
  };

  useEffect(() => {
    if (!isActive || selectedSound === 'none' || !audioContextRef.current) {
      stopAllSounds();
      return;
    }

    stopAllSounds();

    const audioContext = audioContextRef.current;
    const masterGain = audioContext.createGain();
    masterGain.gain.value = isMuted ? 0 : volume;
    masterGain.connect(audioContext.destination);
    gainNodeRef.current = masterGain;

    if (selectedSound === 'binaural') {
      const sound = sounds.find((s) => s.id === 'binaural');
      if (sound?.frequency) {
        oscillatorRef.current = generateBinauralBeats(audioContext, sound.frequency);
        oscillatorRef.current.gainNode.connect(masterGain);
      }
    } else if (selectedSound === 'whitenoise') {
      const whiteNoise = generateWhiteNoise(audioContext);
      whiteNoise.connect(masterGain);
      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    }
    // For 'rain' and 'forest', we'd normally load actual audio files
    // For now, using white noise as placeholder

    return () => {
      stopAllSounds();
    };
  }, [selectedSound, isActive, volume, isMuted]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  return (
    <GlassCard variant="medium" className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Ambient Sounds
          </h3>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-slate-600" />
            ) : (
              <Volume2 className="h-4 w-4 text-indigo-600" />
            )}
          </button>
        </div>

        {/* Sound Selection */}
        <div className="grid grid-cols-2 gap-2">
          {sounds.map((sound) => (
            <motion.button
              key={sound.id}
              onClick={() =>
                setSelectedSound(selectedSound === sound.id ? 'none' : sound.id)
              }
              className={cn(
                'p-3 rounded-xl flex flex-col items-center gap-2 transition-all',
                selectedSound === sound.id
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/50 text-slate-700 hover:bg-white/70'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sound.icon}
              <span className="text-xs font-medium">{sound.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Volume Control */}
        {selectedSound !== 'none' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <label className="text-xs text-slate-600">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${
                  volume * 100
                }%, rgb(226, 232, 240) ${volume * 100}%, rgb(226, 232, 240) 100%)`,
              }}
            />
            <p className="text-xs text-slate-500 text-center">
              {sounds.find((s) => s.id === selectedSound)?.description}
            </p>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
