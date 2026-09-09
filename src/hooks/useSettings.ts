import { useCallback, useState } from 'react';
import { loadSettings, saveSettings, type Settings } from '../storage/settingsStorage';

export interface UseSettings {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

export function useSettings(): UseSettings {
  // Read once, lazily: `loadSettings` already falls back to defaults if the
  // browser blocks storage.
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      saveSettings(next);
      setSettings(next);
    },
    [settings],
  );

  return { settings, update };
}
