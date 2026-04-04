/**
 * useSettings Hook
 *
 * Provides app settings with Supabase persistence and localStorage cache.
 */

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import * as settingsService from '../services/settings';

const DEFAULT_SETTINGS = {
  wateringThreshold: 7,
  fertilizingThreshold: 14,
  groomingThreshold: 7,
  defaultView: 'grid',
  plantsPerPage: 24,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
};

const STORAGE_KEY = 'saintpaulia-settings';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage for instant display
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // fall through to defaults
      }
    }
    return DEFAULT_SETTINGS;
  });

  const saveTimeout = useRef(null);

  // Sync accessibility attributes to <html> so CSS can target them
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-high-contrast', settings.highContrast ? 'true' : 'false');
    root.setAttribute('data-reduced-motion', settings.reducedMotion ? 'true' : 'false');
    root.setAttribute('data-large-text', settings.largeText ? 'true' : 'false');
  }, [settings.highContrast, settings.reducedMotion, settings.largeText]);

  // Sync from Supabase on mount (overrides localStorage if remote exists)
  useEffect(() => {
    settingsService
      .getSettings()
      .then((remote) => {
        if (remote) {
          const merged = { ...DEFAULT_SETTINGS, ...remote };
          setSettings(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
      })
      .catch(() => {
        // Supabase unavailable — localStorage values are fine
      });
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // Update localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // Debounce Supabase save
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        settingsService.saveSettings(next).catch((err) => {
          // Sentry captures this automatically
        });
      }, 500);
      return next;
    });
  }, []);

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
