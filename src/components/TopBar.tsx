import type { CalculatorMode, ThemePreference } from '../storage/settingsStorage';

interface TopBarProps {
  mode: CalculatorMode;
  theme: ThemePreference;
  onModeChange: (mode: CalculatorMode) => void;
  onThemeChange: (theme: ThemePreference) => void;
  onOpenHistory: () => void;
}

const THEME_ORDER: ThemePreference[] = ['system', 'dark', 'light'];
const THEME_GLYPH: Record<ThemePreference, string> = { system: '◐', dark: '☾', light: '☀' };

export function TopBar({
  mode,
  theme,
  onModeChange,
  onThemeChange,
  onOpenHistory,
}: TopBarProps) {
  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length] as ThemePreference;

  return (
    <header className="topbar">
      <div className="segmented" role="group" aria-label="Calculator mode">
        <button
          type="button"
          className={`segmented__option${mode === 'basic' ? ' segmented__option--active' : ''}`}
          onClick={() => onModeChange('basic')}
          aria-pressed={mode === 'basic'}
        >
          Basic
        </button>
        <button
          type="button"
          className={`segmented__option${mode === 'scientific' ? ' segmented__option--active' : ''}`}
          onClick={() => onModeChange('scientific')}
          aria-pressed={mode === 'scientific'}
        >
          Scientific
        </button>
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="chip chip--icon"
          onClick={() => onThemeChange(nextTheme)}
          aria-label={`Theme: ${theme}. Switch to ${nextTheme}.`}
        >
          <span aria-hidden="true">{THEME_GLYPH[theme]}</span>
        </button>
        <button
          type="button"
          className="chip chip--icon"
          onClick={onOpenHistory}
          aria-label="Open calculation history"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </header>
  );
}
