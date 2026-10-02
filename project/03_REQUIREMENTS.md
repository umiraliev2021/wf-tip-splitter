# Requirements

## REQ-001 (functional, must)

The user can enter the bill amount as a decimal money value.

Acceptance:
- The page has a labelled bill amount input that accepts decimal values such as 84.50
- On mobile, the bill input brings up a numeric/decimal keypad (inputmode="decimal" or type="number")

Source: goal

## REQ-002 (functional, must)

The user can pick a tip percentage using quick buttons for 10%, 15% and 20%, or enter a custom percentage.

Acceptance:
- The page has three quick tip buttons labelled 10%, 15% and 20%
- Tapping a quick tip button makes that percentage active and marks the button as selected (visually and with aria-pressed or an equivalent)
- The page has a labelled custom tip percentage input; entering a value there makes it the active percentage and clears the quick-button selection
- Tapping a quick button after a custom value was entered switches the active percentage back to that button's value

Source: design-notes.md

## REQ-003 (functional, must)

The user can enter the number of people splitting the bill.

Acceptance:
- The page has a labelled number-of-people input that accepts whole numbers
- The input defaults to 1 when the page loads

Source: goal

## REQ-004 (functional, must)

The app computes and shows the tip amount, the total (bill + tip) and the amount each person pays, updating right away as inputs change, with no submit step.

Acceptance:
- Bill 100, tip 15%, 3 people shows tip 15.00, total 115.00 and per person 38.34
- Bill 50, tip 20%, 2 people shows tip 10.00, total 60.00 and per person 30.00
- Changing any input (typing in a field or tapping a tip button) updates all three outputs without pressing a submit/calculate button
- All displayed amounts show exactly two decimal places

Source: goal

## REQ-005 (functional, must)

Money is rounded to cents. Tip and total round to the nearest cent, and the per-person amount rounds UP to the next cent so that per-person × people ≥ total.

Acceptance:
- Bill 10.00, tip 15%, 1 person gives tip 1.50 and total 11.50
- Bill 33.33, tip 15% gives tip 5.00 (4.9995 rounded to nearest cent)
- Total 100.00 split among 3 people gives per person 33.34 (not 33.33)
- For any valid input, perPerson × people ≥ total and perPerson × people − total < 0.01 × people
- Calculations do not show floating-point artifacts (e.g. never 0.30000000000000004 or 38.333333)

Source: design-notes.md

## REQ-006 (functional, must)

Invalid input shows a clear, field-specific message and no computed amounts (no NaN, Infinity, negative or otherwise nonsense values).

Acceptance:
- An empty, non-numeric, zero or negative bill amount shows a message such as 'Enter a bill amount greater than 0' next to the bill field
- A negative or non-numeric custom tip percentage shows a message next to the tip field
- A number of people that is empty, 0, negative or not a whole number (e.g. 2.5) shows a message such as 'Number of people must be a whole number of 1 or more'
- While any input is invalid, the result area never shows 'NaN', 'Infinity', 'undefined' or negative amounts; it shows placeholders (e.g. '—') or is hidden
- Messages are linked to their inputs for screen readers (aria-describedby or aria-live) and disappear once the input is valid

Source: goal
