# Test strategy

Unit tests in test/tip.test.js run via node --test and cover validation, documented calculation examples, rounding boundaries, and cent-coverage properties. Static checks verify source structure and accessibility-critical markup. e2e/tip-splitter.spec.mjs imports test and expect from @playwright/test and covers quick tip, custom tip, invalid-to-valid recovery, keyboard-accessible controls, and a 360px viewport against staging.
