/**
 * Thin, failure-tolerant wrapper over `localStorage`.
 *
 * Storage can be unavailable (Safari private browsing, disabled cookies) or
 * full. Persistence is a convenience here, never a correctness requirement, so
 * every operation degrades to a no-op instead of throwing.
 */

function storage(): Storage | null {
  try {
    const candidate = globalThis.localStorage;
    // Touch it: some browsers expose the object but throw on access.
    const probe = '__calcplus__';
    candidate.setItem(probe, probe);
    candidate.removeItem(probe);
    return candidate;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = storage()?.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — the app keeps working in memory.
  }
}
