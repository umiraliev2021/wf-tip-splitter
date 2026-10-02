import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');

test('required source files exist', () => {
  for (const file of ['index.html', 'app.js', 'styles.css', 'tip.js', 'test/tip.test.js', 'e2e/tip-splitter.spec.mjs']) {
    assert.ok(existsSync(fileURLToPath(new URL(file, root))), `${file} is missing`);
  }
});

test('index.html references local relative CSS and module JS assets', () => {
  const html = read('index.html');
  assert.match(html, /<link[^>]+rel="stylesheet"[^>]+href="\.\/styles\.css"/);
  assert.match(html, /<script[^>]+type="module"[^>]+src="\.\/app\.js"/);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    assert.doesNotMatch(url, /^(?:[a-z][a-z0-9+.-]*:|\/)/i, `non-relative asset: ${url}`);
  }
});

test('README documents serving, testing and Pages publication without file:// instructions', () => {
  const readme = read('README.md');
  assert.match(readme, /python3 -m http\.server/);
  assert.match(readme, /node --test/);
  assert.match(readme, /GitHub Pages/);
  assert.doesNotMatch(readme, /open\s+`?file:\/\//i);
});
