import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { scheduleReminders } from './notifications';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from './settings';

type Ctx = {
  settings: Settings;
  loaded: boolean;
  update: (patch: Partial<Settings>) => Promise<void>;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const current = useRef(settings);

  useEffect(() => {
    loadSettings().then((s) => {
      current.current = s;
      setSettings(s);
      setLoaded(true);
      // Roll the reminder window forward each launch.
      scheduleReminders(s).catch(() => {});
    });
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const next = { ...current.current, ...patch };
    current.current = next;
    setSettings(next);
    await saveSettings(next);
    await scheduleReminders(next).catch(() => {});
  }, []);

  return <SettingsContext.Provider value={{ settings, loaded, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
