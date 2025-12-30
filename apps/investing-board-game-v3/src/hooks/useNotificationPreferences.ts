import { useCallback, useEffect, useState } from 'react';

const NOTIFICATION_PREFERENCE_KEY = 'board-game-notifications-enabled';

export interface NotificationPreferences {
  enabled: boolean;
  toggleNotifications: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
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

  const updatePreference = useCallback((nextValue: boolean) => {
    setEnabled(nextValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATION_PREFERENCE_KEY, String(nextValue));
      window.dispatchEvent(
        new CustomEvent('notification-preference-changed', { detail: nextValue })
      );
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    updatePreference(!enabled);
  }, [enabled, updatePreference]);

  const setNotificationsEnabled = useCallback(
    (nextValue: boolean) => updatePreference(nextValue),
    [updatePreference]
  );

  useEffect(() => {
    const handlePreferenceChange = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const nextValue = Boolean(event.detail);
      setEnabled(nextValue);
    };

    window.addEventListener('notification-preference-changed', handlePreferenceChange);
    return () => {
      window.removeEventListener('notification-preference-changed', handlePreferenceChange);
    };
  }, []);

  return {
    enabled,
    toggleNotifications,
    setNotificationsEnabled,
  };
}
