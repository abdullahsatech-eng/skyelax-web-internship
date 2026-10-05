# QA Checklist and Test Results

## Test Execution Summary

**Run date:** 2026-10-05

### Test Tools

- `node --test tests/logic.test.mjs`
- `node tests/e2e.mjs`
- `node tests/scenario.mjs`
- `node tests/icons.mjs`
- Headless Chromium
- Application served from `/task-submissions/task-04/`
- HTTP and `file://` execution were tested where applicable

### Test Results

- Logic/unit tests: **19/19 passed**
- Initial E2E run: **66/66 checks passed**
- Final E2E regression run after icon refinement: **70/70 checks passed**
- Scenario suite: **20/20 steps passed**
- Icon refinement suite: **12/12 checks passed**

One defect was found and fixed during testing.

The "Cancel edit" button was visible in Create mode because `.btn { display: inline-flex; }` overrode the HTML `hidden` attribute.

The issue was fixed in `base.css`.

The full regression suites were re-run after the fix.

---

# Functional Testing

| TC | Description | Result | Notes |
|---|---|---|---|
| 01 | Initial load | PASS | E2E |
| 02 | Create valid task | PASS | E2E + unit |
| 03 | Display created task | PASS | |
| 04 | Edit task | PASS | |
| 05 | Delete task | PASS | |
| 06 | Change status | PASS | Statistics update |
| 07 | Empty title | PASS | |
| 08 | Whitespace-only title | PASS | |
| 09 | Title greater than 100 characters | PASS | Input is rejected, not truncated |
| 10 | Description greater than 500 characters | PASS | |
| 11 | Invalid select values | PASS | Placeholder and tampered values rejected |
| 12 | Invalid date | PASS | `2025-02-30` rejected |
| 13 | Saved to localStorage | PASS | Version 1 structure checked |
| 14 | Persistence after refresh | PASS | |
| 15 | Empty storage | PASS | |
| 16 | Corrupt JSON / wrong structure | PASS | Application remains usable and backup key is written |
| 17 | Invalid stored records | PASS | Valid records kept; 3 invalid records skipped |
| 18 | Search | PASS | |
| 19 | Filter | PASS | Status, overdue and priority in browser; category unit-tested |
| 20 | Sort | PASS | Title in browser; all options covered by unit tests |
| 21 | No results | PASS | |
| 22 | Initial empty state | PASS | |
| 23 | Success feedback | PASS | |
| 24 | Error feedback | PASS | |
| 25 | Edit mode clarity | PASS | |
| 26 | Delete confirmation | PASS | Confirmation, Cancel, Confirm and Escape behaviour tested |
| 48 | Regression after fixes | PASS | Final logic and E2E suites re-run successfully |

---

# Responsive Testing

| Test | Viewport / Scenario | Result | Notes |
|---|---|---|---|
| 27 | 320px | PASS | Automated metrics; screenshot visually reviewed |
| 28 | 375px | PASS | Automated metrics |
| 29 | 430px | PASS | Automated metrics |
| 30 | 768px | PASS | Automated metrics |
| 31 | 1024px | PASS | Automated metrics |
| 32 | 1280px | PASS | Automated metrics; screenshot visually reviewed |
| 33 | 1440px | PASS | Automated metrics |
| 34 | 1920px | PASS | Automated metrics |
| - | Intermediate widths: 390px, 600px, 820px, 900px, 1100px, 1366px | PASS | Automated metrics |
| - | Landscape and portrait viewport scenarios | PASS | Automated metrics |

### Responsive Review Notes

Automated responsive checks covered the representative viewport sizes and intermediate widths.

Visual screenshots were manually reviewed at:

- 320px
- 1280px

The responsive implementation uses one fluid layout rather than separate device-specific versions.

---

# Keyboard and Accessibility Testing

| TC | Description | Result | Notes |
|---|---|---|---|
| 35 | Keyboard navigation | PASS (partial) | Skip link first, Enter form submission, Escape handling and focus movement tested. Full manual tab-order walkthrough NOT TESTED |
| 36 | Visible focus | PASS (partial) | 3px focus outline confirmed on one focused control; other controls use the same CSS rule |
| 37 | Form labels | PASS | Every input, select and textarea has an associated label |
| 38 | Accessible validation errors | PASS (partial) | `aria-invalid` and `aria-describedby` verified; screen reader NOT TESTED |
| 39 | Colour contrast | NOT TESTED | No contrast measurement tool was used |
| 40 | No hover-only functionality | PASS | No hover rule changes display, visibility or opacity |

---

# Browser Compatibility

| TC | Browser | Result | Notes |
|---|---|---|---|
| 41 | Chrome | PASS (Chromium headless only) | Branded Chrome NOT TESTED |
| 42 | Edge | NOT TESTED | |
| 43 | Firefox | NOT TESTED | |
| 44 | Safari | NOT TESTED | |

The automated browser testing environment used headless Chromium.

Compatibility with Edge, Firefox and Safari has not been formally verified.

