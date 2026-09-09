import { useEffect, useState } from 'react';
import type { ThemePreference } from '../storage/settingsStorage';

export type ResolvedTheme = 'light' | 'dark';

/**
 * Resolves the preference against the OS setting and reflects the result on
 * `<html>` (for CSS) and the theme-color meta (for the iOS/Android status bar).
 */
export function useTheme(preference: ThemePreference): ResolvedTheme {
  const [system, setSystem] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const query = globalThis.matchMedia?.('(prefers-color-scheme: light)');
    if (!query) return;
    const sync = () => setSystem(query.matches ? 'light' : 'dark');
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const resolved: ResolvedTheme = preference === 'system' ? system : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', resolved === 'light' ? '#f2f2f7' : '#000000');
  }, [resolved]);

  return resolved;
}
