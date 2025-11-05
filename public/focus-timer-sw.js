/**
 * Service Worker for Background Focus Timer
 * Keeps timer running even when tab is in background
 */

const CACHE_NAME = 'focusflow-timer-v1';
const TIMER_STATE_KEY = 'timer-state';

// Timer state
let timerState = {
  isRunning: false,
  startTime: null,
  duration: 0,
  mode: 'focus',
};

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
});

// Message handler
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'START_TIMER':
      startTimer(payload);
      break;
    case 'PAUSE_TIMER':
      pauseTimer();
      break;
    case 'STOP_TIMER':
      stopTimer();
      break;
    case 'GET_TIMER_STATE':
      event.ports[0].postMessage(getTimerState());
      break;
    case 'SYNC_TIMER':
      syncTimer(payload);
      break;
    default:
      console.warn('[Service Worker] Unknown message type:', type);
  }
});

function startTimer(payload) {
  timerState = {
    isRunning: true,
    startTime: Date.now(),
    duration: payload.duration || 25 * 60, // default 25 minutes
    mode: payload.mode || 'focus',
    targetEndTime: Date.now() + (payload.duration || 25 * 60) * 1000,
  };

  console.log('[Service Worker] Timer started:', timerState);

  // Schedule notification for timer completion
  scheduleNotification();

  // Broadcast state to all clients
  broadcastTimerState();
}

function pauseTimer() {
  if (timerState.isRunning) {
    const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
    timerState = {
      ...timerState,
      isRunning: false,
      duration: Math.max(0, timerState.duration - elapsed),
    };

    console.log('[Service Worker] Timer paused:', timerState);
    broadcastTimerState();
  }
}

function stopTimer() {
  timerState = {
    isRunning: false,
    startTime: null,
    duration: 0,
    mode: 'focus',
  };

  console.log('[Service Worker] Timer stopped');
  broadcastTimerState();
}

function syncTimer(payload) {
  timerState = { ...timerState, ...payload };
  broadcastTimerState();
}

function getTimerState() {
  if (timerState.isRunning && timerState.startTime) {
    const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
    const remaining = Math.max(0, timerState.duration - elapsed);

    return {
      ...timerState,
      timeRemaining: remaining,
      elapsed,
    };
  }

  return timerState;
}

function scheduleNotification() {
  if (!timerState.isRunning) return;

  const delay = timerState.duration * 1000;

  setTimeout(() => {
    if (timerState.isRunning) {
      sendNotification();
      broadcastTimerComplete();
    }
  }, delay);
}

function sendNotification() {
  const title = 'Focus Session Complete! 🎉';
  const options = {
    body: `Great work! You completed a ${Math.floor(timerState.duration / 60)}-minute focus session.`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'focus-timer-complete',
    requireInteraction: false,
    actions: [
      { action: 'start-break', title: 'Start Break' },
      { action: 'start-another', title: 'Start Another' },
    ],
  };

  self.registration.showNotification(title, options);
}

function broadcastTimerState() {
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'TIMER_STATE_UPDATE',
        payload: getTimerState(),
      });
    });
  });
}

function broadcastTimerComplete() {
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'TIMER_COMPLETE',
        payload: {
          mode: timerState.mode,
          duration: timerState.duration,
        },
      });
    });
  });
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'start-break') {
    // Start a break session
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'START_BREAK',
          });
        });
      })
    );
  } else if (event.action === 'start-another') {
    // Start another focus session
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'START_FOCUS',
          });
        });
      })
    );
  } else {
    // Default: open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return self.clients.openWindow('/focus');
      })
    );
  }
});

// Periodic sync for background updates (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-focus-sessions') {
    event.waitUntil(syncFocusSessions());
  }
});

async function syncFocusSessions() {
  // This would sync with your backend API
  console.log('[Service Worker] Syncing focus sessions...');
  // Implementation depends on your backend
}

// Keep alive with periodic heartbeat
setInterval(() => {
  if (timerState.isRunning) {
    broadcastTimerState();
  }
}, 5000); // Every 5 seconds
