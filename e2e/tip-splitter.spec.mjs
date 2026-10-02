// Staging-browser coverage for the primary Tip Splitter journeys (FLOW-01..03).
// Navigation is relative ('./') so it resolves against Playwright's baseURL,
// including GitHub Pages project sub-paths (baseURL must end with '/').
import { test, expect } from '@playwright/test';

const PLACEHOLDER = '—';

function controls(page) {
  return {
    bill: page.getByLabel('Bill amount'),
    customTip: page.getByLabel('Custom tip %'),
    people: page.getByLabel('Number of people'),
    quick: (percent) => page.getByRole('button', { name: `${percent}%`, exact: true }),
    billError: page.locator('#bill-error'),
    tipError: page.locator('#custom-tip-error'),
    peopleError: page.locator('#people-error'),
    tip: page.locator('#tip-amount'),
    total: page.locator('#total-amount'),
    perPerson: page.locator('#per-person-amount'),
  };
}

async function expectResults(ui, tip, total, perPerson) {
  await expect(ui.tip).toHaveText(tip);
  await expect(ui.total).toHaveText(total);
  await expect(ui.perPerson).toHaveText(perPerson);
}

async function expectPlaceholders(ui) {
  await expectResults(ui, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER);
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'Tip Splitter' })).toBeVisible();
});

test('FLOW-01 quick tip splits a bill immediately', async ({ page }) => {
  const ui = controls(page);

  await ui.bill.fill('100');
  await ui.quick(10).click();
  await expect(ui.quick(10)).toHaveAttribute('aria-pressed', 'true');
  await ui.quick(15).click();
  await expect(ui.quick(15)).toHaveAttribute('aria-pressed', 'true');
  await expect(ui.quick(10)).toHaveAttribute('aria-pressed', 'false');
  await expect(ui.quick(20)).toHaveAttribute('aria-pressed', 'false');
  await ui.people.fill('3');

  await expectResults(ui, '15.00', '115.00', '38.34');
  await expect(ui.billError).toBeHidden();
  await expect(ui.peopleError).toBeHidden();
});

test('FLOW-02 custom tip deselects quick tips and a later quick tip takes precedence', async ({ page }) => {
  const ui = controls(page);

  await ui.bill.fill('100');
  await ui.people.fill('4');
  await expect(ui.quick(15)).toHaveAttribute('aria-pressed', 'true');

  await ui.customTip.fill('18');
  for (const percent of [10, 15, 20]) {
    await expect(ui.quick(percent)).toHaveAttribute('aria-pressed', 'false');
  }
  await expectResults(ui, '18.00', '118.00', '29.50');

  await ui.quick(20).click();
  await expect(ui.quick(20)).toHaveAttribute('aria-pressed', 'true');
  await expect(ui.quick(10)).toHaveAttribute('aria-pressed', 'false');
  await expect(ui.quick(15)).toHaveAttribute('aria-pressed', 'false');
  await expect(ui.customTip).toHaveValue('');
  await expectResults(ui, '20.00', '120.00', '30.00');
});

test('FLOW-03 invalid bill shows a bill-specific message and recovers after correction', async ({ page }) => {
  const ui = controls(page);

  await ui.people.fill('3');
  await ui.bill.fill('abc');
  await expect(ui.billError).toBeVisible();
  await expect(ui.billError).toHaveText('Bill amount must be a number, e.g. 84.50');
  await expect(ui.bill).toHaveAttribute('aria-invalid', 'true');
  await expect(ui.bill).toHaveAttribute('aria-describedby', 'bill-error');
  await expect(ui.peopleError).toBeHidden();
  await expect(ui.tipError).toBeHidden();
  await expectPlaceholders(ui);

  await ui.bill.fill('-5');
  await expect(ui.billError).toHaveText('Enter a bill amount greater than 0');
  await expectPlaceholders(ui);

  await ui.bill.fill('100');
  await expect(ui.billError).toBeHidden();
  await expect(ui.bill).not.toHaveAttribute('aria-invalid', 'true');
  await expectResults(ui, '15.00', '115.00', '38.34');
});

test('FLOW-03 invalid people count shows a people-specific message and recovers after correction', async ({ page }) => {
  const ui = controls(page);

  await ui.bill.fill('100');
  for (const invalid of ['0', '2.5']) {
    await ui.people.fill(invalid);
    await expect(ui.peopleError).toBeVisible();
    await expect(ui.peopleError).toHaveText('Number of people must be a whole number of 1 or more');
    await expect(ui.people).toHaveAttribute('aria-invalid', 'true');
    await expect(ui.billError).toBeHidden();
    await expectPlaceholders(ui);
  }

  await ui.people.fill('2');
  await expect(ui.peopleError).toBeHidden();
  await expect(ui.people).not.toHaveAttribute('aria-invalid', 'true');
  await expectResults(ui, '15.00', '115.00', '57.50');
});

test('FLOW-03 invalid custom tip shows a tip-specific message and recovers after correction', async ({ page }) => {
  const ui = controls(page);

  await ui.bill.fill('100');
  await ui.people.fill('3');
  await ui.customTip.fill('-10');
  await expect(ui.tipError).toBeVisible();
  await expect(ui.tipError).toHaveText('Tip percentage must be 0 or more');
  await expect(ui.customTip).toHaveAttribute('aria-invalid', 'true');
  await expectPlaceholders(ui);

  await ui.customTip.fill('10');
  await expect(ui.tipError).toBeHidden();
  await expectResults(ui, '10.00', '110.00', '36.67');
});

test.describe('mobile 360px viewport', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('has no horizontal overflow and is operable by keyboard', async ({ page }) => {
    const ui = controls(page);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
    }));
    expect(overflow.clientWidth).toBe(360);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

    await ui.bill.focus();
    await page.keyboard.type('100');
    await page.keyboard.press('Tab');
    await expect(ui.quick(10)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(ui.quick(10)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Tab');
    await expect(ui.quick(15)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(ui.quick(15)).toHaveAttribute('aria-pressed', 'true');
    await expect(ui.quick(10)).toHaveAttribute('aria-pressed', 'false');
    await expectResults(ui, '15.00', '115.00', '115.00');

    for (const control of [ui.bill, ui.quick(10), ui.quick(15), ui.quick(20), ui.customTip, ui.people]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    const afterInput = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(afterInput).toBeLessThanOrEqual(360);
  });
});
