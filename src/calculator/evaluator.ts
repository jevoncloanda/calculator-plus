import { CalculatorError, type AngleMode, type Node } from './types';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
/** 170! is the largest factorial representable as a finite double. */
const MAX_FACTORIAL = 170;

export interface EvaluateOptions {
  angleMode: AngleMode;
}

/** Guards every intermediate value so a bad result never propagates silently. */
function guard(value: number): number {
  if (Number.isNaN(value)) throw new CalculatorError('Invalid input');
  if (!Number.isFinite(value)) throw new CalculatorError('Number too large');
  return value;
}

function toRadians(value: number, angleMode: AngleMode): number {
  return angleMode === 'deg' ? value * DEG_TO_RAD : value;
}

function fromRadians(value: number, angleMode: AngleMode): number {
  return angleMode === 'deg' ? value * RAD_TO_DEG : value;
}

/**
 * Exact answers on the degree grid: `sin 180` is 0, not 1.2e-16, and
 * `tan 90` is undefined rather than 1.6e16.
 */
function trigInDegrees(name: 'sin' | 'cos' | 'tan', degrees: number): number | null {
  if (!Number.isInteger(degrees)) return null;
  const quarter = ((degrees % 360) + 360) % 360;
  if (quarter % 90 !== 0) return null;
  switch (name) {
    case 'sin':
      return [0, 1, 0, -1][quarter / 90] as number;
    case 'cos':
      return [1, 0, -1, 0][quarter / 90] as number;
    case 'tan':
      if (quarter % 180 === 90) throw new CalculatorError('Undefined result');
      return 0;
  }
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new CalculatorError('Factorial needs a whole number');
  }
  if (value > MAX_FACTORIAL) {
    throw new CalculatorError('Number too large');
  }
  let result = 1;
  for (let i = 2; i <= value; i += 1) result *= i;
  return result;
}

function evaluateCall(node: Extract<Node, { kind: 'call' }>, options: EvaluateOptions): number {
  const x = evaluateNode(node.argument, options);
  const { angleMode } = options;

  switch (node.name) {
    case 'sin':
    case 'cos':
    case 'tan': {
      if (angleMode === 'deg') {
        const exact = trigInDegrees(node.name, x);
        if (exact !== null) return exact;
      }
      const radians = toRadians(x, angleMode);
      return guard(Math[node.name](radians));
    }
    case 'asin':
    case 'acos':
      if (x < -1 || x > 1) throw new CalculatorError('Input must be between -1 and 1');
      return guard(fromRadians(Math[node.name](x), angleMode));
    case 'atan':
      return guard(fromRadians(Math.atan(x), angleMode));
    case 'log':
      if (x <= 0) throw new CalculatorError('Log needs a positive number');
      return guard(Math.log10(x));
    case 'ln':
      if (x <= 0) throw new CalculatorError('Log needs a positive number');
      return guard(Math.log(x));
    case 'sqrt':
      if (x < 0) throw new CalculatorError('Cannot take the root of a negative number');
      return guard(Math.sqrt(x));
    case 'abs':
      return guard(Math.abs(x));
  }
}

function evaluateBinary(
  node: Extract<Node, { kind: 'binary' }>,
  options: EvaluateOptions,
): number {
  const left = evaluateNode(node.left, options);

  // Calculator percentage: `200 + 10%` means "add 10% of 200", while
  // `200 × 10%` means "multiply by 0.1". Only ± are relative.
  if ((node.op === '+' || node.op === '-') && node.right.kind === 'percent') {
    const share = (left * evaluateNode(node.right.operand, options)) / 100;
    return guard(node.op === '+' ? left + share : left - share);
  }

  const right = evaluateNode(node.right, options);
  switch (node.op) {
    case '+':
      return guard(left + right);
    case '-':
      return guard(left - right);
    case '*':
      return guard(left * right);
    case '/':
      if (right === 0) throw new CalculatorError('Cannot divide by zero');
      return guard(left / right);
    case '^':
      return guard(Math.pow(left, right));
  }
}

function evaluateNode(node: Node, options: EvaluateOptions): number {
  switch (node.kind) {
    case 'number':
      return node.value;

    case 'constant':
      return node.name === 'pi' ? Math.PI : Math.E;

    case 'unary': {
      const value = evaluateNode(node.operand, options);
      return node.op === '-' ? -value : value;
    }

    case 'binary':
      return evaluateBinary(node, options);

    case 'call':
      return evaluateCall(node, options);

    case 'factorial':
      return guard(factorial(evaluateNode(node.operand, options)));

    case 'percent':
      return guard(evaluateNode(node.operand, options) / 100);
  }
}

export function evaluate(node: Node, options: EvaluateOptions): number {
  return guard(evaluateNode(node, options));
}
