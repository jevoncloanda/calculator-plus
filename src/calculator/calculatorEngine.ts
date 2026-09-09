import { evaluate } from './evaluator';
import { formatNumber } from './formatter';
import { completeForPreview } from './expression';
import { parse } from './parser';
import { CalculatorError, type AngleMode, type EvaluationResult, type Node } from './types';

export interface EngineOptions {
  angleMode: AngleMode;
}

/** A bare number needs no preview — the answer is already on screen. */
function isLiteral(node: Node): boolean {
  if (node.kind === 'number' || node.kind === 'constant') return true;
  if (node.kind === 'unary') return isLiteral(node.operand);
  return false;
}

/**
 * Evaluates a committed expression. Never throws: every failure comes back as
 * a message that is safe to show the user.
 */
export function calculate(expression: string, options: EngineOptions): EvaluationResult {
  try {
    const value = evaluate(parse(expression), options);
    return { ok: true, value };
  } catch (error) {
    if (error instanceof CalculatorError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Error' };
  }
}

/**
 * The live shadow result. Uses exactly the same parser and evaluator as
 * `calculate`, and returns `null` whenever there is nothing meaningful to show
 * (empty, incomplete, invalid, or a plain number).
 */
export function preview(expression: string, options: EngineOptions): string | null {
  const source = expression.trim();
  if (source.length === 0) return null;

  try {
    const node = parse(completeForPreview(source));
    if (isLiteral(node)) return null;
    return formatNumber(evaluate(node, options));
  } catch {
    return null;
  }
}
