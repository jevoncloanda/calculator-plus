import { useEffect } from 'react';
import type { KeyId } from '../calculator/keys';

/** Desktop keyboard mapping. Values are `event.key`. */
const KEY_MAP: Readonly<Record<string, KeyId>> = {
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  '.': 'decimal',
  ',': 'decimal',
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  x: 'multiply',
  '/': 'divide',
  '^': 'power',
  '(': 'open',
  ')': 'close',
  '%': 'percent',
  '!': 'factorial',
  '=': 'equals',
  Enter: 'equals',
  Backspace: 'backspace',
  Delete: 'clear',
  Escape: 'clear',
};

/** Routes physical keystrokes through exactly the same handler as the buttons. */
export function useKeyboard(press: (key: KeyId) => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const mapped = KEY_MAP[event.key];
      if (!mapped) return;

      // Let Enter and Space activate a focused button normally, so keyboard
      // navigation of the keypad still works.
      const focused = document.activeElement;
      if (event.key === 'Enter' && focused instanceof HTMLButtonElement) return;

      event.preventDefault();
      press(mapped);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [press]);
}
