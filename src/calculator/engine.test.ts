import { describe, expect, it } from 'vitest';
import { calculate, preview, type EngineOptions } from './calculatorEngine';
import { formatNumber, formatForInput } from './formatter';
import { applyKey, applyBackspace, completeForPreview } from './expression';
import type { KeyId } from './keys';

const DEG: EngineOptions = { angleMode: 'deg' };
const RAD: EngineOptions = { angleMode: 'rad' };

function value(expression: string, options = DEG): number {
  const result = calculate(expression, options);
  if (!result.ok) throw new Error(`expected success, got: ${result.error}`);
  return result.value;
}

function error(expression: string, options = DEG): string {
  const result = calculate(expression, options);
  if (result.ok) throw new Error(`expected an error, got: ${result.value}`);
  return result.error;
}

function type(keys: KeyId[]): string {
  return keys.reduce<string>((expression, key) => applyKey(expression, key), '');
}

describe('basic arithmetic', () => {
  it('adds, subtracts, multiplies and divides', () => {
    expect(value('2 + 2')).toBe(4);
    expect(value('10 − 3')).toBe(7);
    expect(value('5 × 6')).toBe(30);
    expect(value('20 ÷ 4')).toBe(5);
  });

  it('accepts ascii operators from the keyboard', () => {
    expect(value('5*6')).toBe(30);
    expect(value('20/4')).toBe(5);
    expect(value('10-3')).toBe(7);
  });

  it('respects operator precedence', () => {
    expect(value('12 + 35 × 8')).toBe(292);
    expect(value('2 + 3 × 4 − 6 ÷ 2')).toBe(11);
  });

  it('respects parentheses', () => {
    expect(value('(2 + 3) × 4')).toBe(20);
    expect(value('((1 + 2) × (3 + 4))')).toBe(21);
  });

  it('handles decimals without floating point artifacts', () => {
    expect(formatNumber(value('0.1 + 0.2'))).toBe('0.3');
    expect(value('999 ÷ 8')).toBe(124.875);
  });

  it('handles negative and unary values', () => {
    expect(value('−5 + 3')).toBe(-2);
    expect(value('-(4 + 6)')).toBe(-10);
    expect(value('3 × −2')).toBe(-6);
    expect(value('2^-2')).toBe(0.25);
  });

  it('is left associative for same-precedence operators', () => {
    expect(value('100 ÷ 5 ÷ 2')).toBe(10);
    expect(value('10 − 3 − 2')).toBe(5);
  });
});

describe('percentage', () => {
  it('treats a bare percent as a hundredth', () => {
    expect(value('50%')).toBe(0.5);
    expect(value('200 × 10%')).toBe(20);
    expect(value('200 ÷ 10%')).toBe(2000);
  });

  it('treats percent after + or − as a share of the left operand', () => {
    expect(value('200 + 10%')).toBe(220);
    expect(value('200 − 10%')).toBe(180);
    expect(value('50 + 50%')).toBe(75);
  });
});

describe('scientific functions', () => {
  it('computes roots and powers', () => {
    expect(value('√144')).toBe(12);
    expect(value('√(144)')).toBe(12);
    expect(value('2^10')).toBe(1024);
    expect(value('7²')).toBe(49);
  });

  it('computes trigonometry in degrees', () => {
    expect(value('sin(30)')).toBeCloseTo(0.5, 12);
    expect(value('cos(60)')).toBeCloseTo(0.5, 12);
    expect(value('sin(180)')).toBe(0);
    expect(value('cos(90)')).toBe(0);
    expect(value('asin(0.5)')).toBeCloseTo(30, 10);
    expect(value('atan(1)')).toBeCloseTo(45, 10);
  });

  it('computes trigonometry in radians', () => {
    expect(value('sin(π ÷ 6)', RAD)).toBeCloseTo(0.5, 12);
    expect(value('cos(0)', RAD)).toBe(1);
    expect(value('acos(1)', RAD)).toBe(0);
  });

  it('computes logarithms', () => {
    expect(value('log(100)')).toBe(2);
    expect(value('ln(e)')).toBe(1);
  });

  it('computes factorial, reciprocal and absolute value', () => {
    expect(value('5!')).toBe(120);
    expect(value('0!')).toBe(1);
    expect(value('1÷(4)')).toBe(0.25);
    expect(value('abs(−7)')).toBe(7);
  });

  it('exposes the constants', () => {
    expect(value('π')).toBeCloseTo(Math.PI, 12);
    expect(value('e')).toBeCloseTo(Math.E, 12);
    expect(value('2×π')).toBeCloseTo(Math.PI * 2, 12);
  });
});

