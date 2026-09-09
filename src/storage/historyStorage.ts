import { readJson, writeJson } from './localStore';

export interface HistoryEntry {
  id: string;
  /** The expression exactly as the user entered it. */
  expression: string;
  /** The formatted result, ready to display. */
  result: string;
  /** Raw numeric result, so an entry can be reused without re-parsing. */
  value: number;
  /** Unix milliseconds. */
  timestamp: number;
}

const STORAGE_KEY = 'calculator-plus.history.v1';
/** Bounded so localStorage cannot grow without limit over years of use. */
const MAX_ENTRIES = 200;

function isEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.expression === 'string' &&
    typeof entry.result === 'string' &&
    typeof entry.value === 'number' &&
    typeof entry.timestamp === 'number'
  );
}

function isEntryList(value: unknown): value is HistoryEntry[] {
  return Array.isArray(value) && value.every(isEntry);
}

/** Newest first. */
export function loadHistory(): HistoryEntry[] {
  return readJson(STORAGE_KEY, isEntryList) ?? [];
}

export function saveHistory(entries: HistoryEntry[]): void {
  writeJson(STORAGE_KEY, entries.slice(0, MAX_ENTRIES));
}

export function createEntry(expression: string, result: string, value: number): HistoryEntry {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    expression,
    result,
    value,
    timestamp: Date.now(),
  };
}
