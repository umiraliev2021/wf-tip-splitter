# Risks

- Decimal parsing and rounding can regress into floating-point arithmetic; integer-cent unit tests and boundary cases mitigate this.
- Browser input behavior differs for type=number across platforms; string validation, inputmode hints, and staging Playwright flows mitigate it.
- GitHub Pages project URLs can break root-relative paths; all local runtime asset references remain relative.
- GitHub Pages activation and push permissions require operator authority and are not performed by implementation work units.

Highest risks are cent-accurate rounding and divergence between pure logic and browser interaction. WU-001 establishes deterministic integer-cent behavior, WU-002 integrates it into accessible UI, WU-003 independently verifies complete browser flows on staging, and WU-004 protects the no-build static delivery constraint.
