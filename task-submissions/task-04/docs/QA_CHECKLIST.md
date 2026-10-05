# QA checklist and results
Run date: 2026-10-05. Tools: `node --test tests/logic.test.mjs` (19/19 passed) and `node tests/e2e.mjs` (66/66 checks passed) in headless Chromium, app served from `/task-submissions/task-04/`.
One defect was found and fixed during testing: the "Cancel edit" button was visible in Create mode because `.btn {display:inline-flex}` overrode the `hidden` attribute (fixed in `base.css`). Both suites were re-run in full after the fix (TC-48).

| TC | Description | Result | Notes |
|---|---|---|---|
| 01 | Initial load | PASS | E2E |
| 02 | Create valid task | PASS | E2E + unit |
| 03 | Display created task | PASS | |
| 04 | Edit task | PASS | |
| 05 | Delete task | PASS | |
| 06 | Change status | PASS | stats update |
| 07 | Empty title | PASS | |
| 08 | Whitespace title | PASS | |
| 09 | Title > 100 | PASS | not truncated |
| 10 | Description > 500 | PASS | |
| 11 | Invalid select values | PASS | unselected placeholders and a tampered option rejected in browser with "Select a valid category/priority."; unit-tested for all three |
| 12 | Invalid date | PASS | `2025-02-30` rejected |
| 13 | Saved to localStorage | PASS | version 1 structure checked |
| 14 | Persists after refresh | PASS | |
| 15 | Empty storage | PASS | |
| 16 | Corrupt JSON / wrong structure | PASS | app stays usable, backup key written |
| 17 | Invalid records | PASS | valid kept, 3 invalid skipped |
| 18 | Search | PASS | |
| 19 | Filter | PASS | status, overdue, priority (category: unit test) |
| 20 | Sort | PASS | title in browser; all options in unit test |
| 21 | No results | PASS | |
| 22 | Initial empty state | PASS | |
| 23 | Success feedback | PASS | |
| 24 | Error feedback | PASS | |
| 25 | Edit mode clarity | PASS | |
| 26 | Delete confirmation | PASS | "Delete 'X'? This action cannot be undone." with Cancel / Confirm; Cancel keeps the task; Escape cancels |
| 27-34 | 320, 375, 430, 768, 1024, 1280, 1440, 1920 px | PASS | automated metrics only; screenshots visually reviewed at 320 and 1280 only |
| - | Intermediate widths 390/600/820/900/1100/1366, 4 landscape/portrait sizes | PASS | automated metrics |
| 35 | Keyboard navigation | PASS (partial) | skip link first, form submit by Enter, Escape, focus moves to confirm button. Full manual tab-order walk-through NOT TESTED |
| 36 | Visible focus | PASS (partial) | 3px outline confirmed on one focused control; others share the same rule |
| 37 | Form labels | PASS | every input/select/textarea has a label |
| 38 | Accessible validation errors | PASS (partial) | `aria-invalid` + `aria-describedby` verified; screen reader NOT TESTED |
| 39 | Colour contrast | NOT TESTED | no contrast tool run; colours chosen for contrast but unmeasured |
| 40 | No hover-only functionality | PASS | no `:hover` rule changes display/visibility/opacity |
| 41 | Chrome | PASS (Chromium headless only) | branded Chrome NOT TESTED |
| 42 | Edge | NOT TESTED | |
| 43 | Firefox | NOT TESTED | |
| 44 | Safari | NOT TESTED | |
| 45 | Console errors | PASS | no errors, warnings or failed requests in the scripted run |
| 46 | Broken assets | PASS | no 4xx responses |
| 47 | Internal paths | PASS | all relative; served from a sub-folder and opened via file:// |
| 48 | Regression after fix | PASS | full re-run |
| 49 | GitHub Pages compatibility | NOT TESTED | sub-folder behaviour verified locally only |
| 50 | Final live verification | NOT TESTED | deployment is the developer's step |

## Section 38 scenario
All 20 steps passed in `tests/scenario.mjs` at a 390x844 phone viewport over HTTP and file://, including: dropdown selections shown, task appears with title/category/priority/status/due date, "Task added successfully." visible on screen, Edit pre-fills all six values, update without duplicate, persistence after refresh, status change to Completed, localStorage content checked (version 1, id, status, category), delete Cancel/Confirm, task removed from storage.

## Icon refinement (status / priority / category)
Inline SVG icons (no library, no emoji) are drawn by `ui.js` inside the card badges; each is `aria-hidden` and not focusable, and the visible text label always carries the meaning. Completed titles have no strikethrough. `node tests/icons.mjs` (12 cards covering all 3 statuses, 3 priorities and 4 categories, phone viewport, HTTP and file://) PASSED: one icon per badge, label text present, 4/3/3 distinct icon shapes, no text-decoration on titles, select values unchanged (no icons in `<option>`), no horizontal overflow, no console errors. Full logic, e2e (70/70) and scenario suites were re-run afterwards and still pass. Icon appearance was visually checked in a 390px screenshot only; icon contrast and screen-reader announcement are NOT TESTED.

## Not tested at all
Physical phones/tablets/laptops; touch events (target sizes only measured); 200% zoom and larger system font; `prefers-reduced-motion`; dark colour scheme appearance; screen readers; Lighthouse/axe; storage-full error message in the browser (unit-tested only); edit/delete of a task that vanished from storage in another tab (logic unit-tested; UI path not exercised); two-tab behaviour; formal WCAG compliance (no claim made).

## Developer sign-off (fill in after deployment)
- [ ] Live URL loads and CRUD works
- [ ] Refresh keeps tasks
- [ ] Checked on a real phone: ______   Edge: ____   Firefox: ____   Safari: ____
