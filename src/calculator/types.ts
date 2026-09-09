/** Shared types for the calculator engine. The engine is pure and UI-agnostic. */

export type AngleMode = 'deg' | 'rad';

export type BinaryOperator = '+' | '-' | '*' | '/' | '^';

/** Prefix functions written as `name(argument)`. */
export type FunctionName =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'asin'
  | 'acos'
  | 'atan'
  | 'log'
  | 'ln'
  | 'sqrt'
  | 'abs';

export type Node =
  | { kind: 'number'; value: number }
  | { kind: 'constant'; name: 'pi' | 'e' }
  | { kind: 'unary'; op: '+' | '-'; operand: Node }
  | { kind: 'binary'; op: BinaryOperator; left: Node; right: Node }
  | { kind: 'call'; name: FunctionName; argument: Node }
  /** Postfix `!`. */
  | { kind: 'factorial'; operand: Node }
  /** Postfix `%`. Meaning depends on context; see evaluator. */
  | { kind: 'percent'; operand: Node };

export type TokenType =
  | 'number'
  | 'operator'
  | 'lparen'
  | 'rparen'
  | 'function'
  | 'constant'
  | 'factorial'
  | 'percent'
  | 'square';

export interface Token {
  type: TokenType;
  /** Raw source text of the token. */
  text: string;
  /** Numeric value for `number` tokens. */
  value?: number;
  /** Start index in the source expression. */
  start: number;
}

/** Every failure the engine can produce, as a user-facing message. */
export class CalculatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalculatorError';
  }
}

export type EvaluationResult =
  | { ok: true; value: number }
  | { ok: false; error: string };
