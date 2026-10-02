import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as tip from '../tip.js';
import {
  calculate,
  formatCents,
  validateBill,
  validateInputs,
  validatePeople,
  validateTipPercent,
  LIMITS,
  MESSAGES,
  PLACEHOLDER,
} from '../tip.js';

function expectOk(result) {
  assert.equal(result.ok, true, `expected ok result, got ${JSON.stringify(result)}`);
  return result;
}

function assertSafeCents(result) {
  for (const key of ['billCents', 'tipCents', 'totalCents', 'perPersonCents', 'people']) {
    assert.ok(Number.isSafeInteger(result[key]), `${key} must be a safe integer, got ${result[key]}`);
    assert.ok(result[key] >= 0, `${key} must not be negative`);
  }
}

test('documented example: bill 100, 15%, 3 people', () => {
  const r = expectOk(calculate({ bill: '100', tipPercent: '15', people: '3' }));
  assert.equal(r.billCents, 10000);
  assert.equal(r.tipCents, 1500);
  assert.equal(r.totalCents, 11500);
  assert.equal(r.perPersonCents, 3834);
  assert.equal(r.people, 3);
});

test('documented example: bill 50, 20%, 2 people', () => {
  const r = expectOk(calculate({ bill: '50', tipPercent: '20', people: '2' }));
  assert.equal(r.tipCents, 1000);
  assert.equal(r.totalCents, 6000);
  assert.equal(r.perPersonCents, 3000);
});

test('documented example: bill 10.00, 15%, 1 person', () => {
  const r = expectOk(calculate({ bill: '10.00', tipPercent: '15', people: '1' }));
  assert.equal(r.tipCents, 150);
  assert.equal(r.totalCents, 1150);
  assert.equal(r.perPersonCents, 1150);
});

test('bill 33.33 at 15% rounds tip half-up to 500 cents', () => {
  const r = expectOk(calculate({ bill: '33.33', tipPercent: '15', people: '1' }));
  assert.equal(r.billCents, 3333);
  assert.equal(r.tipCents, 500);
  assert.equal(r.totalCents, 3833);
});

test('half-up rounding boundaries', () => {
  // 0.10 * 5% = 0.5 cents -> rounds up to 1
  assert.equal(expectOk(calculate({ bill: '0.10', tipPercent: '5', people: '1' })).tipCents, 1);
  // 0.09 * 5% = 0.45 cents -> rounds down to 0
  assert.equal(expectOk(calculate({ bill: '0.09', tipPercent: '5', people: '1' })).tipCents, 0);
  // 0.30 * 15% = 4.5 cents -> 5 (float math 0.3*0.15 would give 4.4999...)
  assert.equal(expectOk(calculate({ bill: '0.30', tipPercent: '15', people: '1' })).tipCents, 5);
  // 1.005 style artifact: 1.15 * 10% = 11.5 cents -> 12
  assert.equal(expectOk(calculate({ bill: '1.15', tipPercent: '10', people: '1' })).tipCents, 12);
  // decimal tip percentage: 100.00 * 12.5% = 1250 cents
  assert.equal(expectOk(calculate({ bill: '100', tipPercent: '12.5', people: '1' })).tipCents, 1250);
});

test('0% tip is allowed', () => {
  const r = expectOk(calculate({ bill: '20', tipPercent: '0', people: '2' }));
  assert.equal(r.tipCents, 0);
  assert.equal(r.totalCents, 2000);
  assert.equal(r.perPersonCents, 1000);
});

test('total 100.00 split among 3 rounds up to 33.34', () => {
  const r = expectOk(calculate({ bill: '100', tipPercent: '0', people: '3' }));
  assert.equal(r.perPersonCents, 3334);
});

test('accepts numeric inputs as well as strings', () => {
  const r = expectOk(calculate({ bill: 100, tipPercent: 15, people: 3 }));
  assert.equal(r.perPersonCents, 3834);
});

test('accepts whitespace and common decimal forms', () => {
  assert.equal(expectOk(validateBill(' 84.50 ')).cents, 8450);
  assert.equal(expectOk(validateBill('84.5')).cents, 8450);
  assert.equal(expectOk(validateBill('.5')).cents, 50);
  assert.equal(expectOk(validateBill('7.')).cents, 700);
});

test('per-person coverage property holds across many valid inputs', () => {
  let seed = 12345;
  const next = (n) => {
    // Park-Miller LCG: products stay below 2^53, so every step is exact.
    seed = (seed * 48271) % 2147483647;
    return seed % n;
  };
  for (let i = 0; i < 5000; i += 1) {
    const billCents = 1 + next(LIMITS.maxBillCents);
    const bill = `${Math.floor(billCents / 100)}.${String(billCents % 100).padStart(2, '0')}`;
    const tipHundredths = next(LIMITS.maxTipPercent * 100 + 1);
    const tipPercent = `${Math.floor(tipHundredths / 100)}.${String(tipHundredths % 100).padStart(2, '0')}`;
    const people = 1 + next(LIMITS.maxPeople);
    const r = expectOk(calculate({ bill, tipPercent, people: String(people) }));
    assertSafeCents(r);
    assert.equal(r.billCents, billCents);
    assert.equal(r.totalCents, r.billCents + r.tipCents);
    const covered = r.perPersonCents * r.people;
    assert.ok(covered >= r.totalCents, `${bill} ${tipPercent}% / ${people}: under-covered`);
    assert.ok(covered - r.totalCents < r.people, `${bill} ${tipPercent}% / ${people}: excess too large`);
  }
});

