# Architecture

Tip Splitter is a dependency-free static single-page web app. A pure ES module validates normalized input and performs integer-cent calculations; a small DOM controller renders validation state and live results. Source files deploy directly to GitHub Pages.

## Stack

- HTML5
- CSS3
- Plain JavaScript ES modules
- Node.js built-in test runner (Node 18+)
- Playwright staging end-to-end tests
- GitHub Pages static hosting

## Components

- **Static page shell** — Provides semantic, labelled controls, result region, validation containers, and module entry point. (index.html)
- **Calculation domain module** — Validates bill, tip, and people inputs; converts money to integer cents; calculates rounded tip, total, and ceiling-rounded per-person amount without DOM access. (tip.js, test/tip.test.js)
- **UI controller** — Owns input event handling, quick-tip/custom-tip selection state, accessible validation rendering, and immediate result rendering. (app.js)
- **Responsive presentation** — Provides mobile-first layout, visible selected states, keyboard focus styles, and minimum touch target sizing. (styles.css)
- **Browser flow coverage** — Exercises primary quick-tip, custom-tip, and invalid-input journeys against the deployed static app. (e2e/tip-splitter.spec.mjs)
- **Delivery documentation** — Documents local serving, test execution, and GitHub Pages publication. (README.md)

## Invariants

- The shipped application remains a static site: no backend, API calls, accounts, persistence, build step, framework, or third-party runtime dependency.
- tip.js is a pure ES module with no window, document, DOM imports, or side effects.
- All monetary computation and displayed values are based on integer cents; formatting always produces exactly two decimal places.
- Tip cents are rounded half-up to the nearest cent; total cents equal bill cents plus tip cents; per-person cents use ceiling division so perPersonCents × people is at least totalCents.
- Invalid active input produces a field-specific accessible error and suppresses computed amounts with placeholders; NaN, Infinity, undefined, and negative monetary output are never rendered.
- Quick-tip selection and custom-tip entry are mutually exclusive sources of the active tip percentage.
- All runtime assets use relative paths so the app operates under a GitHub Pages project sub-path.
- Every interactive control has an accessible name, supports keyboard use, and has a minimum 44 by 44 CSS pixel target.
