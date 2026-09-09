# Calculator+ — Autonomous Agent Build Specification

## 1. Objective

Build a polished, production-quality **Calculator+** Progressive Web App (PWA).

Calculator+ is a modern calculator designed around one key feature that the standard iPhone calculator lacks:

> **Show the calculated result live while the user is typing, before they press `=`.**

The app should feel like a premium native iPhone calculator while remaining a web application that can be installed to the iPhone/Android Home Screen.

This is primarily a personal project. It does NOT need App Store or Google Play Store distribution.

---

# 2. Technology Stack

Use:

- React
- TypeScript
- Vite
- PWA support
- Modern CSS
- Browser local storage / IndexedDB where appropriate

Do NOT use:

- Flutter
- React Native
- Next.js unless there is a compelling technical reason
- Backend services
- Authentication
- Remote database
- Analytics
- Ads
- Paid APIs

The application should be completely client-side.

All calculator calculations must happen locally on the device.

---

# 3. Deployment

The application should be deployable as a static website.

Preferred deployment:

**Cloudflare Pages**

Alternative:

- GitHub Pages
- Vercel
- Netlify

The application must work after being added to the iPhone Home Screen:

```text
Safari
  ↓
Open Calculator+
  ↓
Share
  ↓
Add to Home Screen
  ↓
Calculator+ appears as an app icon
```

Configure the PWA correctly so that:

- It has an application name of `Calculator+`
- It has a proper app icon
- It supports standalone display mode
- It supports iOS safe areas
- It supports Android installation
- It has a service worker
- Static assets are cached
- The core calculator continues working offline after the first successful load

---

# 4. Product Identity

Application name:

```text
Calculator+
```

Use this name consistently throughout the application.

Suggested package/project identifier:

```text
calculator-plus
```

Suggested PWA metadata:

```text
name: Calculator+
short_name: Calculator+
```

The visual identity should be:

- Minimal
- Premium
- Modern
- iOS-inspired
- Dark-mode-first
- Very clean
- No unnecessary decoration

Do NOT copy Apple's proprietary icons, graphics, or branding.

The goal is to create something that feels familiar to an iPhone user while still being its own application.

---

# 5. Core Features

Calculator+ V1 MUST contain:

### Standard calculator

- Addition
- Subtraction
- Multiplication
- Division
- Decimal
- Equals
- Clear
- Backspace
- +/- sign toggle
- Percentage

### Live shadow result

The defining feature.

### Calculation history

Persistent history stored locally.

### Scientific calculator

A scientific mode with common scientific functions.

### PWA installation

The application must behave like an installed mobile application.

### Offline support

The calculator must remain usable without an internet connection after initial installation/loading.

---

# 6. Main Calculator UX

The primary calculator should resemble a modern phone calculator.

Example:

```text
┌───────────────────────────────┐
│                               │
│                  125 × 48     │
│                               │
│                    = 6,000    │
│                               │
├───────────────────────────────┤
│    AC     ±      %      ÷     │
│    7      8      9      ×     │
│    4      5      6      −     │
│    1      2      3      +     │
│    0             .      =     │
└───────────────────────────────┘
```

The exact UI is up to the agent, but it should have excellent spacing and proportions on mobile.

---

# 7. LIVE SHADOW RESULT

This is the most important feature.

While the user types:

```text
125 × 48
```

the calculator should immediately display:

```text
125 × 48

= 6,000
```

WITHOUT pressing `=`.

Examples:

```text
25 + 15
→ = 40

120 × 3
→ = 360

999 ÷ 8
→ = 124.875

12 + 35 × 8
→ = 292
```

The shadow result should:

- update immediately after input
- use the same evaluator as `=`
- respect operator precedence
- disappear for invalid/incomplete expressions
- never crash
- never replace the user's expression
- remain visually secondary

Recommended visual treatment:

- Main expression: white/high-contrast
- Shadow result: slightly smaller
- Shadow result: subtle blue accent
- Prefix with `=` so the user understands it is a prediction/result

The user should immediately understand:

> Main expression = what I'm entering.
>
> Shadow result = what the calculator predicts.

---

# 8. Expression Engine

Create a dedicated calculation engine.

DO NOT put parsing/evaluation logic directly inside React components.

Recommended structure:

```text
src/
├── calculator/
│   ├── parser.ts
│   ├── evaluator.ts
│   ├── formatter.ts
│   ├── percentage.ts
│   └── constants.ts
```

The evaluator should support:

### Basic operators

```text
+
-
×
÷
```

### Operator precedence

For example:

```text
12 + 35 × 8
```

must equal:

```text
292
```

not:

```text
376
```

### Parentheses

Scientific mode should support:

```text
(2 + 3) × 4
```

### Decimal numbers