test('upper limits are inclusive and stay exact', () => {
  const r = expectOk(calculate({ bill: '1000000', tipPercent: '1000', people: '100' }));
  assertSafeCents(r);
  assert.equal(r.tipCents, 1000000000);
  assert.equal(r.totalCents, 1100000000);
  assert.equal(r.perPersonCents, 11000000);
});

test('bill validation rejects empty, non-numeric, zero, negative, and malformed values', () => {
  for (const bad of ['', '   ', 'abc', '12abc', '0', '0.00', '-5', '-0.01', 'NaN', 'Infinity', '1e3', '1,000', null, undefined, NaN, Infinity, -1, 0, {}, []]) {
    const r = validateBill(bad);
    assert.equal(r.ok, false, `bill ${JSON.stringify(bad)} should be invalid`);
    assert.equal(typeof r.error, 'string');
    assert.match(r.error, /bill/i);
  }
  assert.equal(validateBill('').error, MESSAGES.bill.required);
  assert.equal(validateBill('-5').error, MESSAGES.bill.positive);
  assert.equal(validateBill('0').error, MESSAGES.bill.positive);
  assert.equal(validateBill('1.234').error, MESSAGES.bill.decimals);
  assert.equal(validateBill('1000000.01').error, MESSAGES.bill.max);
});

test('custom tip validation rejects empty, non-numeric, negative, and out-of-range values', () => {
  for (const bad of ['', 'abc', '-1', '-0.5', '15%x', 'Infinity', '1000.01', '5.555', null, undefined, NaN, -1]) {
    const r = validateTipPercent(bad);
    assert.equal(r.ok, false, `tip ${JSON.stringify(bad)} should be invalid`);
    assert.match(r.error, /tip/i);
  }
  assert.equal(validateTipPercent('-1').error, MESSAGES.tip.nonNegative);
  assert.equal(validateTipPercent('1000.01').error, MESSAGES.tip.max);
  assert.equal(expectOk(validateTipPercent('1000')).hundredths, 100000);
  assert.equal(expectOk(validateTipPercent('0')).hundredths, 0);
});

test('people validation rejects empty, zero, negative, fractional, and too-large values', () => {
  for (const bad of ['', '0', '-2', '2.5', '1.0', 'abc', '101', null, undefined, NaN, 2.5, 0, -1]) {
    const r = validatePeople(bad);
    assert.equal(r.ok, false, `people ${JSON.stringify(bad)} should be invalid`);
    assert.match(r.error, /people/i);
  }
  assert.equal(validatePeople('2.5').error, MESSAGES.people.whole);
  assert.equal(validatePeople('0').error, MESSAGES.people.whole);
  assert.equal(validatePeople('101').error, MESSAGES.people.max);
  assert.equal(expectOk(validatePeople('100')).people, 100);
});

test('validateInputs reports every invalid field with field-keyed messages', () => {
  const r = validateInputs({ bill: '', tipPercent: '-3', people: '2.5' });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['bill', 'people', 'tip']);
  assert.equal(r.errors.bill, MESSAGES.bill.required);
  assert.equal(r.errors.tip, MESSAGES.tip.nonNegative);
  assert.equal(r.errors.people, MESSAGES.people.whole);

  const partial = validateInputs({ bill: '10', tipPercent: '15', people: '0' });
  assert.deepEqual(Object.keys(partial.errors), ['people']);
});

test('calculate never returns numbers for invalid input', () => {
  const cases = [
    undefined,
    null,
    {},
    { bill: 'abc', tipPercent: '15', people: '3' },
    { bill: '100', tipPercent: 'x', people: '3' },
    { bill: '100', tipPercent: '15', people: '0' },
    { bill: -100, tipPercent: 15, people: 3 },
    { bill: Infinity, tipPercent: 15, people: 3 },
    { bill: 100, tipPercent: NaN, people: 3 },
    { bill: 100, tipPercent: 15, people: 1.5 },
  ];
  for (const input of cases) {
    const r = calculate(input);
    assert.equal(r.ok, false, `expected failure for ${JSON.stringify(input)}`);
    assert.equal(typeof r.errors, 'object');
    assert.ok(Object.keys(r.errors).length > 0);
    for (const key of ['billCents', 'tipCents', 'totalCents', 'perPersonCents']) {
      assert.equal(key in r, false, `${key} must not be present on invalid result`);
    }
  }
});

test('module exposes no unchecked calculation helper', () => {
  for (const [name, value] of Object.entries(tip)) {
    if (typeof value !== 'function' || name === 'formatCents') continue;
    const r = value(undefined, undefined, undefined);
    assert.equal(r.ok, false, `${name}(undefined) must return a structured failure`);
  }
});

test('formatCents always renders exactly two decimals or the placeholder', () => {
  assert.equal(formatCents(0), '0.00');
  assert.equal(formatCents(5), '0.05');
  assert.equal(formatCents(3834), '38.34');
  assert.equal(formatCents(11500), '115.00');
  assert.equal(formatCents(1100000000), '11000000.00');
  for (const bad of [NaN, Infinity, -1, 1.5, '12', undefined]) {
    assert.equal(formatCents(bad), PLACEHOLDER);
  }
});
