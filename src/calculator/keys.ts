/** The complete set of calculator inputs. The UI only ever emits these ids. */
export type KeyId =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'decimal'
  | 'add' | 'subtract' | 'multiply' | 'divide' | 'power'
  | 'open' | 'close'
  | 'percent' | 'factorial' | 'square' | 'reciprocal' | 'absolute'
  | 'pi' | 'euler'
  | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'log' | 'ln' | 'sqrt'
  | 'negate' | 'backspace' | 'clear' | 'equals';

/** Human-readable names used for `aria-label`s and history tooltips. */
export const KEY_LABELS: Readonly<Record<KeyId, string>> = {
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
  decimal: 'Decimal point',
  add: 'Add',
  subtract: 'Subtract',
  multiply: 'Multiply',
  divide: 'Divide',
  power: 'Power',
  open: 'Open parenthesis',
  close: 'Close parenthesis',
  percent: 'Percent',
  factorial: 'Factorial',
  square: 'Square',
  reciprocal: 'Reciprocal',
  absolute: 'Absolute value',
  pi: 'Pi',
  euler: "Euler's number",
  sin: 'Sine', cos: 'Cosine', tan: 'Tangent',
  asin: 'Inverse sine', acos: 'Inverse cosine', atan: 'Inverse tangent',
  log: 'Logarithm base 10', ln: 'Natural logarithm', sqrt: 'Square root',
  negate: 'Toggle sign',
  backspace: 'Delete',
  clear: 'Clear',
  equals: 'Equals',
};
