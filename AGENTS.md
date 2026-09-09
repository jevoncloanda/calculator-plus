# AGENTS.md

## Project

**Calculator+** — a polished, offline-first calculator PWA.

Primary purpose:

> Show the calculated result live before the user presses `=`.

The application targets iPhone first, with Android and desktop browser support.

---

## Tech Stack

- React
- TypeScript
- Vite
- PWA
- Modern CSS
- Browser local storage / IndexedDB

Keep the dependency footprint small.

Do not introduce a backend, authentication, analytics, ads, tracking, or paid APIs.

All calculator functionality must run locally on the device.

---

## Core Principles

1. **Live preview is the defining feature.**
2. Keep the UI simple and polished.
3. Prefer predictable calculator behavior.
4. Keep calculation logic completely separate from UI.
5. Do not over-engineer.
6. Do not add dependencies without a good reason.
7. Never use JavaScript `eval()` for expression evaluation.
8. Never allow normal calculator input to crash the application.
9. Test calculation logic before considering the feature complete.
10. The application must work offline after initial installation/load.

---

## Architecture

Prefer a structure similar to:

```text
src/
├── app/
├── components/
├── calculator/
├── hooks/
├── storage/
├── styles/
└── main.tsx
```

The exact structure may change if there is a clearly better solution.

Keep these concerns separate:

### UI

Responsible for:

- rendering
- user interaction
- animations
- responsive layout

### Calculator engine

Responsible for:

- tokenization
- parsing
- expression evaluation
- scientific functions
- percentage behavior
- numeric normalization

### Storage

Responsible for:

- calculation history
- user preferences
- settings persistence

---

## Calculator Engine Rules

Never put expression-parsing logic directly inside React components.

Use a dedicated calculation engine.

Never use:

```javascript
eval(...)
```

or equivalent unsafe dynamic execution.

The parser must support:

- `+`
- `-`
- `×`
- `÷`
- decimals
- negative numbers
- percentages
- parentheses
- operator precedence

Scientific mode must support:

- `sin`
- `cos`
- `tan`
- `asin`
- `acos`
- `atan`
- `log`
- `ln`
- `√`
- `x²`
- `xʸ`
- `x!`
- `1/x`
- absolute value
- `π`
- `e`
- DEG/RAD

---

## Live Shadow Result

This is the highest-priority UX requirement.

For an expression such as:

```text
125 × 48
```

show:

```text
125 × 48
= 6,000
```

before the user presses `=`.

The preview must:

- update immediately after input
- use the same evaluator as `=`
- respect operator precedence
- work in scientific mode
- handle decimals correctly
- disappear for incomplete/invalid expressions
- never crash
- never modify the expression

Example:

```text
12 + 35 × 8
```

must preview:

```text
292
```

not:

```text
376
```

The preview should be visually secondary to the expression.

Recommended treatment:

- main expression → high-contrast
- preview → smaller
- preview → subtle blue accent
- preview → prefixed with `=`

---

## Error Handling

Never expose implementation errors to users.

These must not crash:

```text
12 +
12 ×
12 ÷
(
)
1 ÷ 0
√(-1)
log(-1)
```

Return a controlled error/null state.

Incomplete expressions should generally have no shadow result.

---

## Number Formatting

Always present calculator results cleanly.

Examples:

```text
6000 → 6,000
1000000 → 1,000,000
5.000 → 5
2.500 → 2.5
0.30000000000000004 → 0.3
```

Avoid floating-point artifacts.

Do not blindly round every result to a fixed number of decimal places.

Preserve meaningful precision.

Avoid scientific notation for ordinary values unless necessary.

---

## State Management

Do not introduce Redux, Zustand, MobX, or another large state-management solution unless there is a demonstrated need.

Prefer:

- React state
- custom hooks
- context where genuinely useful

Keep state understandable.

---

## History

History is persistent and local.

Store:

- expression
- result
- timestamp

History must:

- survive reloads
- survive PWA restarts
- work offline
- support deleting individual entries
- support clearing all entries
- allow tapping an entry to reuse it

Never send calculation history to a server.

---

## Scientific Mode

Scientific mode should be accessible through a clear Basic/Scientific switch.

Do not cram every scientific function into the basic calculator layout.

Optimize for mobile usability.

Default angle mode:

```text
DEG
```

Allow:

```text
DEG ↔ RAD
```

The current mode must be clearly visible.

Scientific functions must work with the live shadow result.

---

## UI / UX

Design direction:

- iOS-inspired
- minimalist
- premium
- dark-mode-first
- clean
- responsive

Do not copy Apple's proprietary assets or branding.

Use:

- large readable numbers
- generous spacing
- rounded buttons
- subtle animations
- clear visual hierarchy

Avoid:

