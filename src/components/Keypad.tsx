import { CalculatorButton } from './CalculatorButton';
import type { KeyId } from '../calculator/keys';

interface KeypadProps {
  onPress: (key: KeyId) => void;
}

/**
 * The five-row primary keypad. `0` keeps a full cell rather than spanning two
 * so that backspace has a home next to it without crowding the grid.
 */
export function Keypad({ onPress }: KeypadProps) {
  return (
    <div className="keypad keypad--basic" role="group" aria-label="Calculator keypad">
      <CalculatorButton keyId="clear" variant="function" onPress={onPress} label="Clear all">
        AC
      </CalculatorButton>
      <CalculatorButton keyId="negate" variant="function" onPress={onPress}>±</CalculatorButton>
      <CalculatorButton keyId="percent" variant="function" onPress={onPress}>%</CalculatorButton>
      <CalculatorButton keyId="divide" variant="operator" onPress={onPress}>÷</CalculatorButton>

      <CalculatorButton keyId="7" onPress={onPress}>7</CalculatorButton>
      <CalculatorButton keyId="8" onPress={onPress}>8</CalculatorButton>
      <CalculatorButton keyId="9" onPress={onPress}>9</CalculatorButton>
      <CalculatorButton keyId="multiply" variant="operator" onPress={onPress}>×</CalculatorButton>

      <CalculatorButton keyId="4" onPress={onPress}>4</CalculatorButton>
      <CalculatorButton keyId="5" onPress={onPress}>5</CalculatorButton>
      <CalculatorButton keyId="6" onPress={onPress}>6</CalculatorButton>
      <CalculatorButton keyId="subtract" variant="operator" onPress={onPress}>−</CalculatorButton>

      <CalculatorButton keyId="1" onPress={onPress}>1</CalculatorButton>
      <CalculatorButton keyId="2" onPress={onPress}>2</CalculatorButton>
      <CalculatorButton keyId="3" onPress={onPress}>3</CalculatorButton>
      <CalculatorButton keyId="add" variant="operator" onPress={onPress}>+</CalculatorButton>

      <CalculatorButton keyId="0" onPress={onPress}>0</CalculatorButton>
      <CalculatorButton keyId="decimal" onPress={onPress}>.</CalculatorButton>
      <CalculatorButton keyId="backspace" variant="function" onPress={onPress}>⌫</CalculatorButton>
      <CalculatorButton keyId="equals" variant="operator" onPress={onPress}>=</CalculatorButton>
    </div>
  );
}
