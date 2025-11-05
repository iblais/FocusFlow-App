'use client';

import { useEffect, useState, useCallback } from 'react';

interface TimerState {
  isRunning: boolean;
  timeRemaining: number;
  elapsed: number;
  mode: 'focus' | 'short-break' | 'long-break';
}

export function useServiceWorkerTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    timeRemaining: 0,
    elapsed: 0,
    mode: 'focus',
  });
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true);

      navigator.serviceWorker
        .register('/focus-timer-sw.js')
        .then((reg) => {
          console.log('[SW] Service Worker registered:', reg);
          setRegistration(reg);

          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });

      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
      case 'TIMER_STATE_UPDATE':
        setTimerState(payload);
        break;
      case 'TIMER_COMPLETE':
        handleTimerComplete(payload);
        break;
      case 'START_BREAK':
        // Handle break start from notification
        startTimer(5 * 60, 'short-break');
        break;
      case 'START_FOCUS':
        // Handle focus start from notification
        startTimer(25 * 60, 'focus');
        break;
      default:
        console.log('[SW] Unknown message type:', type);
    }
  };

  const handleTimerComplete = (payload: any) => {
    console.log('[SW] Timer completed:', payload);
    // You can add custom completion logic here
    // e.g., trigger confetti, save to IndexedDB, etc.
  };

  const startTimer = useCallback(
    (duration: number, mode: 'focus' | 'short-break' | 'long-break' = 'focus') => {
      if (!registration) {
        console.error('[SW] Service Worker not registered');
        return;
      }

      if (registration.active) {
        registration.active.postMessage({
          type: 'START_TIMER',
          payload: { duration, mode },
        });
      }
    },
    [registration]
  );

  const pauseTimer = useCallback(() => {
    if (!registration?.active) return;

    registration.active.postMessage({
      type: 'PAUSE_TIMER',
    });
  }, [registration]);

  const stopTimer = useCallback(() => {
    if (!registration?.active) return;

    registration.active.postMessage({
      type: 'STOP_TIMER',
    });
  }, [registration]);

  const syncTimer = useCallback(
    (state: Partial<TimerState>) => {
      if (!registration?.active) return;

      registration.active.postMessage({
        type: 'SYNC_TIMER',
        payload: state,
      });
    },
    [registration]
  );

  const getTimerState = useCallback(async (): Promise<TimerState | null> => {
    if (!registration?.active) return null;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      registration.active?.postMessage(
        {
          type: 'GET_TIMER_STATE',
        },
        [messageChannel.port2]
      );
    });
  }, [registration]);

  return {
    isSupported,
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    syncTimer,
    getTimerState,
  };
}
