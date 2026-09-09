import { useCallback } from 'react';

/**
 * Progressive enhancement only. `navigator.vibrate` exists on Android Chrome
 * and is absent on iOS Safari; the calculator behaves identically either way.
 */
export function useHaptics(enabled: boolean): () => void {
  return useCallback(() => {
    if (!enabled) return;
    // Browsers reject — and log — vibration without a user gesture, so only
    // ask while the page actually holds user activation.
    if (navigator.userActivation && !navigator.userActivation.isActive) return;
    try {
      navigator.vibrate?.(8);
    } catch {
      // Some browsers throw when vibration is blocked by user settings.
    }
  }, [enabled]);
}
