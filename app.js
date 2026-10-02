// UI controller: owns tip-source selection state and renders validation and results
// on every input. All arithmetic and validation is delegated to the pure tip.js module.
import { calculate, formatCents, PLACEHOLDER } from './tip.js';

export const QUICK_TIPS = Object.freeze(['10', '15', '20']);

// quickTip and customTip are mutually exclusive sources: quickTip is null while custom is active.
export const INITIAL_STATE = Object.freeze({ bill: '', quickTip: '15', customTip: '', people: '1' });

export function activeTipPercent(state) {
  return state.quickTip !== null ? state.quickTip : state.customTip;
}

export function selectQuickTip(state, percent) {
  return { ...state, quickTip: percent, customTip: '' };
}

export function selectCustomTip(state, value) {
  return { ...state, quickTip: null, customTip: value };
}

// Returns { errors: { bill?, tip?, people? }, tip, total, perPerson } with display strings.
export function deriveView(state) {
  const result = calculate({ bill: state.bill, tipPercent: activeTipPercent(state), people: state.people });
  if (!result.ok) {
    return { errors: result.errors, tip: PLACEHOLDER, total: PLACEHOLDER, perPerson: PLACEHOLDER };
  }
  return {
    errors: {},
    tip: formatCents(result.tipCents),
    total: formatCents(result.totalCents),
    perPerson: formatCents(result.perPersonCents),
  };
}

function init(doc) {
  const fields = {
    bill: doc.getElementById('bill'),
    tip: doc.getElementById('custom-tip'),
    people: doc.getElementById('people'),
  };
  const errorNodes = {
    bill: doc.getElementById('bill-error'),
    tip: doc.getElementById('custom-tip-error'),
    people: doc.getElementById('people-error'),
  };
  const outputs = {
    tip: doc.getElementById('tip-amount'),
    total: doc.getElementById('total-amount'),
    perPerson: doc.getElementById('per-person-amount'),
  };
  const quickButtons = Array.from(doc.querySelectorAll('[data-tip]'));

  let state = {
    ...INITIAL_STATE,
    bill: fields.bill.value,
    customTip: fields.tip.value,
    people: fields.people.value,
    quickTip: fields.tip.value === '' ? INITIAL_STATE.quickTip : null,
  };

  function render() {
    for (const button of quickButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.tip === state.quickTip));
    }
    if (fields.tip.value !== state.customTip) fields.tip.value = state.customTip;

    const view = deriveView(state);
    for (const key of Object.keys(fields)) {
      const message = view.errors[key] || '';
      errorNodes[key].textContent = message;
      errorNodes[key].hidden = message === '';
      if (message) fields[key].setAttribute('aria-invalid', 'true');
      else fields[key].removeAttribute('aria-invalid');
    }
    outputs.tip.textContent = view.tip;
    outputs.total.textContent = view.total;
    outputs.perPerson.textContent = view.perPerson;
  }

  fields.bill.addEventListener('input', () => {
    state = { ...state, bill: fields.bill.value };
    render();
  });
  fields.people.addEventListener('input', () => {
    state = { ...state, people: fields.people.value };
    render();
  });
  fields.tip.addEventListener('input', () => {
    state = selectCustomTip(state, fields.tip.value);
    render();
  });
  for (const button of quickButtons) {
    button.addEventListener('click', () => {
      state = selectQuickTip(state, button.dataset.tip);
      render();
    });
  }

  render();
}

if (typeof document !== 'undefined') init(document);
