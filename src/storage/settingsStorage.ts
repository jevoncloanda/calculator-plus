import type { AngleMode } from '../calculator/types';
import { readJson, writeJson } from './localStore';

export type CalculatorMode = 'basic' | 'scientific';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  angleMode: AngleMode;
  mode: CalculatorMode;
  theme: ThemePreference;
  haptics: boolean;
}

const STORAGE_KEY = 'calculator-plus.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  angleMode: 'deg',
  mode: 'basic',
  theme: 'system',
  haptics: true,
};

function isSettings(value: unknown): value is Partial<Settings> {
  return typeof value === 'object' && value !== null;
}

/** Unknown or corrupt fields fall back to defaults rather than breaking boot. */
export function loadSettings(): Settings {
  const stored = readJson(STORAGE_KEY, isSettings);
  if (!stored) return DEFAULT_SETTINGS;
  return {
    angleMode: stored.angleMode === 'rad' ? 'rad' : 'deg',
    mode: stored.mode === 'scientific' ? 'scientific' : 'basic',
    theme: stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : 'system',
    haptics: stored.haptics !== false,
  };
}

export function saveSettings(settings: Settings): void {
  writeJson(STORAGE_KEY, settings);
}
