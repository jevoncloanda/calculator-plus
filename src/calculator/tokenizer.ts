import { CalculatorError, type FunctionName, type Token } from './types';

/**
 * Display characters accepted by the tokenizer, mapped to their canonical form.
 * The UI writes typographic symbols (× ÷ −); keyboard input writes ASCII.
 */
const OPERATOR_ALIASES: Readonly<Record<string, string>> = {
  '+': '+',
  '-': '-',
  '−': '-', // minus sign
  '–': '-', // en dash
  '*': '*',
  '×': '*', // multiplication sign
  '⋅': '*', // dot operator
  '/': '/',
  '÷': '/', // division sign
  '^': '^',
};

/** Longest match first: `asin` must win over `a`, `abs` over `a`. */
const FUNCTIONS: ReadonlyArray<readonly [string, FunctionName]> = [
  ['asin', 'asin'],
  ['acos', 'acos'],
  ['atan', 'atan'],
  ['sin', 'sin'],
  ['cos', 'cos'],
  ['tan', 'tan'],
  ['log', 'log'],
  ['ln', 'ln'],
  ['abs', 'abs'],
  ['√', 'sqrt'], // √
  ['sqrt', 'sqrt'],
];

const DIGITS = /[0-9]/;

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const char = source[i] as string;

    if (char === ' ' || char === '\t' || char === '\n' || char === ',') {
      i += 1;
      continue;
    }

    if (DIGITS.test(char) || char === '.') {
      const start = i;
      let seenDot = false;
      while (i < source.length) {
        const c = source[i] as string;
        if (DIGITS.test(c)) {
          i += 1;
        } else if (c === '.' && !seenDot) {
          seenDot = true;
          i += 1;
        } else {
          break;
        }
      }
      // Exponent form (`1.5e-7`) so the engine can re-read its own output.
      // The UI always writes an explicit `×` before Euler's `e`, so this is
      // unambiguous: a bare `e` after digits is only ever an exponent marker.
      const exponentMatch = /^[eE][+-]?\d+/.exec(source.slice(i));
      if (exponentMatch) {
        i += exponentMatch[0].length;
      }

      const text = source.slice(start, i);
      const value = Number(text);
      if (!Number.isFinite(value)) {
        throw new CalculatorError('Invalid number');
      }
      tokens.push({ type: 'number', text, value, start });
      continue;
    }

    const operator = OPERATOR_ALIASES[char];
    if (operator !== undefined) {
      tokens.push({ type: 'operator', text: operator, start: i });
      i += 1;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'lparen', text: '(', start: i });
      i += 1;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rparen', text: ')', start: i });
      i += 1;
      continue;
    }
    if (char === '%') {
      tokens.push({ type: 'percent', text: '%', start: i });
      i += 1;
      continue;
    }
    if (char === '!') {
      tokens.push({ type: 'factorial', text: '!', start: i });
      i += 1;
      continue;
    }
    if (char === '²') {
      tokens.push({ type: 'square', text: '²', start: i });
      i += 1;
      continue;
    }
    if (char === 'π') {
      tokens.push({ type: 'constant', text: 'pi', start: i });
      i += 1;
      continue;
    }

    const fn = FUNCTIONS.find((entry) => source.startsWith(entry[0], i));
    if (fn) {
      tokens.push({ type: 'function', text: fn[1], start: i });
      i += fn[0].length;
      continue;
    }

    if (char === 'e' || char === 'E') {
      tokens.push({ type: 'constant', text: 'e', start: i });
      i += 1;
      continue;
    }

    throw new CalculatorError('Invalid input');
  }

  return tokens;
}
