# Decisions

## ADR-001 Use a dependency-free static HTML/CSS/ES-module application

**Context:** The product requires GitHub Pages hosting, no backend, no build step, and minimal operational overhead.

**Decision:** Ship index.html, styles.css, app.js, and tip.js directly; use native browser ES modules and no framework, bundler, or runtime dependency.

**Consequences:** Deployment is copy-free and works from any static server. Browser support must include native modules; functionality remains intentionally small and client-only.

## ADR-002 Keep calculations in a pure integer-cent domain module

**Context:** Financial rounding must avoid binary floating-point artifacts and must be unit-testable with node --test.

**Decision:** Parse permitted decimal money input into cents, round tip half-up in integer arithmetic, and calculate per-person share using integer ceiling division. Export validation and calculation functions from tip.js without window or document references.

**Consequences:** Results are deterministic and testable without a browser. Input parsing and bounded-value rules must be explicit, including the documented limits.

## ADR-003 Use immediate input-driven rendering with accessible error state

**Context:** Users must receive results without submission and must receive field-specific feedback instead of invalid numeric output.

**Decision:** Attach input/click handlers that recalculate on every change, connect field messages using aria-describedby, and expose results through an aria-live polite region. Render placeholders while any required active input is invalid.

**Consequences:** No submit action is needed. The UI controller must preserve quick-tip versus custom-tip selection semantics and never render partial invalid calculations.

## ADR-004 Use mobile-first CSS and semantic native controls

**Context:** The primary use case is a phone-sized touch screen, while keyboard and desktop use remain required.

**Decision:** Constrain content width, use responsive CSS, native inputs/buttons, visible focus styles, and at least 44 by 44 CSS pixel interactive targets.

**Consequences:** The design remains small and accessible without a component library; CSS must be checked at narrow and wide viewport sizes.

## ADR-005 Separate unit and staging-browser verification

**Context:** Pure arithmetic needs fast deterministic coverage, while DOM wiring and deployed-path behavior require a real browser.

**Decision:** Use node --test for tip.js and a standalone Playwright ES module for end-to-end flows, with relative URLs resolved from Playwright baseURL.

**Consequences:** Unit gates run offline with no install. The Factory executes browser tests against staging, avoiding a local browser/server requirement in deterministic gates.
