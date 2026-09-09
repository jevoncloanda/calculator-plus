import { useCallback, useState } from 'react';
import type { KeyId } from '../calculator/keys';
import type { AngleMode } from '../calculator/types';
import { CalculatorDisplay } from '../components/CalculatorDisplay';
import { HistoryPanel } from '../components/HistoryPanel';
import { Keypad } from '../components/Keypad';
import { ScientificKeypad } from '../components/ScientificKeypad';
import { TopBar } from '../components/TopBar';
import { useCalculator } from '../hooks/useCalculator';
import { useHaptics } from '../hooks/useHaptics';
import { useHistory } from '../hooks/useHistory';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import type { CalculatorMode, ThemePreference } from '../storage/settingsStorage';
import type { HistoryEntry } from '../storage/historyStorage';

export function App() {
  const { settings, update } = useSettings();
  const history = useHistory();
  const [historyOpen, setHistoryOpen] = useState(false);

  useTheme(settings.theme);
  const vibrate = useHaptics(settings.haptics);

  const calculator = useCalculator({
    angleMode: settings.angleMode,
    onCommit: history.add,
  });

  const press = useCallback(
    (key: KeyId) => {
      vibrate();
      calculator.press(key);
    },
    [calculator, vibrate],
  );

  useKeyboard(press);

  const reuse = useCallback(
    (entry: HistoryEntry) => {
      // Restore the expression rather than the bare answer: the shadow result
      // shows the value immediately, and the sum stays open for editing.
      calculator.restore(entry.expression);
      setHistoryOpen(false);
    },
    [calculator],
  );

  return (
    <div className={`app app--${settings.mode}`}>
      <TopBar
        mode={settings.mode}
        theme={settings.theme}
        onModeChange={(mode: CalculatorMode) => update({ mode })}
        onThemeChange={(theme: ThemePreference) => update({ theme })}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <main className="app__main">
        <CalculatorDisplay
          expression={calculator.expression}
          preview={calculator.preview}
          committed={calculator.committed}
          error={calculator.error}
        />

        {settings.mode === 'scientific' && (
          <ScientificKeypad
            onPress={press}
            angleMode={settings.angleMode}
            onAngleModeChange={(angleMode: AngleMode) => update({ angleMode })}
          />
        )}
        <Keypad onPress={press} />
      </main>

      <HistoryPanel
        open={historyOpen}
        entries={history.entries}
        onClose={() => setHistoryOpen(false)}
        onReuse={reuse}
        onDelete={history.remove}
        onClear={history.clear}
      />
    </div>
  );
}
