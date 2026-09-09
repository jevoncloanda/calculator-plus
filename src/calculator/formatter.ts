/**
 * Number presentation. Two jobs: erase binary floating-point artifacts
 * (0.1 + 0.2 → 0.3) without flattening genuine precision, and group digits.
 */

/** Doubles carry ~15-17 significant digits; the last few are noise. */
const SIGNIFICANT_DIGITS = 12;
const MAX_PLAIN_MAGNITUDE = 1e15;
const MIN_PLAIN_MAGNITUDE = 1e-9;

/** Rounds away representation noise while keeping meaningful precision. */
export function normalizeNumber(value: number): number {
  if (!Number.isFinite(value) || value === 0) return value;
  return Number(value.toPrecision(SIGNIFICANT_DIGITS));
}

function groupIntegerDigits(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatExponential(value: number): string {
  const [mantissa = '0', exponent = '0'] = value.toExponential(8).split('e');
  const trimmedMantissa = mantissa.includes('.')
    ? mantissa.replace(/0+$/, '').replace(/\.$/, '')
    : mantissa;
  return `${trimmedMantissa}e${exponent.startsWith('-') ? exponent : `+${exponent.replace('+', '')}`}`;
}

/** Formats a raw number for display: grouped, trimmed, artifact-free. */
export function formatNumber(value: number): string {
  if (Number.isNaN(value)) return 'Error';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞';

  const normalized = normalizeNumber(value);
  if (normalized === 0) return '0';

  const magnitude = Math.abs(normalized);
  if (magnitude >= MAX_PLAIN_MAGNITUDE || magnitude < MIN_PLAIN_MAGNITUDE) {
    return formatExponential(normalized);
  }

  const sign = normalized < 0 ? '-' : '';
  // `toPrecision` can itself return exponential form; go through a fixed-point
  // string so grouping always has plain digits to work with.
  const digits = Math.max(0, SIGNIFICANT_DIGITS - Math.floor(Math.log10(magnitude)) - 1);
  const fixed = magnitude.toFixed(Math.min(20, digits));
  const [integerPart = '0', fractionPart = ''] = fixed.split('.');
  const trimmedFraction = fractionPart.replace(/0+$/, '');

  const grouped = groupIntegerDigits(integerPart);
  return trimmedFraction ? `${sign}${grouped}.${trimmedFraction}` : `${sign}${grouped}`;
}

/**
 * Formats a committed result for re-entry into the expression input.
 * Grouping separators would confuse the tokenizer's number scanner.
 */
export function formatForInput(value: number): string {
  const normalized = normalizeNumber(value);
  if (!Number.isFinite(normalized)) return '0';
  return String(normalized);
}
