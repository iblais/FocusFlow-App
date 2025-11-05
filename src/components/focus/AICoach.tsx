'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Volume2, VolumeX } from 'lucide-react';

interface AICoachProps {
  sessionDuration: number; // in seconds
  isActive: boolean;
  consecutiveSessions: number;
  onMotivate?: () => void;
}

interface CoachMessage {
  text: string;
  timing: number; // when to show (in seconds)
  type: 'motivation' | 'milestone' | 'warning' | 'celebration';
}

export function AICoach({
  sessionDuration,
  isActive,
  consecutiveSessions,
  onMotivate,
}: AICoachProps) {
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<CoachMessage['type']>('motivation');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const lastMessageTimeRef = useRef<number>(0);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const getMotivationalMessages = (): CoachMessage[] => {
    const baseMessages: CoachMessage[] = [
      {
        text: "Let's begin! Take a deep breath and focus on what matters.",
        timing: 0,
        type: 'motivation',
      },
      {
        text: "You're doing great! Keep your focus steady.",
        timing: 300, // 5 min
        type: 'motivation',
      },
      {
        text: 'Halfway there! Your focus is building momentum.',
        timing: 750, // 12.5 min
        type: 'milestone',
      },
      {
        text: 'Almost done! Push through to the finish line.',
        timing: 1200, // 20 min
        type: 'motivation',
      },
      {
        text: 'Excellent work! Your brain is in peak focus mode.',
        timing: 1500, // 25 min
        type: 'celebration',
      },
    ];

    // Add combo-specific messages
    if (consecutiveSessions >= 3) {
      baseMessages.push({
        text: `Amazing! You're on a ${consecutiveSessions} session streak!`,
        timing: 60,
        type: 'celebration',
      });
    }

    if (consecutiveSessions >= 5) {
      baseMessages.push({
        text: 'You are a focus master! Keep this incredible streak going!',
        timing: 120,
        type: 'celebration',
      });
    }

    return baseMessages;
  };

  const speak = (text: string) => {
    if (!isVoiceEnabled || !speechSynthesisRef.current) return;

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for calming effect
    utterance.pitch = 1.0;
    utterance.volume = 0.7;

    // Try to use a pleasant voice
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes('Google') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Daniel')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current.speak(utterance);
  };

  const showMessage = (message: CoachMessage) => {
    setCurrentMessage(message.text);
    setMessageType(message.type);
    speak(message.text);
    onMotivate?.();

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setCurrentMessage('');
    }, 5000);
  };

  useEffect(() => {
    if (!isActive) {
      setCurrentMessage('');
      return;
    }

    const messages = getMotivationalMessages();
    const currentTime = sessionDuration;

    // Find the next message to show
    const nextMessage = messages.find(
      (msg) => msg.timing <= currentTime && msg.timing > lastMessageTimeRef.current
    );

    if (nextMessage) {
      showMessage(nextMessage);
      lastMessageTimeRef.current = currentTime;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDuration, isActive, consecutiveSessions]);

  // Reset on session start
  useEffect(() => {
    if (isActive && sessionDuration === 0) {
      lastMessageTimeRef.current = 0;
    }
  }, [isActive, sessionDuration]);

  const getMessageStyle = () => {
    switch (messageType) {
      case 'motivation':
        return 'from-indigo-500 to-purple-500';
      case 'milestone':
        return 'from-blue-500 to-cyan-500';
      case 'warning':
        return 'from-orange-500 to-red-500';
      case 'celebration':
        return 'from-emerald-500 to-teal-500';
    }
  };

  return (
    <div className="relative">
      {/* Voice Toggle */}
      <button
        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
        className="absolute top-0 right-0 p-2 rounded-lg hover:bg-white/50 transition-colors z-10"
        title={isVoiceEnabled ? 'Mute coach' : 'Unmute coach'}
      >
        {isVoiceEnabled ? (
          <Volume2 className="h-4 w-4 text-indigo-600" />
        ) : (
          <VolumeX className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* Coach Message Display */}
      <AnimatePresence>
        {currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative"
          >
            <div
              className={`bg-gradient-to-r ${getMessageStyle()} rounded-2xl p-4 text-white shadow-2xl`}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  <MessageCircle className="h-6 w-6 flex-shrink-0" />
                </motion.div>

                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">{currentMessage}</p>
                </div>
              </div>

              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(90deg, transparent, white, transparent)`,
                  opacity: 0.2,
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>

            {/* Speech bubble pointer */}
            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-r ${getMessageStyle()} rotate-45`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