### Negative numbers

### Percentages

### Scientific functions

### Constants

At minimum:

```text
π
e
```

---

# 9. Parser Requirements

Do NOT use JavaScript `eval()`.

Use a safe deterministic parser.

Recommended approach:

- tokenizer
- recursive descent parser OR Shunting-yard algorithm
- AST or equivalent intermediate representation
- evaluator

The parser must gracefully handle:

```text
12 +
12 ×
12 ÷
(
)
```

and never crash.

For incomplete expressions:

```text
12 +
```

the shadow result can simply be hidden.

---

# 10. Number Formatting

Results must be human-readable.

Examples:

```text
6000
→ 6,000

1000000
→ 1,000,000

5.000
→ 5

2.500
→ 2.5

0.30000000000000004
→ 0.3
```

Avoid floating-point artifacts.

Do not show unnecessary trailing zeroes.

Avoid scientific notation for ordinary values unless the number is too large/small to display reasonably.

Handle very large and very small values gracefully.

---

# 11. Standard Calculator Buttons

Implement:

```text
AC
±
%
÷

7
8
9
×

4
5
6
−

1
2
3
+

0
.
=
```

Also provide backspace/delete.

Backspace should remove the most recently entered token/character in an intuitive way.

---

# 12. Calculation History

History is a REQUIRED V1 feature.

Every calculation committed with `=` should be recorded.

Example:

```text
Calculation History

12 + 35 × 8
292

125 × 48
6,000

100 ÷ 4
25
```

History should contain:

- expression
- result
- timestamp

Store history locally.

Do NOT require an account.

Do NOT send history to a server.

---

## History behavior

History should:

- persist after closing the browser
- persist after PWA restart
- persist offline
- survive normal app updates

Provide:

- clear all history
- delete individual history entries
- tap an old calculation to reuse it

When the user taps a history entry, restore the expression/result into the calculator.

Ask for confirmation before clearing ALL history.

---

# 13. Scientific Calculator

Scientific mode is REQUIRED.

There should be a clear way to switch between:

```text
Basic
Scientific
```

Do not make scientific buttons permanently consume the basic calculator's limited mobile screen space.

Possible approaches:

### Option A — Mode toggle

Basic:

```text
┌───────────────────────────────┐
│              125 × 48         │
│                 = 6,000       │
│                               │
│ AC  ±  %  ÷                   │
│ 7   8   9  ×                  │
│ 4   5   6  −                  │
│ 1   2   3  +                  │
│ 0      .     =                │
└───────────────────────────────┘
```

Scientific:

```text
┌───────────────────────────────┐
│                 sin(30)       │
│                       = 0.5   │
│                               │
│ sin cos tan   ln    log       │
│ √   x²   xʸ    π     e        │
│ (   )   ...                    │
│                               │
│             calculator keys   │
└───────────────────────────────┘
```

The agent may choose a better mobile UX.

---

# 14. Scientific Functions

At minimum implement:

### Trigonometry

```text
sin
cos
tan
```

### Inverse trigonometry

```text
asin
acos
atan
```

### Logarithms

```text
log
ln
```

### Powers

```text
x²
xʸ
```

### Roots

```text
√x
```

### Constants

```text
π
e
```

### Factorial

```text
x!
```

### Parentheses

```text
(
)
```

### Reciprocal

```text
1/x
```

### Absolute value

```text
|x|
```

---

# 15. DEG / RAD Mode

Scientific mode MUST support:

```text
DEG
RAD
```

Default:

```text
DEG
```

Allow the user to switch.

Examples:

```text
sin(30°) = 0.5
```

in DEG mode.

In RAD mode:

```text
sin(π/6) = 0.5
```

The current mode should be clearly visible.

---

# 16. Scientific Preview

The live shadow result MUST also work in scientific mode.

Examples:

```text
sin(30)
= 0.5
```

```text
√(144)
= 12
```

```text
2^10
= 1,024
```

```text
log(100)
= 2
```

The shadow evaluator must use exactly the same calculation engine as the committed `=` result.

---

# 17. Error Handling

Never crash.

Examples:

```text
1 ÷ 0
```

Display a friendly error such as:

```text
Error
```

or:

```text
Cannot divide by zero
```

Other invalid operations:

```text
√(-1)
log(-1)
```

should produce an understandable error.

Do not expose JavaScript stack traces or implementation errors to the user.

---

# 18. Responsive Design

The app MUST work well on:

- small iPhones
- large iPhones
- Android phones
- portrait orientation
- desktop browser for development/testing

Support:

- iPhone safe areas
- notch
- Dynamic Island
- home indicator
- different aspect ratios

Use CSS:

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

where appropriate.

Do NOT hard-code a specific phone resolution.

---

# 19. Touch UX

