import { calculate } from './calculatorEngine';
import { applyKey } from './expression';
import { formatForInput, formatNumber } from './formatter';
import type { KeyId } from './keys';
import type { AngleMode } from './types';

/**
 * The calculator's session state and its transitions, as a pure reducer.
 *
 * Keeping this outside React means every transition is deterministic and
 * testable, and that a burst of key presses always folds in order rather than
 * each one reading a stale snapshot.
 */
export interface CommittedResult {
  result: string;
  value: number;
}

export interface SessionState {
  expression: string;
  /** Set once `=` is pressed, cleared as soon as editing resumes. */
  committed: CommittedResult | null;
  error: string | null;
  /** Increments on every successful commit; drives the history write. */
  commitCount: number;
}

export type SessionAction =
  | { type: 'key'; key: KeyId; angleMode: AngleMode }
  | { type: 'restore'; expression: string };

export const initialSession: SessionState = {
  expression: '',
  committed: null,
  error: null,
  commitCount: 0,
};

/**
 * Keys that continue working on the answer just produced (`= 12` then `× 3`),
 * as opposed to keys that begin a brand new calculation.
 */
const CONTINUES_FROM_RESULT = new Set<KeyId>([
  'add', 'subtract', 'multiply', 'divide', 'power',
  'percent', 'factorial', 'square', 'reciprocal', 'absolute', 'negate',
]);

function commit(state: SessionState, angleMode: AngleMode): SessionState {
  const source = state.expression.trim();
  if (source.length === 0) return state;

  const outcome = calculate(source, { angleMode });
  if (!outcome.ok) return { ...state, committed: null, error: outcome.error };

  return {
    ...state,
    committed: { result: formatNumber(outcome.value), value: outcome.value },
    error: null,
    commitCount: state.commitCount + 1,
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'restore') {
    return { ...state, expression: action.expression, committed: null, error: null };
  }

  const { key, angleMode } = action;

  if (key === 'clear') {
    return { ...initialSession, commitCount: state.commitCount };
  }

  if (key === 'equals') {
    // An answer or an error is already on screen; pressing `=` again must not
    // record a duplicate history entry.
    if (state.committed || state.error) return state;
    return commit(state, angleMode);
  }

  if (state.committed) {
    const seed = CONTINUES_FROM_RESULT.has(key) ? formatForInput(state.committed.value) : '';
    return { ...state, expression: applyKey(seed, key), committed: null, error: null };
  }

  return { ...state, expression: applyKey(state.expression, key), error: null };
}