---

# Reliability and Technical QA

| TC | Description | Result | Notes |
|---|---|---|---|
| 45 | Console errors | PASS | No errors, warnings or failed requests in the scripted run |
| 46 | Broken assets | PASS | No 4xx responses |
| 47 | Internal paths | PASS | Relative paths verified from the Task 04 sub-folder and through `file://` |
| 48 | Regression after fixes | PASS | Final regression run completed successfully |
| 49 | GitHub Pages compatibility | NOT TESTED | Sub-folder behaviour verified locally; live GitHub Pages deployment not yet verified |
| 50 | Final live verification | NOT TESTED | Requires completed GitHub Pages deployment |

---

# Scenario Test Suite

The scenario test suite completed all 20 steps successfully in `tests/scenario.mjs`.

Testing was performed at a 390x844 phone viewport using both HTTP and `file://`.

The scenario covered:

1. Opening the application
2. Selecting category
3. Selecting priority
4. Selecting status
5. Entering task information
6. Creating a task
7. Confirming the task appears
8. Confirming the success message
9. Opening Edit mode
10. Verifying all six editable values are pre-filled
11. Updating the task
12. Confirming no duplicate task is created
13. Refreshing the page
14. Confirming persistence
15. Changing the task status to Completed
16. Checking localStorage content
17. Opening delete confirmation
18. Cancelling deletion
19. Confirming deletion
20. Confirming the task is removed from storage

All 20 steps passed.

---

# Icon Refinement Testing

The status, priority and category badges use inline SVG icons.

### Implementation checks

- No external icon library
- No emoji
- Icons are created by `ui.js`
- Icons are decorative
- Icons use `aria-hidden`
- Icons are not focusable
- Visible text labels always carry the meaning
- No icons are placed inside `<option>` elements
- Completed task titles do not use strikethrough

### Automated icon test

`node tests/icons.mjs`

Result:

**12/12 checks passed**

The icon test covered:

- 3 statuses
- 3 priorities
- 4 categories
- 390px phone viewport
- HTTP execution
- `file://` execution

The test confirmed:

- One icon per badge
- Label text is present
- 4 distinct category icon shapes
- 3 distinct priority icon shapes
- 3 distinct status icon shapes
- No text-decoration on completed titles
- Select values remain unchanged
- No icons are inserted into `<option>` elements
- No horizontal overflow
- No console errors

After the icon refinement, the final logic, E2E and scenario test suites were re-run successfully.

Final E2E result:

**70/70 checks passed**

Icon appearance was visually checked using a 390px screenshot only.

Icon contrast and screen-reader announcement were NOT TESTED.

---

# Storage and Recovery Testing

The application was tested for:

- Normal localStorage saving
- Persistence after refresh
- Empty storage
- Corrupt JSON
- Incorrect storage structure
- Invalid individual task records
- Recovery of valid records
- Backup of corrupted raw storage data

The storage schema uses:

`taskflow.tasks`

with version:

`1`

Invalid records are skipped while valid records are retained.

The original raw data is backed up using:

`taskflow.tasks.backup`

---

# Known Untested Areas

The following areas were not physically or formally tested:

- Physical smartphones
- Physical tablets
- Physical laptops
- Touch events
- 200% browser zoom
- Larger system font settings
- `prefers-reduced-motion` visual behaviour
- Dark colour scheme appearance
- Screen readers
- Lighthouse audit
- axe accessibility audit
- Formal colour-contrast measurement
- Storage-full browser error behaviour
- UI behaviour when a task disappears from storage in another tab
- Two-tab synchronization behaviour
- Formal WCAG compliance audit

Target sizes were measured, but real physical touch interaction was not tested.

No formal WCAG compliance claim is made.

---

# QA Assessment

The major TaskFlow functional workflows have been tested through automated logic tests, browser-based E2E tests and scenario testing.

The application has also been tested for:

- CRUD operations
- Validation
- Local storage persistence
- Storage recovery
- Search
- Filtering
- Sorting
- User feedback
- Responsive behaviour
- Keyboard interaction
- Accessibility attributes
- Safe rendering
- Asset loading
- Console errors
- Regression after fixes

Remaining verification depends primarily on real-device, additional-browser and live GitHub Pages testing.

---

# Developer Sign-Off

Complete this section only after the GitHub Pages deployment has finished and the live application has been verified.

- [ ] Live URL loads successfully
- [ ] Create task works on live URL
- [ ] Edit task works on live URL
- [ ] Delete task works on live URL
- [ ] Status changes work on live URL
- [ ] Refresh preserves tasks on live URL
- [ ] Search/filter/sort work on live URL
- [ ] Live responsive behaviour checked
- [ ] Real phone checked: ____________________
- [ ] Edge checked: ____________________
- [ ] Firefox checked: ____________________
- [ ] Safari checked: ____________________

##  Live URL

https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-04/

## Current Live Verification Status

NOT YET COMPLETED — GitHub Pages deployment is still pending.
