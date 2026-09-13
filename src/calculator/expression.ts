import type { KeyId } from './keys';

/**
 * Pure editing rules for the expression string. Keeping this out of React means
 * every input path — touch, keyboard, history reuse — behaves identically and
 * stays unit-testable.
 */

/** Text inserted by function-style keys; also the units backspace removes whole. */
const OPENING_TEXT: Partial<Record<KeyId, string>> = {
  sin: 'sin(', cos: 'cos(', tan: 'tan(',
  asin: 'asin(', acos: 'acos(', atan: 'atan(',
  log: 'log(', ln: 'ln(', sqrt: '√(',
  absolute: 'abs(', reciprocal: '1÷(',
  open: '(',
};

const OPERATOR_TEXT: Partial<Record<KeyId, string>> = {
  add: '+', subtract: '−', multiply: '×', divide: '÷', power: '^',
};

const OPERATORS = new Set(['+', '−', '×', '÷', '^']);
/** Characters after which a new value must be joined by an explicit `×`. */
const CLOSED_VALUE_END = new Set([')', 'π', 'e', '%', '!', '²']);
const DIGITS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

function lastChar(expression: string): string {
  return expression.slice(-1);
}

/** True when the expression ends in something a value could follow directly. */
function endsWithValue(expression: string): boolean {
  const char = lastChar(expression);
  return DIGITS.has(char) || char === '.' || CLOSED_VALUE_END.has(char);
}

function unbalancedParens(expression: string): number {
  let depth = 0;
  for (const char of expression) {
    if (char === '(') depth += 1;
    else if (char === ')') depth = Math.max(0, depth - 1);
  }
  return depth;
}

/** Digits (and a decimal point) typed since the last non-numeric character. */
function trailingNumber(expression: string): string {
  const match = /[0-9.]*$/.exec(expression);
  return match ? match[0] : '';
}

/**
 * Start index of the operand the expression ends with, or -1 when it does not
 * end in a complete operand. Used by ±, 1/x and |x|, which act on "the number
 * you just entered" the way a physical calculator does.
 */
export function trailingOperandStart(expression: string): number {
  if (expression.length === 0) return -1;
  const end = expression.length - 1;
  const last = expression[end] as string;

  if (last === ')') {
    let depth = 0;
    for (let i = end; i >= 0; i -= 1) {
      const char = expression[i];
      if (char === ')') depth += 1;
      else if (char === '(') {
        depth -= 1;
        if (depth === 0) {
          // Absorb a function name immediately before the bracket.
          const name = /(?:asin|acos|atan|sin|cos|tan|log|ln|abs|√)$/.exec(expression.slice(0, i));
          return name ? i - name[0].length : i;
        }
      }
    }
    return -1;
  }

  if (last === 'π' || last === 'e') return end;

  if (DIGITS.has(last) || last === '.') {
    return expression.length - trailingNumber(expression).length;
  }

  return -1;
}

function insertValue(expression: string, text: string, isDigit: boolean): string {
  const needsProduct = isDigit ? CLOSED_VALUE_END.has(lastChar(expression)) : endsWithValue(expression);
  return needsProduct ? `${expression}×${text}` : expression + text;
}

function applyOperator(expression: string, operator: string): string {
  if (expression.length === 0) {
    // A leading minus is a valid unary sign; a leading × is not.
    return operator === '−' ? operator : expression;
  }
  const last = lastChar(expression);

  // A minus immediately after ×, ÷ or ^ is a unary sign. If another binary
  // operator is pressed, replace that whole unfinished operator state instead
  // of leaving a sequence such as `××` or `×+` behind.
  const previous = expression.at(-2);
  if (last === '−' && previous && OPERATORS.has(previous) && previous !== '+' && previous !== '−') {
    return expression.slice(0, -2) + operator;
  }

  if (OPERATORS.has(last)) {
    // `×` followed by `−` is a signed operand, not a typo.
    if (operator === '−' && last !== '+' && last !== '−') return expression + operator;
    return expression.slice(0, -1) + operator;
  }
  if (last === '(') {
    return operator === '−' ? expression + operator : expression;
  }
  return expression + operator;
}

function applyDecimal(expression: string): string {
  if (trailingNumber(expression).includes('.')) return expression;
  if (!endsWithValue(expression) || CLOSED_VALUE_END.has(lastChar(expression))) {
    return insertValue(expression, '0.', false);
  }
  return `${expression}.`;
}

function applyPostfix(expression: string, symbol: string): string {
  if (!endsWithValue(expression)) return expression;
  if (symbol === '%' && lastChar(expression) === '%') return expression;
  return expression + symbol;
}

/** Wraps the trailing operand, or opens a new group when there is none. */
function applyWrapping(expression: string, prefix: string, suffix: string): string {
  const start = trailingOperandStart(expression);
  if (start === -1) return expression + prefix;
  return `${expression.slice(0, start)}${prefix}${expression.slice(start)}${suffix}`;
}

function applyNegate(expression: string): string {
  const start = trailingOperandStart(expression);
  if (start === -1) {
    return lastChar(expression) === '−' ? expression.slice(0, -1) : `${expression}−`;
  }
  const operand = expression.slice(start);
  const head = expression.slice(0, start);
  if (operand.startsWith('(−') && operand.endsWith(')')) {
    return head + operand.slice(2, -1);
  }
  return `${head}(−${operand})`;
}

export function applyBackspace(expression: string): string {
  for (const text of Object.values(OPENING_TEXT)) {
    if (text.length > 1 && expression.endsWith(text)) {
      return expression.slice(0, -text.length);
    }
  }
  return expression.slice(0, -1);
}

/**
 * Applies one key press to an expression. `clear` and `equals` are session
 * transitions rather than text edits and are handled by the calculator hook.
 */
export function applyKey(expression: string, key: KeyId): string {
  if (DIGITS.has(key)) return insertValue(expression, key, true);
  if (key === 'decimal') return applyDecimal(expression);
  if (key === 'backspace') return applyBackspace(expression);
  if (key === 'negate') return applyNegate(expression);
  if (key === 'pi') return insertValue(expression, 'π', false);
  if (key === 'euler') return insertValue(expression, 'e', false);
  if (key === 'percent') return applyPostfix(expression, '%');
  if (key === 'factorial') return applyPostfix(expression, '!');
  if (key === 'square') return applyPostfix(expression, '²');
  if (key === 'absolute') return applyWrapping(expression, 'abs(', ')');
  if (key === 'reciprocal') return applyWrapping(expression, '1÷(', ')');

  const operator = OPERATOR_TEXT[key];
  if (operator) return applyOperator(expression, operator);

  if (key === 'close') {
    if (unbalancedParens(expression) === 0) return expression;
    if (!endsWithValue(expression)) return expression;
    return `${expression})`;
  }

  const opening = OPENING_TEXT[key];
  if (opening) return insertValue(expression, opening, false);

  return expression;
}

/**
 * Closes any brackets the user has not closed yet. Used only to compute the
 * live preview, so `sin(30` can show a result without editing what is on screen.
 */
export function completeForPreview(expression: string): string {
  return expression + ')'.repeat(unbalancedParens(expression));
}