- unnecessary gradients
- excessive animations
- tiny buttons
- excessive UI chrome
- visual clutter

---

## Mobile Requirements

Primary targets:

- iPhone Safari
- installed iOS PWA
- Android Chrome

Support:

- small phones
- large phones
- different aspect ratios
- iPhone safe areas
- notch
- Dynamic Island
- home indicator

Use:

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

where appropriate.

Never hard-code a specific phone resolution.

Prevent:

- overflow
- clipped expressions
- clipped buttons
- accidental text selection
- accidental browser zoom where appropriate

---

## PWA

The application must be installable.

Configure:

- `manifest.json`
- service worker
- app icons
- theme color
- background color
- standalone display mode
- viewport metadata

The installed PWA should feel like an application rather than a normal website.

After initial installation/load, the calculator must continue working offline.

---

## Haptics

Implement subtle haptic feedback where browser/device support allows it.

Treat haptics as progressive enhancement.

Never make functionality dependent on haptic APIs.

If iOS does not expose the required API, gracefully continue without haptics.

---

## Keyboard

Support desktop keyboard input.

At minimum:

```text
0-9
+
-
*
/
.
Enter
Backspace
Escape
%
```

Mappings:

```text
Enter → =
Backspace → delete
Escape → AC
```

---

## Accessibility

Use semantic HTML/buttons.

Provide accessible labels.

Examples:

```text
× → Multiply
÷ → Divide
= → Equals
AC → Clear
```

Maintain adequate contrast and touch-target sizes.

Do not rely solely on color to communicate state.

---

## Testing

The calculator engine must have automated tests.

At minimum test:

```text
2 + 2 = 4
10 - 3 = 7
5 × 6 = 30
20 ÷ 4 = 5

12 + 35 × 8 = 292

0.1 + 0.2 = 0.3

1 ÷ 0 → controlled error

√144 = 12
2^10 = 1024

sin(30) = 0.5 in DEG
sin(π / 6) = 0.5 in RAD

log(100) = 2
ln(e) = 1

5! = 120
```

Also test malformed input.

Test the live preview independently from the equals/commit behavior.

Test history persistence.

Test number formatting.

---

## Development Workflow

When given a task:

1. Inspect the existing repository before modifying it.
2. Understand the current architecture.
3. Reuse existing code when appropriate.
4. Make the smallest clean change that solves the problem.
5. Keep calculation logic independent from UI.
6. Add/update tests for calculation behavior.
7. Run TypeScript checks.
8. Run tests.
9. Run the production build.
10. Fix errors before finishing.

Do not stop at scaffolding.

Do not claim a feature works without actually testing it where practical.

---

## Dependency Policy

Before adding a package, ask:

> Can this be implemented cleanly with the existing platform/browser/React APIs?

If yes, prefer the built-in solution.

Avoid large dependencies for small functionality.

Every dependency should have a clear reason.

---

## Code Quality

Prefer:

- TypeScript strictness
- small focused functions
- meaningful names
- pure calculator functions
- explicit types
- readable components

Avoid:

- giant React components
- duplicated calculator logic
- magic numbers
- unnecessary abstractions
- premature optimization

Do not rewrite unrelated code.

---

## Git Safety

Do not:

- delete unrelated files
- reset user changes
- rewrite project history
- overwrite existing work without understanding it

Before making destructive changes, inspect the repository state.

Preserve existing user work.

---

## Agent Autonomy

Act as an autonomous coding agent.

For ordinary implementation decisions:

- do not repeatedly ask for confirmation
- choose the simplest reasonable solution
- implement it
- test it
- fix issues

Only ask the user when a decision genuinely requires user input or when blocked by an external resource that cannot be resolved locally.

---

## Priority

When requirements compete, use this priority:

1. Correctness
2. Live shadow result
3. Calculator usability
4. Scientific calculator
5. History
6. Offline/PWA functionality
7. Responsive mobile UI
8. Accessibility
9. Haptics
10. Visual polish
11. Nice-to-have features

Never sacrifice calculator correctness for visual polish.

---

## Definition of Done

Before declaring the project complete, verify:

```text
✓ Basic calculator works
✓ Live shadow result works
✓ Operator precedence works
✓ Decimal arithmetic works
✓ Percentage works
✓ Scientific mode works
✓ DEG/RAD works
✓ History persists
✓ History can be cleared
✓ History entries can be reused
✓ PWA installs
✓ Offline mode works
✓ iPhone safe areas work
✓ Android layout works
✓ Desktop keyboard works
✓ No TypeScript errors
✓ Tests pass
✓ Production build succeeds
✓ No obvious console errors
✓ No obvious mobile overflow
```

---

## Final Product Principle

Calculator+ exists because:

> **It shows you the answer before you press equals.**

Keep that experience at the center of every implementation decision.