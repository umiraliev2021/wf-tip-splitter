# Non-functional requirements

## REQ-009 (must)

The layout is mobile-friendly and usable on small touch screens.

Acceptance:
- The page includes <meta name="viewport" content="width=device-width, initial-scale=1">
- At a 360px-wide viewport, all inputs, buttons and results are visible without horizontal scrolling
- Tip buttons and inputs have a touch target of at least 44×44 CSS px
- Layout stays usable at desktop widths (e.g. 1280px) without stretching controls across the full width

## REQ-010 (should)

Basic accessibility: every control has a label and results are announced.

Acceptance:
- Every input and button has an accessible name (label element or aria-label)
- The results region uses aria-live="polite" so updates are announced to screen readers
- All controls can be reached and used with the keyboard alone
