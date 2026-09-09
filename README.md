# Calculator+

A calculator that shows you the answer **before** you press equals.

Type `12 + 35 × 8` and the result — `292` — appears live beneath the expression,
in a subtle blue, updating on every keystroke. It is an offline-first PWA:
React + TypeScript + Vite, no backend, no accounts, no tracking.

## Commands

```bash
npm install
npm run dev        # dev server
npm test           # unit tests (vitest)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

`dist/` is a static site — deploy it to Cloudflare Pages, GitHub Pages, Netlify
or Vercel with no configuration. `base: './'` keeps asset paths relative so the
same build works at a domain root or in a subdirectory.

Icons are generated, not checked in by hand:

```bash
node scripts/generate-icons.mjs
```

## Structure

```text
src/
├── calculator/   pure engine — no React imports anywhere in here
│   ├── tokenizer.ts    display glyphs and keyboard ascii → tokens
│   ├── parser.ts       recursive descent → AST (never `eval`)
│   ├── evaluator.ts    AST → number, in DEG or RAD
│   ├── formatter.ts    number → "6,000", "0.3", "1e+21"
│   ├── expression.ts   pure editing rules for the expression string
│   ├── session.ts      the calculator's state machine, as a reducer
│   └── calculatorEngine.ts   `calculate()` and `preview()`
├── components/   presentation only
├── hooks/        React bindings around the engine and storage
├── storage/      localStorage wrappers (history, settings)
└── styles/       tokens.css (theme) + app.css (layout)
```

The engine has no dependency on React, and the components have no parsing logic.
`preview()` and `calculate()` call the same parser and evaluator, so the shadow
result can never disagree with what `=` produces.

## Implementation decisions

Where the spec left room, these are the choices made and why.

**Parsing.** Recursive descent over a token stream, producing an AST. Precedence
is expressed by the grammar itself (`additive → multiplicative → unary → power →
postfix → primary`), so `12 + 35 × 8` is 292 by construction. Every failure is a
`CalculatorError` carrying a user-facing message; nothing else escapes the
engine.

**Percentage.** Context-sensitive, matching physical calculators: `200 + 10%` is
220 (10% *of* 200), while `200 × 10%` is 20 (10% *as* 0.1). Only `+` and `−`
treat a trailing percent as relative to the left operand.

**Live preview and open brackets.** The preview closes unclosed brackets before
evaluating, so `sin(30` already previews `0.5` while you type. It never edits
what is on screen. A trailing operator (`25 +`) still yields no preview, and
neither does a bare number — there is no answer to reveal yet.

**Float artifacts.** Results are rounded to 12 significant digits before
display, which erases `0.30000000000000004` without flattening real precision
(`1 ÷ 3` shows `0.333333333333`). Exponent form is used only beyond 1e15 or
below 1e-9.

**Exact trigonometry on the degree grid.** In DEG mode, whole-degree multiples
of 90° are answered from a table, so `sin 180` is `0` rather than `1.2e-16`, and
`tan 90` reports "Undefined result" rather than `1.6e16`.

**`1/x` and `|x|`.** These wrap the operand you just entered — `5` then `1/x`
becomes `1÷(5)` — rather than opening an empty function call. Reusing the
existing division and `abs` grammar keeps the engine smaller.

**Reciprocal, square, factorial as text.** Everything the user builds is one
plain expression string using display glyphs (`×`, `÷`, `−`, `π`, `√(`). The
tokenizer accepts both those glyphs and their keyboard equivalents, so touch and
keyboard input converge on the same engine.

**State.** `sessionReducer` is a pure function of (state, key). This keeps a
burst of key presses folding in order instead of each one reading a stale
snapshot, and it makes the equals/commit behaviour testable without a DOM.
Recording history is a side effect of committing and lives in the hook, not the
reducer.

**History reuse.** Tapping an entry restores the *expression*, not just the
answer: the shadow result shows the value immediately and the sum stays open for
editing. Clearing all history asks for confirmation inline; deleting one entry
does not.

**Keypad layout.** `0` takes a single cell rather than spanning two, which gives
backspace a home next to it without crowding the classic 4×5 grid. Scientific
mode adds three rows of five above it, with a `2nd` toggle swapping sin/cos/tan
for their inverses and `x²`/`√` for `1/x`/`|x|`. DEG/RAD sits with the
trigonometry keys, where it is both visible and relevant.

**Dependencies.** React, and `vite-plugin-pwa` for the service worker and
manifest (dev-only; it contributes a small registration shim to the bundle).
Everything else — parsing, formatting, storage, icon generation, the sheet and
segmented controls — is written against platform APIs.

## Testing

```bash
npm test
```

Covers arithmetic and precedence, parentheses, unary and negative numbers,
percentage semantics, every scientific function in both angle modes, all the
error paths, number formatting, the expression editing rules, the session
reducer (including that `=` cannot double-record), preview behaviour separately
from commit, and history/settings persistence including corrupt and unavailable
storage.
