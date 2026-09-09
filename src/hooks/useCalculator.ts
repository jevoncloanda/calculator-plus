import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { preview as previewOf } from '../calculator/calculatorEngine';
import {
  initialSession,
  sessionReducer,
  type CommittedResult,
  type SessionState,
} from '../calculator/session';
import type { KeyId } from '../calculator/keys';
import type { AngleMode } from '../calculator/types';

export type { CommittedResult };

export interface CalculatorSession {
  expression: string;
  /** Live shadow result, or null when there is nothing meaningful to show. */
  preview: string | null;
  committed: CommittedResult | null;
  error: string | null;
  press: (key: KeyId) => void;
  /** Loads a stored calculation back into the calculator. */
  restore: (expression: string) => void;
}

export interface CalculatorOptions {
  angleMode: AngleMode;
  onCommit: (expression: string, result: string, value: number) => void;
}

export function useCalculator({ angleMode, onCommit }: CalculatorOptions): CalculatorSession {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);

  const press = useCallback((key: KeyId) => dispatch({ type: 'key', key, angleMode }), [angleMode]);
  const restore = useCallback(
    (expression: string) => dispatch({ type: 'restore', expression }),
    [],
  );

  // Recording history is a side effect of committing, so it happens here rather
  // than inside the reducer. The counter makes the write exactly-once.
  const recorded = useRef(0);
  useEffect(() => {
    if (session.commitCount <= recorded.current || !session.committed) return;
    recorded.current = session.commitCount;
    onCommit(session.expression.trim(), session.committed.result, session.committed.value);
  }, [session, onCommit]);

  const preview = useMemo(
    () => (session.committed || session.error ? null : previewOf(session.expression, { angleMode })),
    [session.committed, session.error, session.expression, angleMode],
  );

  return {
    expression: session.expression,
    preview,
    committed: session.committed,
    error: session.error,
    press,
    restore,
  };
}

export type { SessionState };
