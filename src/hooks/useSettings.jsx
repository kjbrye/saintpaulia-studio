/**
 * useSettings Hook
 *
 * Provides app settings with localStorage persistence.
 */

import { useState, useEffect, createContext, useContext } from 'react';

const DEFAULT_SETTINGS = {
  wateringThreshold: 7,
  fertilizingThreshold: 14,
  groomingThreshold: 7,
  defaultView: 'grid',
  plantsPerPage: 24,
};

const STORAGE_KEY = 'saintpaulia-settings';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  // Map settings to care thresholds format expected by careStatus utils
  const careThresholds = {
    watering: context.settings.wateringThreshold,
    fertilizing: context.settings.fertilizingThreshold,
    grooming: context.settings.groomingThreshold,
  };

  return { ...context, careThresholds };
}
