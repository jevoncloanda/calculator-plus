import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEntry,
  loadHistory,
  saveHistory,
  type HistoryEntry,
} from '../storage/historyStorage';

export interface UseHistory {
  entries: HistoryEntry[];
  add: (expression: string, result: string, value: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export function useHistory(): UseHistory {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);
  const loaded = useRef(false);

  // Mirror state into storage on change, skipping the first pass so the values
  // just read back are not immediately rewritten.
  useEffect(() => {
    if (loaded.current) saveHistory(entries);
    else loaded.current = true;
  }, [entries]);

  const add = useCallback((expression: string, result: string, value: number) => {
    setEntries((current) => [createEntry(expression, result, value), ...current]);
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, add, remove, clear };
}
