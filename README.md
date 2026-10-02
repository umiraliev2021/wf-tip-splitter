# Tip Splitter

A dependency-free static web app that splits a bill with a tip between people. It is plain HTML, CSS and native JavaScript ES modules: no backend, no build step, no `npm install`.

## Files

- `index.html`, `styles.css`, `app.js` — page shell, styling and UI controller
- `tip.js` — pure calculation module (integer cents)
- `test/` — unit and static release checks run by `node --test`
- `e2e/tip-splitter.spec.mjs` — Playwright browser flows, run against a served URL

## Run locally

ES modules do not load from `file://` URLs, so serve the directory over HTTP:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. Do not open `index.html` directly from the file system.

## Test

Requires Node.js 18 or newer. No dependencies need to be installed:

```sh
node --test
```

The end-to-end spec imports `@playwright/test` and is run separately against a served instance (for example, staging) by setting Playwright's `baseURL`. It is not part of `node --test`.

## Publish to GitHub Pages

All runtime assets use relative paths, so the app works under a project sub-path such as `https://<user>.github.io/<repo>/`.

Publishing requires repository access and an operator who is authorized to push and enable Pages. This repository's documentation does not mean either has happened. An operator must:

1. Push the reviewed commit to the `main` branch of the GitHub repository.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The `.github/workflows/pages.yml` workflow deploys the source files as-is. Confirm the run succeeds and open the published URL to verify it before treating the release as complete.
