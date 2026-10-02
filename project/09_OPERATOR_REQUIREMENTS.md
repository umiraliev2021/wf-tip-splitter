# Operator requirements

- Access to (or creation of) the operator's GitHub repository and permission to push and turn on GitHub Pages for publishing

## Unknowns

- [low] Which currency symbol or locale formatting should amounts use? — assumption: Show plain amounts with two decimals and a '.' decimal separator, with no currency symbol (or a neutral '$' prefix only if the design needs one).
- [low] Is a 0% tip allowed, and is there an upper limit on the tip percentage? — assumption: 0% is allowed. Custom tips must be ≥ 0; values above 100% are allowed but no larger than 1000%, and anything higher shows a validation message.
- [low] Is there a maximum bill amount or number of people? — assumption: Bill up to 1,000,000 and people up to 100; values above these show a validation message.
- [low] Which tip should be selected when the page first loads? — assumption: 15% is preselected; the bill starts empty and people starts at 1.
- [low] How should a tip that falls exactly on half a cent be rounded? — assumption: Round half up (away from zero) to the nearest cent, using integer-cent arithmetic to avoid floating-point errors.
- [low] Should the app also show the rounding surplus (per-person × people − total)? — assumption: Not shown; only tip, total and per person are displayed.
