import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEntry, loadHistory, saveHistory } from './historyStorage';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './settingsStorage';

/** Minimal stand-in for the browser API; the tests run in a node environment. */
class MemoryStorage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
}

function useMemoryStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  vi.stubGlobal('localStorage', storage);
  return storage;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('history persistence', () => {
  it('round-trips entries across reloads', () => {
    useMemoryStorage();
    const entries = [
      createEntry('12+35×8', '292', 292),
      createEntry('125×48', '6,000', 6000),
    ];
    saveHistory(entries);

    // A fresh read is what happens after a reload or a PWA restart.
    const reloaded = loadHistory();
    expect(reloaded).toHaveLength(2);
    expect(reloaded[0]).toMatchObject({ expression: '12+35×8', result: '292', value: 292 });
    expect(typeof reloaded[0]?.timestamp).toBe('number');
  });

  it('caps stored entries so storage cannot grow without bound', () => {
    useMemoryStorage();
    saveHistory(Array.from({ length: 500 }, (_, i) => createEntry(`${i}+1`, `${i + 1}`, i + 1)));
    expect(loadHistory()).toHaveLength(200);
  });

  it('gives each entry a distinct id', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createEntry('1+1', '2', 2).id));
    expect(ids.size).toBe(200);
  });

  it('starts empty and ignores corrupt data', () => {
    const storage = useMemoryStorage();
    expect(loadHistory()).toEqual([]);

    storage.setItem('calculator-plus.history.v1', '{ not json');
    expect(loadHistory()).toEqual([]);

    storage.setItem('calculator-plus.history.v1', '[{"expression":"1+1"}]');
    expect(loadHistory()).toEqual([]);
  });

  it('degrades to a no-op when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    });
    expect(() => saveHistory([createEntry('1+1', '2', 2)])).not.toThrow();
    expect(loadHistory()).toEqual([]);
  });
});

describe('settings persistence', () => {
  it('round-trips preferences', () => {
    useMemoryStorage();
    saveSettings({ angleMode: 'rad', mode: 'scientific', theme: 'light', haptics: false });
    expect(loadSettings()).toEqual({
      angleMode: 'rad',
      mode: 'scientific',
      theme: 'light',
      haptics: false,
    });
  });

  it('falls back to defaults for missing or invalid values', () => {
    const storage = useMemoryStorage();
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);

    storage.setItem('calculator-plus.settings.v1', '{"angleMode":"gradians","theme":"neon"}');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
