import type { ReactNode } from 'react';
import { KEY_LABELS, type KeyId } from '../calculator/keys';

export type ButtonVariant = 'number' | 'function' | 'operator' | 'accent' | 'science';

interface CalculatorButtonProps {
  keyId: KeyId;
  children: ReactNode;
  onPress: (key: KeyId) => void;
  variant?: ButtonVariant;
  /** Overrides the default accessible name from `KEY_LABELS`. */
  label?: string;
  wide?: boolean;
  pressed?: boolean;
}

export function CalculatorButton({
  keyId,
  children,
  onPress,
  variant = 'number',
  label,
  wide = false,
  pressed,
}: CalculatorButtonProps) {
  return (
    <button
      type="button"
      className={`key key--${variant}${wide ? ' key--wide' : ''}`}
      onClick={() => onPress(keyId)}
      aria-label={label ?? KEY_LABELS[keyId]}
      {...(pressed === undefined ? {} : { 'aria-pressed': pressed })}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
