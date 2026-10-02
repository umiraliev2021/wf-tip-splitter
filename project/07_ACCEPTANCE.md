# Acceptance

## WU-001 Implement pure validation and cent-accurate calculation module

- node --test passes without npm install.
- Bill 100, 15%, 3 produces 1500 tip cents, 11500 total cents, and 3834 per-person cents.
- Bill 33.33 at 15% produces a 500-cent tip using half-up rounding.
- For valid values, perPersonCents * people >= totalCents and the excess is less than people cents.
- Validation rejects empty, non-numeric, zero, negative, fractional people, and invalid custom tips with field-specific messages.

Gates:
- `node --test`
- `node --check tip.js`
- `test ! -e package.json || true`

## WU-002 Build accessible responsive static Tip Splitter interface

- Bill amount is labelled and uses inputmode=decimal or a numeric input type.
- Quick buttons are labelled 10%, 15%, and 20%; selected button has visible state and aria-pressed=true.
- Typing a custom tip clears quick-button selection; clicking a quick button resumes that percentage as active.
- People input is labelled, defaults to 1, and accepts whole-number entry.
- Changing bill, tip source, custom tip, or people immediately renders tip, total, and per-person amounts with exactly two decimals.
- Each invalid field gets its own linked clear message and results show placeholders until all active inputs are valid.
- At a 360px viewport controls and results do not require horizontal scrolling, controls are at least 44px high and wide, and content width remains constrained on desktop.

Gates:
- `node --test`
- `node --check app.js`
- `node --check tip.js`
- `test -f index.html && test -f styles.css`
- `grep -Fq '<meta name="viewport" content="width=device-width, initial-scale=1">' index.html`
- `grep -Fq 'aria-live="polite"' index.html`
- `grep -Fq 'inputmode="decimal"' index.html`
- `grep -Fq 'aria-pressed' index.html`

## WU-003 Add Playwright end-to-end coverage for main user flows

- e2e/tip-splitter.spec.mjs parses with Node and imports test and expect from @playwright/test.
- The spec covers each named user flow using browser interactions and relative URLs.
- Quick-tip test asserts tip 15.00, total 115.00, and per-person 38.34 for bill 100 and 3 people.
- The custom-tip test verifies custom input deselects quick tips and a subsequent quick selection takes precedence.
- Invalid-state tests assert a field-specific message, placeholders rather than calculations, and immediate recovery after correction.
- The mobile flow checks a 360px viewport with no document horizontal overflow and verifies a keyboard-accessible control.

Gates:
- `node --check e2e/tip-splitter.spec.mjs`
- `grep -Fq 'import { test, expect } from "@playwright/test"' e2e/tip-splitter.spec.mjs || grep -Fq "import { test, expect } from '@playwright/test'" e2e/tip-splitter.spec.mjs`
- `grep -Fq 'page.goto(' e2e/tip-splitter.spec.mjs`
- `node --test`

## WU-004 Prepare GitHub Pages delivery documentation and static release checks

- README explains how to run python3 -m http.server, node --test, and GitHub Pages publication.
- Repository contains index.html, app.js, styles.css, tip.js, test/tip.test.js, and e2e/tip-splitter.spec.mjs.
- node --test passes with no npm install.
- index.html references local relative CSS and JS module assets.
- Documentation does not claim Pages has been enabled or code has been pushed without operator authorization.

Gates:
- `node --test`
- `node --check app.js`
- `node --check tip.js`
- `node --check e2e/tip-splitter.spec.mjs`
- `test -f README.md && test -f index.html && test -f styles.css && test -f app.js && test -f tip.js && test -f test/tip.test.js && test -f e2e/tip-splitter.spec.mjs`
- `grep -Fq 'python3 -m http.server' README.md`
- `grep -Fq 'node --test' README.md`
- `grep -Fq 'GitHub Pages' README.md`
- `! grep -R --include='*.html' --include='*.js' -E 'https?://' index.html app.js tip.js`