describe('error handling', () => {
  it('reports division by zero', () => {
    expect(error('1 ÷ 0')).toBe('Cannot divide by zero');
    expect(error('100 ÷ 0')).toBe('Cannot divide by zero');
  });

  it('reports domain errors', () => {
    expect(error('√(−1)')).toMatch(/negative/i);
    expect(error('log(−1)')).toMatch(/positive/i);
    expect(error('ln(0)')).toMatch(/positive/i);
    expect(error('asin(2)')).toMatch(/between/i);
    expect(error('tan(90)')).toMatch(/undefined/i);
    expect(error('(−1)!')).toMatch(/whole number/i);
    expect(error('2.5!')).toMatch(/whole number/i);
  });

  it('reports overflow rather than infinity', () => {
    expect(error('9^9^9')).toBe('Number too large');
    expect(error('200!')).toBe('Number too large');
  });

  it('never throws on malformed input', () => {
    const malformed = ['12 +', '12 ×', '12 ÷', '(', ')', '', '   ', '()', '+', '×5', '((3)'];
    for (const expression of malformed) {
      expect(() => calculate(expression, DEG)).not.toThrow();
      expect(calculate(expression, DEG).ok).toBe(false);
    }
  });
});

describe('live shadow result', () => {
  it('previews complete expressions', () => {
    expect(preview('25 + 15', DEG)).toBe('40');
    expect(preview('120 × 3', DEG)).toBe('360');
    expect(preview('999 ÷ 8', DEG)).toBe('124.875');
    expect(preview('125 × 48', DEG)).toBe('6,000');
  });

  it('respects operator precedence', () => {
    expect(preview('12 + 35 × 8', DEG)).toBe('292');
    expect(preview('12 + 35 × 8', DEG)).not.toBe('376');
  });

  it('hides itself for incomplete expressions', () => {
    expect(preview('25 +', DEG)).toBeNull();
    expect(preview('12 ×', DEG)).toBeNull();
    expect(preview('12 ÷', DEG)).toBeNull();
    expect(preview('', DEG)).toBeNull();
  });

  it('hides itself for invalid expressions and errors', () => {
    expect(preview(')', DEG)).toBeNull();
    expect(preview('1 ÷ 0', DEG)).toBeNull();
    expect(preview('√(−4)', DEG)).toBeNull();
  });

  it('hides itself when the expression is already a plain number', () => {
    expect(preview('42', DEG)).toBeNull();
    expect(preview('−42', DEG)).toBeNull();
    expect(preview('3.5', DEG)).toBeNull();
  });

  it('closes open brackets so scientific input previews while typing', () => {
    expect(preview('sin(30', DEG)).toBe('0.5');
    expect(preview('(2 + 3', DEG)).toBe('5');
    expect(completeForPreview('sin(30')).toBe('sin(30)');
    expect(completeForPreview('(1+(2')).toBe('(1+(2))');
  });

  it('previews scientific expressions', () => {
    expect(preview('sin(30)', DEG)).toBe('0.5');
    expect(preview('√(144)', DEG)).toBe('12');
    expect(preview('2^10', DEG)).toBe('1,024');
    expect(preview('log(100)', DEG)).toBe('2');
    expect(preview('sin(π ÷ 6)', RAD)).toBe('0.5');
  });

  it('agrees with the committed result', () => {
    for (const expression of ['12 + 35 × 8', '0.1 + 0.2', 'sin(30)', '200 + 10%', '2^10']) {
      const committed = calculate(expression, DEG);
      expect(committed.ok).toBe(true);
      if (committed.ok) expect(preview(expression, DEG)).toBe(formatNumber(committed.value));
    }
  });

  it('never throws on arbitrary partial input', () => {
    const source = 'sin(12.5 + 35 × 8) ÷ (2 − √9)!%';
    for (let i = 0; i <= source.length; i += 1) {
      expect(() => preview(source.slice(0, i), DEG)).not.toThrow();
    }
  });
});

