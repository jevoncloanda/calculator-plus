import { useState } from 'react';
import { CalculatorButton } from './CalculatorButton';
import type { KeyId } from '../calculator/keys';
import type { AngleMode } from '../calculator/types';

interface ScientificKeypadProps {
  onPress: (key: KeyId) => void;
  angleMode: AngleMode;
  onAngleModeChange: (angleMode: AngleMode) => void;
}

/**
 * Fifteen scientific keys in three rows above the primary keypad. A `2nd`
 * toggle swaps three of them for their alternates, which keeps every required
 * function reachable without shrinking touch targets. The angle unit sits with
 * the trigonometry keys, where it is both visible and where it matters.
 */
export function ScientificKeypad({ onPress, angleMode, onAngleModeChange }: ScientificKeypadProps) {
  const [alternate, setAlternate] = useState(false);

  return (
    <div className="keypad keypad--science" role="group" aria-label="Scientific keypad">
      <button
        type="button"
        className={`key key--science${alternate ? ' key--science-on' : ''}`}
        onClick={() => setAlternate((current) => !current)}
        aria-pressed={alternate}
        aria-label="Second function"
      >
        <span aria-hidden="true">2nd</span>
      </button>

      {alternate ? (
        <>
          <CalculatorButton keyId="asin" variant="science" onPress={onPress}>sin⁻¹</CalculatorButton>
          <CalculatorButton keyId="acos" variant="science" onPress={onPress}>cos⁻¹</CalculatorButton>
          <CalculatorButton keyId="atan" variant="science" onPress={onPress}>tan⁻¹</CalculatorButton>
        </>
      ) : (
        <>
          <CalculatorButton keyId="sin" variant="science" onPress={onPress}>sin</CalculatorButton>
          <CalculatorButton keyId="cos" variant="science" onPress={onPress}>cos</CalculatorButton>
          <CalculatorButton keyId="tan" variant="science" onPress={onPress}>tan</CalculatorButton>
        </>
      )}

      <button
        type="button"
        className="key key--science key--angle"
        onClick={() => onAngleModeChange(angleMode === 'deg' ? 'rad' : 'deg')}
        aria-label={`Angle unit: ${angleMode === 'deg' ? 'degrees' : 'radians'}. Switch to ${
          angleMode === 'deg' ? 'radians' : 'degrees'
        }.`}
      >
        <span aria-hidden="true">{angleMode === 'deg' ? 'DEG' : 'RAD'}</span>
      </button>

      <CalculatorButton keyId="power" variant="science" onPress={onPress} label="Power of y">
        xʸ
      </CalculatorButton>

      {alternate ? (
        <CalculatorButton keyId="reciprocal" variant="science" onPress={onPress}>1/x</CalculatorButton>
      ) : (
        <CalculatorButton keyId="square" variant="science" onPress={onPress}>x²</CalculatorButton>
      )}

      {alternate ? (
        <CalculatorButton keyId="absolute" variant="science" onPress={onPress}>|x|</CalculatorButton>
      ) : (
        <CalculatorButton keyId="sqrt" variant="science" onPress={onPress}>√</CalculatorButton>
      )}

      <CalculatorButton keyId="ln" variant="science" onPress={onPress}>ln</CalculatorButton>
      <CalculatorButton keyId="log" variant="science" onPress={onPress}>log</CalculatorButton>

      <CalculatorButton keyId="open" variant="science" onPress={onPress}>(</CalculatorButton>
      <CalculatorButton keyId="close" variant="science" onPress={onPress}>)</CalculatorButton>
      <CalculatorButton keyId="pi" variant="science" onPress={onPress}>π</CalculatorButton>
      <CalculatorButton keyId="euler" variant="science" onPress={onPress}>e</CalculatorButton>
      <CalculatorButton keyId="factorial" variant="science" onPress={onPress}>x!</CalculatorButton>
    </div>
  );
}
