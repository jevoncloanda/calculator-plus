import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { CommittedResult } from '../calculator/session';

interface CalculatorDisplayProps {
  expression: string;
  preview: string | null;
  committed: CommittedResult | null;
  error: string | null;
}

/**
 * Preserve the large calculator type for ordinary sums, then progressively
 * reduce it before wrapped lines need to scroll.
 */
function expressionScale(length: number): string {
  if (length > 96) return '0.45';
  if (length > 68) return '0.54';
  if (length > 46) return '0.64';
  if (length > 28) return '0.76';
  if (length > 16) return '0.88';
  return '1';
}

/** Keep each typed number together while allowing an expression to wrap after operators. */
function renderExpression(expression: string) {
  return expression.split(/(\d[\d.,]*)/u).flatMap((part, partIndex) => {
    if (/^\d/u.test(part)) {
      return <span className="display__number" key={`number-${partIndex}`}>{part}</span>;
    }

    return Array.from(part).map((character, characterIndex) => (
      <Fragment key={`symbol-${partIndex}-${characterIndex}`}>
        {character}
        {/[+\-×÷^]/u.test(character) && <wbr />}
      </Fragment>
    ));
  });
}

export function CalculatorDisplay({
  expression,
  preview,
  committed,
  error,
}: CalculatorDisplayProps) {
  const expressionRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Keep the newest wrapped line in view while typing. Users can still scroll
  // upward to review earlier lines once the expression fills the display.
  useEffect(() => {
    const node = expressionRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [expression]);

  // Browser scrollbars can appear for small text-layout rounding gaps. Only
  // reveal one when there is enough hidden content to make scrolling useful.
  useLayoutEffect(() => {
    const node = expressionRef.current;
    if (!node) return;

    const checkOverflow = () => {
      setHasOverflow(node.scrollHeight - node.clientHeight > 8);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(node);
    return () => observer.disconnect();
  }, [expression]);

  const hasExpression = expression.length > 0;

  return (
    <section className={`display${committed ? ' display--committed' : ''}`} aria-label="Calculator display">
      <div
        ref={expressionRef}
        className={`display__expression${hasOverflow ? ' display__expression--scrollable' : ''}`}
        style={{ '--expression-scale': expressionScale(expression.length) } as CSSProperties}
        aria-label={hasExpression ? `Expression ${expression}` : 'No expression'}
      >
        {hasExpression ? renderExpression(expression) : '0'}
      </div>

      <div className="display__secondary" role="status" aria-live="polite">
        {error ? (
          <span className="display__error">{error}</span>
        ) : committed ? (
          <span className="display__result" aria-label={`Result ${committed.result}`}>
            {committed.result}
          </span>
        ) : preview ? (
          <span className="display__preview" aria-label={`Preview result ${preview}`}>
            <span className="display__equals" aria-hidden="true">
              =
            </span>
            {preview}
          </span>
        ) : (
          <span className="display__placeholder" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
