'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, X, CheckCircle, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/design/GlassCard';
import { NeumorphButton } from '@/components/design/NeumorphButton';

interface DistractionShieldProps {
  isActive: boolean;
  onEmergencyExit?: (reason: string) => void;
}

interface BlockedSite {
  domain: string;
  attempts: number;
  lastAttempt: number;
}

export function DistractionShield({ isActive, onEmergencyExit }: DistractionShieldProps) {
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [distractingDomains, setDistractingDomains] = useState<string[]>([
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'youtube.com',
    'reddit.com',
    'tiktok.com',
    'netflix.com',
  ]);

  // Notification management
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsShieldActive(true);
      pauseNotifications();
    } else {
      setIsShieldActive(false);
      resumeNotifications();
    }
  }, [isActive]);

  const pauseNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Note: Actual notification blocking requires browser extension
      // This is a UI indicator
      setNotificationsBlocked(true);
      console.log('[Distraction Shield] Notifications paused');
    }
  };

  const resumeNotifications = () => {
    setNotificationsBlocked(false);
    console.log('[Distraction Shield] Notifications resumed');
  };

  const handleEmergencyExit = () => {
    if (emergencyReason.trim()) {
      onEmergencyExit?.(emergencyReason);
      setShowEmergencyDialog(false);
      setEmergencyReason('');
      setIsShieldActive(false);
    }
  };

  const addBlockedSite = (domain: string) => {
    setBlockedSites((prev) => {
      const existing = prev.find((site) => site.domain === domain);
      if (existing) {
        return prev.map((site) =>
          site.domain === domain
            ? { ...site, attempts: site.attempts + 1, lastAttempt: Date.now() }
            : site
        );
      }
      return [...prev, { domain, attempts: 1, lastAttempt: Date.now() }];
    });
  };

  const removeFromDistractingList = (domain: string) => {
    setDistractingDomains((prev) => prev.filter((d) => d !== domain));
  };

  const addToDistractingList = (domain: string) => {
    if (domain.trim() && !distractingDomains.includes(domain.trim())) {
      setDistractingDomains((prev) => [...prev, domain.trim()]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Shield Status */}
      <GlassCard variant="medium" className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Shield
                className={`h-5 w-5 ${isShieldActive ? 'text-emerald-500' : 'text-slate-400'}`}
              />
              Distraction Shield
            </h3>
            <motion.div
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isShieldActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
              animate={{
                scale: isShieldActive ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: isShieldActive ? Infinity : 0,
              }}
            >
              {isShieldActive ? 'ACTIVE' : 'INACTIVE'}
            </motion.div>
          </div>

          {/* Shield Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle
                className={`h-4 w-4 ${
                  notificationsBlocked ? 'text-emerald-500' : 'text-slate-400'
                }`}
              />
              <span className="text-slate-700">Notifications Paused</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle
                className={`h-4 w-4 ${isShieldActive ? 'text-emerald-500' : 'text-slate-400'}`}
              />
              <span className="text-slate-700">Distracting Sites Blocked</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle
                className={`h-4 w-4 ${isShieldActive ? 'text-emerald-500' : 'text-slate-400'}`}
              />
              <span className="text-slate-700">Focus Mode Enabled</span>
            </div>
          </div>

          {/* Blocked Sites List */}
          {isShieldActive && blockedSites.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-600 mb-2">Blocked Attempts:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {blockedSites.map((site) => (
                  <div
                    key={site.domain}
                    className="flex items-center justify-between text-xs bg-red-50 px-2 py-1 rounded"
                  >
                    <span className="text-red-700 font-medium">{site.domain}</span>
                    <span className="text-red-600">{site.attempts} attempts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Distracting Sites Management */}
      <GlassCard variant="light" className="p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Blocked Websites
        </h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add domain (e.g., twitter.com)"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToDistractingList((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {distractingDomains.map((domain) => (
              <div
                key={domain}
                className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs"
              >
                <span>{domain}</span>
                <button
                  onClick={() => removeFromDistractingList(domain)}
                  className="hover:bg-red-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Note: Website blocking requires a browser extension. This list serves as a
            reference.
          </p>
        </div>
      </GlassCard>

      {/* Emergency Exit Button */}
      {isShieldActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <GlassCard variant="dark" className="p-4 border-2 border-orange-400">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">Emergency Exit</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Need to leave urgently? Exit your focus session and log the reason.
                </p>
                <NeumorphButton
                  variant="energy"
                  size="sm"
                  onClick={() => setShowEmergencyDialog(true)}
                  className="w-full"
                >
                  Request Emergency Exit
                </NeumorphButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Emergency Exit Dialog */}
      <AnimatePresence>
        {showEmergencyDialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowEmergencyDialog(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Emergency Exit</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Please briefly describe why you need to exit:
                  </p>
                </div>
              </div>

              <textarea
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                placeholder="e.g., urgent phone call, family matter, technical issue..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
                autoFocus
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowEmergencyDialog(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyExit}
                  disabled={!emergencyReason.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Exit Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
