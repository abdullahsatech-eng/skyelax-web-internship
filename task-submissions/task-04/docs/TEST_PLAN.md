# Test plan
**Approach:** (1) unit tests of DOM-free modules in Node; (2) scripted browser tests (`e2e.mjs`, `scenario.mjs`) with Playwright driving headless Chromium against the app served from a sub-folder (`/task-submissions/task-04/`) to mimic GitHub Pages, and again from `file://`; (3) manual checks the developer must still do.

**Status vocabulary:** PASS = actually executed and passed. FAIL. NOT TESTED = not executed.

## Environments
| Environment | Used |
|---|---|
| Node 22 (unit tests) | Yes |
| Headless Chromium via Playwright 1.56 (Linux) | Yes |
| Microsoft Edge, Firefox, Safari | No |
| Physical Android / iOS / tablet / laptop devices | No |
| GitHub Pages live URL | No (not deployed yet) |

## Responsive test points
Representative widths: 320, 375, 430, 768, 1024, 1280, 1440, 1920. Intermediate: 390, 600, 820, 900, 1100, 1366. Orientation (emulated by viewport size): 667x375, 844x390 (phone landscape); 1024x768, 1180x820 (tablet landscape). At each size the script checks: no horizontal scroll, no card/panel/control extending past the viewport, every button/input/select at least 44x44 CSS px. A very long unbroken title and a 400-character description were present.

## Cases
TC-01 to TC-50 as defined in the task brief; per-case results are in `QA_CHECKLIST.md`.

## Manual checks still recommended
Tab through the whole page; test on a real phone and tablet; Firefox/Edge/Safari; zoom to 200%; larger system text; reduced-motion setting; screen reader spot check; run Lighthouse or axe for contrast; the live GitHub Pages URL.