describe('number formatting', () => {
  it('groups thousands and trims noise', () => {
    expect(formatNumber(6000)).toBe('6,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(5.0)).toBe('5');
    expect(formatNumber(2.5)).toBe('2.5');
    expect(formatNumber(0.30000000000000004)).toBe('0.3');
    expect(formatNumber(-1234.5)).toBe('-1,234.5');
    expect(formatNumber(0)).toBe('0');
  });

  it('preserves meaningful precision', () => {
    expect(formatNumber(1 / 3)).toBe('0.333333333333');
    expect(formatNumber(124.875)).toBe('124.875');
    expect(formatNumber(Math.PI)).toBe('3.14159265359');
  });

  it('falls back to exponent form only for extreme values', () => {
    expect(formatNumber(1e21)).toBe('1e+21');
    expect(formatNumber(1e-12)).toBe('1e-12');
    expect(formatNumber(123456789012)).toBe('123,456,789,012');
  });

  it('round-trips results back into the expression input', () => {
    expect(formatForInput(6000)).toBe('6000');
    expect(formatForInput(0.30000000000000004)).toBe('0.3');
    expect(value(formatForInput(1 / 3))).toBe(0.333333333333);
    expect(value(formatForInput(1e21))).toBe(1e21);
  });
});

describe('expression input', () => {
  it('builds numbers and operators', () => {
    expect(type(['1', '2', 'add', '3'])).toBe('12+3');
    expect(type(['5', 'multiply', '6'])).toBe('5×6');
  });

  it('replaces a trailing operator instead of stacking them', () => {
    expect(type(['5', 'add', 'multiply'])).toBe('5×');
    expect(applyKey('5+', 'divide')).toBe('5÷');
  });

  it('keeps a minus after × ÷ ^ as a sign', () => {
    expect(applyKey('5×', 'subtract')).toBe('5×−');
    expect(applyKey('2^', 'subtract')).toBe('2^−');
    expect(applyKey('5+', 'subtract')).toBe('5−');
  });

  it('replaces an unfinished signed operator instead of stacking operators', () => {
    expect(type(['5', 'multiply', 'subtract', 'multiply'])).toBe('5×');
    expect(type(['5', 'divide', 'subtract', 'add'])).toBe('5+');
    expect(type(['2', 'power', 'subtract', 'divide'])).toBe('2÷');
  });

  it('guards the decimal point', () => {
    expect(type(['1', 'decimal', 'decimal', '5'])).toBe('1.5');
    expect(type(['decimal', '5'])).toBe('0.5');
    expect(applyKey('12+', 'decimal')).toBe('12+0.');
  });

  it('inserts implicit multiplication before values and groups', () => {
    expect(applyKey('5', 'pi')).toBe('5×π');
    expect(applyKey('5', 'open')).toBe('5×(');
    expect(applyKey('(2+3)', '4')).toBe('(2+3)×4');
    expect(applyKey('5', 'sin')).toBe('5×sin(');
    expect(applyKey('5', '3')).toBe('53');
  });

  it('only closes brackets that are open', () => {
    expect(applyKey('5', 'close')).toBe('5');
    expect(applyKey('(5', 'close')).toBe('(5)');
    expect(applyKey('(', 'close')).toBe('(');
  });

  it('wraps the trailing operand for ± 1/x and |x|', () => {
    expect(applyKey('5', 'negate')).toBe('(−5)');
    expect(applyKey('(−5)', 'negate')).toBe('5');
    expect(applyKey('12+5', 'negate')).toBe('12+(−5)');
    expect(applyKey('5', 'reciprocal')).toBe('1÷(5)');
    expect(applyKey('5', 'absolute')).toBe('abs(5)');
    expect(applyKey('sin(30)', 'absolute')).toBe('abs(sin(30))');
    expect(value(applyKey('5', 'reciprocal'))).toBe(0.2);
  });

  it('appends postfix keys only after a value', () => {
    expect(applyKey('50', 'percent')).toBe('50%');
    expect(applyKey('5', 'square')).toBe('5²');
    expect(applyKey('5+', 'percent')).toBe('5+');
    expect(applyKey('', 'factorial')).toBe('');
  });

  it('deletes whole function tokens on backspace', () => {
    expect(applyBackspace('12+sin(')).toBe('12+');
    expect(applyBackspace('12+√(')).toBe('12+');
    expect(applyBackspace('123')).toBe('12');
    expect(applyBackspace('')).toBe('');
  });

  it('never produces an expression that crashes the engine', () => {
    const keys: KeyId[] = [
      '1', 'decimal', 'decimal', '5', 'add', 'multiply', 'close', 'open', 'sin',
      'subtract', '9', 'close', 'factorial', 'percent', 'square', 'negate',
      'reciprocal', 'pi', 'euler', 'sqrt', 'backspace', 'divide', '0',
    ];
    let expression = '';
    for (const key of keys) {
      expression = applyKey(expression, key);
      expect(() => preview(expression, DEG)).not.toThrow();
      expect(() => calculate(expression, DEG)).not.toThrow();
    }
  });
});
