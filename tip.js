// Pure tip calculation domain module. No DOM access, no side effects.
// All money is handled as integer cents; percentages as integer hundredths of a percent.

export const LIMITS = Object.freeze({
  maxBillCents: 100000000, // 1,000,000.00
  maxTipPercent: 1000,
  maxPeople: 100,
});

export const MESSAGES = Object.freeze({
  bill: Object.freeze({
    required: 'Enter a bill amount greater than 0',
    invalid: 'Bill amount must be a number, e.g. 84.50',
    positive: 'Enter a bill amount greater than 0',
    decimals: 'Bill amount can have at most 2 decimal places',
    max: 'Bill amount must be 1,000,000 or less',
  }),
  tip: Object.freeze({
    required: 'Enter a tip percentage of 0 or more',
    invalid: 'Tip percentage must be a number, e.g. 18',
    nonNegative: 'Tip percentage must be 0 or more',
    decimals: 'Tip percentage can have at most 2 decimal places',
    max: 'Tip percentage must be 1000 or less',
  }),
  people: Object.freeze({
    required: 'Number of people must be a whole number of 1 or more',
    whole: 'Number of people must be a whole number of 1 or more',
    max: 'Number of people must be 100 or less',
  }),
});

export const PLACEHOLDER = '—';

const DECIMAL_PATTERN = /^(\d*)(?:\.(\d*))?$/;
const NEGATIVE_PATTERN = /^-\s*(?:\d+\.?\d*|\.\d+)$/;

function toTrimmedString(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null;
  return null;
}

// Parses a non-negative decimal string into an integer scaled by 100
// (cents for money, hundredths for percentages) without floating-point math.
function parseScaled(text, messages) {
  if (text === null) return { ok: false, error: messages.invalid };
  if (text === '') return { ok: false, error: messages.required };
  if (NEGATIVE_PATTERN.test(text)) return { ok: false, error: messages.negative };
  const match = DECIMAL_PATTERN.exec(text);
  if (!match || (match[1] === '' && !match[2])) return { ok: false, error: messages.invalid };
  const whole = match[1].replace(/^0+(?=\d)/, '') || '0';
  const fraction = match[2] || '';
  if (fraction.length > 2) return { ok: false, error: messages.decimals };
  // Reject absurdly long inputs before converting so the integer stays exact.
  if (whole.length > 12) return { ok: false, error: messages.max };
  return { ok: true, scaled: Number(whole) * 100 + Number(fraction.padEnd(2, '0')) };
}

export function validateBill(value) {
  const m = MESSAGES.bill;
  const parsed = parseScaled(toTrimmedString(value), { ...m, negative: m.positive });
  if (!parsed.ok) return parsed;
  if (parsed.scaled === 0) return { ok: false, error: m.positive };
  if (parsed.scaled > LIMITS.maxBillCents) return { ok: false, error: m.max };
  return { ok: true, cents: parsed.scaled };
}

export function validateTipPercent(value) {
  const m = MESSAGES.tip;
  const parsed = parseScaled(toTrimmedString(value), { ...m, negative: m.nonNegative });
  if (!parsed.ok) return parsed;
  if (parsed.scaled > LIMITS.maxTipPercent * 100) return { ok: false, error: m.max };
  return { ok: true, hundredths: parsed.scaled };
}

export function validatePeople(value) {
  const m = MESSAGES.people;
  const text = toTrimmedString(value);
  if (text === '' || text === null) return { ok: false, error: m.required };
  if (!/^\d+$/.test(text)) return { ok: false, error: m.whole };
  const digits = text.replace(/^0+(?=\d)/, '');
  if (digits.length > 3 || Number(digits) > LIMITS.maxPeople) return { ok: false, error: m.max };
  const people = Number(digits);
  if (people < 1) return { ok: false, error: m.whole };
  return { ok: true, people };
}

// Validates raw { bill, tipPercent, people } input. Returns either
// { ok: true, billCents, tipHundredths, people } or { ok: false, errors: { bill?, tip?, people? } }.
export function validateInputs(input) {
  const source = input && typeof input === 'object' ? input : {};
  const bill = validateBill(source.bill);
  const tip = validateTipPercent(source.tipPercent);
  const people = validatePeople(source.people);
  const errors = {};
  if (!bill.ok) errors.bill = bill.error;
  if (!tip.ok) errors.tip = tip.error;
  if (!people.ok) errors.people = people.error;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, billCents: bill.cents, tipHundredths: tip.hundredths, people: people.people };
}

// Exact integer division helpers for non-negative safe integers.
function divideHalfUp(numerator, divisor) {
  const remainder = numerator % divisor;
  const quotient = (numerator - remainder) / divisor;
  return remainder * 2 >= divisor ? quotient + 1 : quotient;
}

function divideCeil(numerator, divisor) {
  const remainder = numerator % divisor;
  const quotient = (numerator - remainder) / divisor;
  return remainder > 0 ? quotient + 1 : quotient;
}

// Validates input and calculates tip, total, and ceiling-rounded per-person share in cents.
// Returns { ok: true, billCents, tipCents, totalCents, perPersonCents, people }
// or { ok: false, errors } — never NaN, Infinity, or negative amounts.
export function calculate(input) {
  const valid = validateInputs(input);
  if (!valid.ok) return valid;
  const { billCents, tipHundredths, people } = valid;
  // tip = bill * (hundredths / 100) / 100, rounded half-up to the cent.
  const tipCents = divideHalfUp(billCents * tipHundredths, 10000);
  const totalCents = billCents + tipCents;
  const perPersonCents = divideCeil(totalCents, people);
  return { ok: true, billCents, tipCents, totalCents, perPersonCents, people };
}

// Formats integer cents with exactly two decimals; returns PLACEHOLDER for anything else.
export function formatCents(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) return PLACEHOLDER;
  const fraction = cents % 100;
  return `${(cents - fraction) / 100}.${String(fraction).padStart(2, '0')}`;
}
