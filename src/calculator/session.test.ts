import { describe, expect, it } from 'vitest';
import { initialSession, sessionReducer, type SessionState } from './session';
import { preview } from './calculatorEngine';
import type { KeyId } from './keys';

const ANGLE = 'deg';

function pressAll(keys: KeyId[], from: SessionState = initialSession): SessionState {
  return keys.reduce(
    (state, key) => sessionReducer(state, { type: 'key', key, angleMode: ANGLE }),
    from,
  );
}

describe('session: entering and committing', () => {
  it('builds an expression without committing anything', () => {
    const state = pressAll(['1', '2', 'add', '3', '5']);
    expect(state.expression).toBe('12+35');
    expect(state.committed).toBeNull();
    expect(state.commitCount).toBe(0);
  });

  it('folds a burst of key presses in order', () => {
    // A single batch of presses must not lose keys to a stale snapshot.
    expect(pressAll(['1', '2', '5', 'multiply', '4', '8']).expression).toBe('125×48');
  });

  it('commits on equals', () => {
    const state = pressAll(['1', '2', 'add', '3', '5', 'multiply', '8', 'equals']);
    expect(state.expression).toBe('12+35×8');
    expect(state.committed).toEqual({ result: '292', value: 292 });
    expect(state.commitCount).toBe(1);
  });

  it('does not commit twice for one expression', () => {
    const state = pressAll(['2', 'add', '2', 'equals', 'equals', 'equals']);
    expect(state.commitCount).toBe(1);
  });

  it('does not commit an empty or incomplete expression', () => {
    expect(pressAll(['equals']).commitCount).toBe(0);
    const incomplete = pressAll(['1', '2', 'add', 'equals']);
    expect(incomplete.commitCount).toBe(0);
    expect(incomplete.error).toBe('Incomplete expression');
  });

  it('surfaces a friendly error instead of a result', () => {
    const state = pressAll(['1', 'divide', '0', 'equals']);
    expect(state.error).toBe('Cannot divide by zero');
    expect(state.committed).toBeNull();
    expect(state.commitCount).toBe(0);
  });

  it('clears the error as soon as editing resumes', () => {
    const state = pressAll(['1', 'divide', '0', 'equals', 'backspace']);
    expect(state.error).toBeNull();
    expect(state.expression).toBe('1÷');
  });
});

describe('session: continuing from a result', () => {
  it('keeps operating on the answer when an operator follows equals', () => {
    const state = pressAll(['1', '2', 'equals', 'multiply', '3']);
    expect(state.expression).toBe('12×3');
    expect(state.committed).toBeNull();
  });

  it('starts fresh when a digit follows equals', () => {
    const state = pressAll(['1', '2', 'equals', '7']);
    expect(state.expression).toBe('7');
  });

  it('reuses the numeric value, not the formatted text', () => {
    // 6000 formats as "6,000"; the expression must stay machine-readable.
    const state = pressAll(['2', '0', '0', '0', 'multiply', '3', 'equals', 'add', '1']);
    expect(state.expression).toBe('6000+1');
  });

  it('clear resets the expression and result', () => {
    const state = pressAll(['2', 'add', '2', 'equals', 'clear']);
    expect(state).toMatchObject({ expression: '', committed: null, error: null });
  });
});

describe('session: restoring history', () => {
  it('loads an expression and drops any previous result', () => {
    const committed = pressAll(['2', 'add', '2', 'equals']);
    const restored = sessionReducer(committed, { type: 'restore', expression: '6000' });
    expect(restored.expression).toBe('6000');
    expect(restored.committed).toBeNull();
    expect(restored.error).toBeNull();
  });
});

describe('session: preview is independent of committing', () => {
  it('previews while typing and stays uncommitted', () => {
    const state = pressAll(['2', '5', 'add', '1', '5']);
    expect(preview(state.expression, { angleMode: ANGLE })).toBe('40');
    expect(state.committed).toBeNull();
    expect(state.commitCount).toBe(0);
  });

  it('has no preview for a trailing operator', () => {
    const state = pressAll(['2', '5', 'add']);
    expect(preview(state.expression, { angleMode: ANGLE })).toBeNull();
  });

  it('previews the same value that equals later commits', () => {
    const typed = pressAll(['9', '9', '9', 'divide', '8']);
    const shadow = preview(typed.expression, { angleMode: ANGLE });
    const committed = sessionReducer(typed, { type: 'key', key: 'equals', angleMode: ANGLE });
    expect(shadow).toBe('124.875');
    expect(committed.committed?.result).toBe(shadow);
  });

  it('previews scientific input in the current angle mode', () => {
    const state = pressAll(['sin', '3', '0']);
    expect(state.expression).toBe('sin(30');
    expect(preview(state.expression, { angleMode: 'deg' })).toBe('0.5');
    expect(preview(state.expression, { angleMode: 'rad' })).toBe('-0.988031624093');
  });
});
