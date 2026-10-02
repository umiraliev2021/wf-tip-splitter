import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  INITIAL_STATE,
  QUICK_TIPS,
  activeTipPercent,
  deriveView,
  selectCustomTip,
  selectQuickTip,
} from '../app.js';
import { MESSAGES, PLACEHOLDER } from '../tip.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

function attrsOf(id) {
  const match = new RegExp(`<[a-z]+[^>]*\\bid="${id}"[^>]*>`, 's').exec(html);
  assert.ok(match, `element #${id} must exist`);
  return match[0];
}

test('initial state: people defaults to 1 and a single quick tip is active', () => {
  assert.equal(INITIAL_STATE.people, '1');
  assert.equal(INITIAL_STATE.customTip, '');
  assert.ok(QUICK_TIPS.includes(INITIAL_STATE.quickTip));
  assert.deepEqual(QUICK_TIPS, ['10', '15', '20']);
});

test('documented examples render two-decimal amounts', () => {
  const a = deriveView({ ...INITIAL_STATE, bill: '100', quickTip: '15', people: '3' });
  assert.deepEqual(a, { errors: {}, tip: '15.00', total: '115.00', perPerson: '38.34' });
  const b = deriveView({ ...INITIAL_STATE, bill: '50', quickTip: '20', people: '2' });
  assert.deepEqual(b, { errors: {}, tip: '10.00', total: '60.00', perPerson: '30.00' });
});

test('typing a custom tip clears the quick selection and becomes active', () => {
  const state = selectCustomTip({ ...INITIAL_STATE, bill: '100', quickTip: '20' }, '18');
  assert.equal(state.quickTip, null);
  assert.equal(activeTipPercent(state), '18');
  assert.equal(deriveView(state).tip, '18.00');
});

test('clicking a quick tip after a custom value resumes that percentage and clears custom', () => {
  const custom = selectCustomTip({ ...INITIAL_STATE, bill: '100' }, '18');
  const state = selectQuickTip(custom, '10');
  assert.equal(state.quickTip, '10');
  assert.equal(state.customTip, '');
  assert.equal(activeTipPercent(state), '10');
  assert.equal(deriveView(state).tip, '10.00');
});

test('invalid fields produce field-specific errors and placeholder results', () => {
  const view = deriveView(selectCustomTip({ bill: '0', quickTip: '15', customTip: '', people: '2.5' }, '-5'));
  assert.equal(view.errors.bill, MESSAGES.bill.positive);
  assert.equal(view.errors.tip, MESSAGES.tip.nonNegative);
  assert.equal(view.errors.people, MESSAGES.people.whole);
  assert.equal(view.tip, PLACEHOLDER);
  assert.equal(view.total, PLACEHOLDER);
  assert.equal(view.perPerson, PLACEHOLDER);
});

test('a single invalid field suppresses all amounts (no stale or partial values)', () => {
  for (const bad of [{ bill: '' }, { bill: 'abc' }, { people: '0' }, { people: '' }, { quickTip: null, customTip: '' }]) {
    const view = deriveView({ ...INITIAL_STATE, bill: '100', ...bad });
    assert.equal(Object.keys(view.errors).length, 1, JSON.stringify(bad));
    for (const key of ['tip', 'total', 'perPerson']) assert.equal(view[key], PLACEHOLDER);
  }
});

test('markup: labelled inputs with linked error messages', () => {
  for (const [id, mode] of [['bill', 'decimal'], ['custom-tip', 'decimal'], ['people', 'numeric']]) {
    const input = attrsOf(id);
    assert.match(input, new RegExp(`inputmode="${mode}"`));
    assert.match(input, new RegExp(`aria-describedby="[^"]*\\b${id}-error\\b`));
    assert.match(html, new RegExp(`<label[^>]*for="${id}"[^>]*>[^<]*\\S`));
    attrsOf(`${id}-error`);
  }
  assert.match(attrsOf('people'), /value="1"/);
});

test('markup: quick tip buttons labelled 10%, 15%, 20% with aria-pressed', () => {
  for (const pct of QUICK_TIPS) {
    assert.match(html, new RegExp(`<button[^>]*type="button"[^>]*data-tip="${pct}"[^>]*aria-pressed="(true|false)"[^>]*>\\s*${pct}%\\s*</button>`));
  }
  assert.doesNotMatch(html, /type="submit"/);
});

test('markup: polite live result region, viewport meta and relative assets', () => {
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /<script type="module" src="\.\/app\.js"><\/script>/);
  assert.doesNotMatch(html, /(src|href)="\//);
  for (const id of ['tip-amount', 'total-amount', 'per-person-amount']) attrsOf(id);
});

test('styles: 44px touch targets, constrained width, selected and focus states', () => {
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /min-width:\s*44px/);
  assert.match(css, /max-width:/);
  assert.match(css, /\[aria-pressed="true"\]/);
  assert.match(css, /:focus-visible/);
});