Buttons should have:

- clear pressed state
- subtle animation
- adequate touch targets
- no accidental text selection
- no browser context-menu behavior on long press where inappropriate

Prevent double-tap zoom where appropriate.

Use mobile-friendly touch behavior.

Support haptic feedback where the browser/device allows it.

Because iOS browser haptics have platform limitations, implement this as progressive enhancement.

The app must remain fully functional if haptics are unavailable.

---

# 20. Keyboard Support

Desktop/browser users should also be able to use:

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

Map:

```text
Enter → =
Escape → AC
Backspace → delete
```

This is useful during development and desktop testing.

---

# 21. PWA Requirements

Configure:

```text
manifest.json
service worker
icons
theme color
background color
display: standalone
```

Use an appropriate viewport configuration.

The application should open without browser chrome when launched from the Home Screen.

Provide correct icons for:

- Android
- iOS
- desktop/browser installation

Generate clean Calculator+ icons.

Do not use Apple's Calculator icon.

---

# 22. Offline Behavior

After initial load/install:

The calculator must work without internet.

The following must be available offline:

- Basic calculator
- Scientific calculator
- History
- Settings
- Formatting
- All calculator logic

The app must not depend on an API request to calculate anything.

---

# 23. Local Storage

Persist:

### Required

- Calculation history
- DEG/RAD preference
- Basic/scientific mode preference if appropriate
- Theme preference if implemented

Use local browser storage.

A lightweight abstraction is preferred:

```text
src/storage/
├── historyStorage.ts
└── settingsStorage.ts
```

If history becomes large, IndexedDB can be used instead of localStorage.

Do not over-engineer this.

---

# 24. Theme

Primary design:

**Dark mode**

Also support:

- Light mode

Prefer following system theme by default.

Possible setting:

```text
System
Light
Dark
```

The UI should remain visually consistent in all modes.

---

# 25. Accessibility

Implement:

- semantic buttons
- accessible labels
- adequate contrast
- keyboard navigation
- visible focus state on desktop
- screen-reader-friendly button names

Examples:

```text
× → "Multiply"
÷ → "Divide"
= → "Equals"
AC → "Clear"
```

Do not sacrifice the visual design for accessibility, but do not ignore accessibility either.

---

# 26. Suggested Project Structure

Use something approximately like:

```text
src/
├── app/
│   └── App.tsx
│
├── components/
│   ├── CalculatorDisplay.tsx
│   ├── CalculatorKeypad.tsx
│   ├── CalculatorButton.tsx
│   ├── ScientificKeypad.tsx
│   ├── HistoryPanel.tsx
│   ├── ModeToggle.tsx
│   └── SettingsPanel.tsx
│
├── calculator/
│   ├── tokenizer.ts
│   ├── parser.ts
│   ├── evaluator.ts
│   ├── formatter.ts
│   ├── calculatorEngine.ts
│   └── types.ts
│
├── hooks/
│   ├── useCalculator.ts
│   ├── useHistory.ts
│   └── useSettings.ts
│
├── storage/
│   ├── historyStorage.ts
│   └── settingsStorage.ts
│
├── styles/
│   └── ...
│
├── main.tsx
└── vite-env.d.ts
```

This is guidance, not a rigid requirement.

Keep the architecture simple.

---

# 27. State Model

The calculator state should conceptually contain:

```typescript
interface CalculatorState {
  expression: string;
  previewResult: string | null;
  committedResult: string | null;
  error: string | null;
  mode: "basic" | "scientific";
  angleMode: "deg" | "rad";
}
```

The implementation can differ if a better architecture is found.

The important principle:

**Expression evaluation must be deterministic and independent from UI rendering.**

---

# 28. Tests

Write unit tests for the calculation engine.

At minimum:

```text
2 + 2 = 4
10 - 3 = 7
5 × 6 = 30
20 ÷ 4 = 5

12 + 35 × 8 = 292

0.1 + 0.2 = 0.3

100 ÷ 0 → error

√144 = 12
2^10 = 1024

sin(30) = 0.5 in DEG
sin(π / 6) = 0.5 in RAD

log(100) = 2
ln(e) = 1

5! = 120
```

Test malformed expressions:

```text
12 +
12 ×
(
)
12 ÷ 0
```

No crashes.

Test preview separately:

```text
Input: 25 + 15
Preview: 40
```

and:

```text
Input: 25 +
Preview: null
```

Test history persistence.

Test number formatting.

---

# 29. Important Floating Point Requirement

JavaScript floating-point arithmetic can produce artifacts.

For example:

```text
0.1 + 0.2
```

must display:

```text
0.3
```

not:

```text
0.30000000000000004
```

Implement a sensible numeric normalization strategy.

Do not blindly round every result to an arbitrary number of decimal places.

