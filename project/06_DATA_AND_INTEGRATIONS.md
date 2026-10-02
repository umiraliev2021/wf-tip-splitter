# Data and integrations

## Data model

Transient browser state only: billInput (string), activeTipSource ('quick' or 'custom'), activeTipPercent (string/number), and peopleInput (string). The pure module returns either field-keyed validation errors or integer-cent values {billCents, tipCents, totalCents, perPersonCents, people}. No data is persisted or transmitted.

## Integrations

- GitHub Pages serves repository files as static assets.
- Node.js built-in test runner executes unit tests locally and in CI without package installation.
- Playwright runs end-to-end specifications against the Factory-provided staging deployment.

## External dependencies

- GitHub Pages (static hosting)
- Node.js with the built-in test runner (`node --test`, Node 18+) for unit tests
