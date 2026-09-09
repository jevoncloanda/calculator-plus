import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryEntry } from '../storage/historyStorage';

interface HistoryPanelProps {
  open: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onReuse: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function dayLabel(timestamp: number): string {
  const today = startOfDay(Date.now());
  const day = startOfDay(timestamp);
  if (day === today) return 'Today';
  if (day === today - DAY_MS) return 'Yesterday';
  const date = new Date(timestamp);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(
    undefined,
    sameYear
      ? { month: 'long', day: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' },
  );
}

/** Groups entries (already newest-first) under day headings. */
function groupByDay(entries: HistoryEntry[]): Array<[string, HistoryEntry[]]> {
  const groups: Array<[string, HistoryEntry[]]> = [];
  for (const entry of entries) {
    const label = dayLabel(entry.timestamp);
    const last = groups[groups.length - 1];
    if (last && last[0] === label) last[1].push(entry);
    else groups.push([label, [entry]]);
  }
  return groups;
}

export function HistoryPanel({
  open,
  entries,
  onClose,
  onReuse,
  onDelete,
  onClear,
}: HistoryPanelProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Closing always discards a pending confirmation, so the sheet never reopens
  // mid-question.
  const close = useCallback(() => {
    setConfirmingClear(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [open, close]);

  return (
    <div className={`sheet${open ? ' sheet--open' : ''}`} inert={!open}>
      <div className="sheet__scrim" aria-hidden="true" onClick={close} />
      <div className="sheet__panel" role="dialog" aria-modal="true" aria-label="Calculation history">
        <header className="sheet__header">
          <h2 className="sheet__title">History</h2>
          <button ref={closeRef} type="button" className="chip" onClick={close}>
            Done
          </button>
        </header>

        <div className="sheet__body">
          {entries.length === 0 ? (
            <p className="sheet__empty">Calculations you complete with = appear here.</p>
          ) : (
            groupByDay(entries).map(([label, group]) => (
              <section key={label} className="history__group">
                <h3 className="history__day">{label}</h3>
                <ul className="history__list">
                  {group.map((entry) => (
                    <li key={entry.id} className="history__item">
                      <button
                        type="button"
                        className="history__reuse"
                        onClick={() => onReuse(entry)}
                        aria-label={`Reuse ${entry.expression} equals ${entry.result}`}
                      >
                        <span className="history__expression">{entry.expression}</span>
                        <span className="history__result">{entry.result}</span>
                      </button>
                      <button
                        type="button"
                        className="history__delete"
                        onClick={() => onDelete(entry.id)}
                        aria-label={`Delete ${entry.expression}`}
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        {entries.length > 0 && (
          <footer className="sheet__footer">
            {confirmingClear ? (
              <>
                <span className="sheet__confirm">Delete all history?</span>
                <button type="button" className="chip" onClick={() => setConfirmingClear(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="chip chip--danger"
                  onClick={() => {
                    onClear();
                    setConfirmingClear(false);
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                className="chip chip--danger"
                onClick={() => setConfirmingClear(true)}
              >
                Clear History
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