Preserve meaningful precision.

---

# 30. History UX

The history should NOT permanently take up half the calculator screen.

Prefer one of:

- slide-out panel
- modal
- bottom sheet
- dedicated history screen

A history button should be easily accessible.

Example:

```text
Calculator+                         History
──────────────────────────────────────────

                    125 × 48
                     = 6,000

[calculator...]

```

When opened:

```text
History

Today

125 × 48
6,000

12 + 35 × 8
292

100 ÷ 4
25

                  Clear History
```

Keep it clean.

---

# 31. Scientific Mode UX

Scientific mode should not feel like a completely different application.

The user should be able to switch between:

```text
Basic   Scientific
```

without losing the current expression unnecessarily.

If the current expression can be preserved, preserve it.

Scientific controls should be organized logically.

Do not attempt to fit dozens of tiny buttons onto the screen.

Prioritize usability over maximizing the number of visible functions.

---

# 32. Animations

Use subtle animations only.

Good examples:

- button press scale
- preview result fade/update
- mode transition
- history panel slide

Avoid:

- excessive bouncing
- flashy gradients
- unnecessary particle effects
- distracting transitions

This is a calculator, not a game.

---

# 33. Performance

The calculator should feel instantaneous.

The live preview should update with essentially no noticeable delay.

Avoid:

- network calls
- expensive React re-renders
- unnecessary global state
- massive dependencies

A normal calculator expression should evaluate in milliseconds.

---

# 34. Security

No user data should leave the device.

Do not include:

- analytics
- tracking
- advertising SDKs
- external calculation APIs

Avoid unnecessary third-party dependencies.

---

# 35. Browser Compatibility

Primary target:

- iOS Safari
- Android Chrome

Also test:

- Chrome desktop
- Safari desktop if available

Gracefully handle unsupported browser APIs.

---

# 36. Development Process

Act as an autonomous coding agent.

Do NOT merely generate a plan.

Actually build the application.

Workflow:

1. Inspect the repository.
2. Determine whether a project already exists.
3. Initialize Vite/React/TypeScript if necessary.
4. Install only necessary dependencies.
5. Build the calculation engine.
6. Write tests.
7. Build the UI.
8. Implement live preview.
9. Implement scientific mode.
10. Implement history.
11. Implement PWA.
12. Implement offline support.
13. Polish mobile UX.
14. Run tests.
15. Run TypeScript checks.
16. Run production build.
17. Fix all errors.
18. Verify the generated production build.

Do not stop after scaffolding.

---

# 37. Definition of Done

Calculator+ V1 is complete only when:

### Calculator

- Basic arithmetic works.
- Operator precedence works.
- Decimals work.
- Negative numbers work.
- Percentage works.
- AC works.
- Backspace works.
- +/- works.
- Equals works.

### Live Preview

- Preview updates before `=`.
- Preview respects operator precedence.
- Preview works in scientific mode.
- Preview never crashes.
- Preview disappears for invalid/incomplete expressions.
- Preview is visually distinct from the committed result.

### Scientific

- sin
- cos
- tan
- asin
- acos
- atan
- log
- ln
- square
- power
- square root
- factorial
- reciprocal
- absolute value
- π
- e
- parentheses
- DEG/RAD

all work correctly.

### History

- Calculations are stored locally.
- History survives reload.
- History survives closing/reopening the PWA.
- Entries can be deleted.
- History can be cleared.
- Previous calculations can be reused.

### PWA

- Installable.
- Correct icon.
- Correct app name.
- Standalone mode.
- Offline support.
- Service worker works.
- iOS safe-area support.
- Android support.

### Quality

- TypeScript has no type errors.
- Tests pass.
- Production build succeeds.
- No console errors during normal use.
- No obvious UI overflow.
- Works on mobile screen sizes.
- Dark mode looks polished.
- Light mode works.
- Keyboard support works on desktop.

---

# 38. Priority Order

If implementation time becomes an issue, prioritize in this exact order:

1. Basic calculator
2. **Live shadow result**
3. Expression parser
4. Scientific calculator
5. History
6. PWA/offline
7. Mobile polish
8. Haptics
9. Theme customization
10. Nice-to-have gestures

Do not sacrifice the live preview feature.

---

# 39. Product Philosophy

Calculator+ should be extremely simple to understand.

The entire product can be summarized as:

> **A calculator that shows you the answer before you press equals.**

The scientific calculator and history make it more useful, but they should not overwhelm the primary experience.

When in doubt:

**Prefer simple, fast, polished, and predictable.**

Do not over-engineer.
Do not add unnecessary features.
Do not add a backend.
Do not add accounts.
Do not add ads.
Do not add subscriptions.

Build a calculator that feels exceptionally good to use.