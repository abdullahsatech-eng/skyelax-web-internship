# Requirements traceability
Requirement -> User story -> Design -> Implementation -> Test -> Result. Evidence = automated runs described in `QA_CHECKLIST.md` (`tests/logic.test.mjs`, `tests/e2e.mjs`).

| Requirement | Story | Design | Implementation | Test | Result |
|---|---|---|---|---|---|
| FR-01 UI | US-01 | Header, stats, form panel, list panel | `index.html`, `ui.js` | TC-01 | PASS |
| FR-02 Create | US-02 | Task form | `tasks.js` createTask, `app.js` handleSubmit | TC-02 | PASS |
| FR-03 Display | US-01 | Task cards | `ui.js` buildCard | TC-03 | PASS |
| FR-04 Edit | US-03 | Form switches to Edit mode (heading, badge, button label, Cancel) | `app.js` startEdit, `tasks.js` updateTask | TC-04, TC-25 | PASS |
| FR-05 Delete | US-04 | Inline "Delete this task?" confirmation | `app.js` confirmDelete | TC-05, TC-26 | PASS |
| FR-06 Status | US-05 | Status select on each card | `tasks.js` setStatus | TC-06 | PASS |
| FR-07/08 Validation | US-08 | Inline errors, no crash | `validation.js` | TC-07 to TC-12 | PASS |
| FR-09/10 Persistence | US-06 | - | `storage.js` | TC-13, TC-14, TC-15 | PASS |
| FR-11/12/13 Search/filter/sort | US-07 | Toolbar above list | `tasks.js` getVisibleTasks | TC-18, TC-19, TC-20 | PASS |
| FR-14 Stats | US-01 | Stat tiles | `tasks.js` getStats | TC-02, TC-06 (stat values) | PASS |
| FR-15 Empty states | US-01, US-07 | Three empty states with next action | `ui.js` renderTaskList | TC-21, TC-22 | PASS |
| FR-16 Feedback | US-08 | Live-region message | `ui.js` showFeedback | TC-23, TC-24 | PASS |
| FR-17 Recovery | US-06 | Notice + backup key | `storage.js` loadTasks | TC-16, TC-17 | PASS |
| FR-18 Reset | US-04 | Footer button + inline confirm | `app.js` | E2E reset checks | PASS |
| FR-19 Responsive | all | Fluid grid, 3 breakpoints | `css/*` | TC-27 to TC-34 | PASS (automated); physical devices NOT TESTED |
| FR-20 Keyboard | all | Native controls, skip link, focus management | `app.js`, `base.css` | TC-35, TC-36 | PASS (partial - see QA) |
| FR-21 Accessible errors | US-08 | `aria-invalid`, `aria-describedby` | `ui.js` showErrors | TC-37, TC-38 | PASS (screen reader NOT TESTED) |
| FR-22 Safe rendering | - | `textContent` only | `ui.js` | E2E injection check | PASS |
