import { useState, useEffect } from 'react';

const NOTIFICATION_PREFERENCE_KEY = 'board-game-notifications-enabled';

export interface NotificationPreferences {
  enabled: boolean;
  toggleNotifications: () => void;
}

/**
 * Custom hook to manage notification preferences
 * Stores preference in localStorage for persistence across sessions
 */
export function useNotificationPreferences(): NotificationPreferences {
  // Initialize from localStorage, default to true (enabled)
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(NOTIFICATION_PREFERENCE_KEY);
    return stored === null ? true : stored === 'true';
  });

  // Persist to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATION_PREFERENCE_KEY, String(enabled));
    }
  }, [enabled]);

  const toggleNotifications = () => {
    setEnabled(prev => !prev);
  };

  return {
    enabled,
    toggleNotifications,
  };
}
