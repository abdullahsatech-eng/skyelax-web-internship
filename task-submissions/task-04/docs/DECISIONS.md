# Design decisions
1. **Vanilla JS, classic scripts, no build** - matches the task and deploys as-is on GitHub Pages. *Changed in the correction round:* the first version used ES modules, which browsers refuse to load from `file://`; opening `index.html` by double-click then left the dropdowns empty and every button dead. Scripts now share one `window.TaskFlow` namespace.
2. **Five JS files** - one clear responsibility each; logic is DOM-free so it can be tested in Node.
3. **Inline delete/reset confirmation, not a modal** - simpler and more accessible than a custom dialog; no focus trap to maintain.
4. **Storage wrapper with versioned schema `{version, tasks}`** - lets future changes migrate data. A bare array is accepted when loading.
5. **Per-record recovery** - bad records are skipped, valid ones kept, the raw original saved to `taskflow.tasks.backup`.
6. **Due dates are `YYYY-MM-DD` strings** - avoids time-zone shifts; "overdue" compares against the local date.
7. **Overdue is derived and also a filter option**, never a status.
8. **Priority and status use text + symbol + colour** so meaning does not rely on colour.
9. **Feedback is a single live region** (success auto-hides after 6 s; errors and notices stay until the next action).
10. **Dark colours via `prefers-color-scheme`** - small CSS-only addition, no toggle or JS.
11. **`[hidden]{display:none !important}`** - found by testing: component `display` rules otherwise override the attribute (the Cancel button showed in Create mode).
12. **Dropdown options are static HTML** with placeholder options ("Select category", "Select priority"); an unselected placeholder fails validation with "Select a valid category/priority."
13. **Feedback bar is sticky** at the top of the viewport so success/error messages are visible even when the user is scrolled down at the form or list on a phone.
14. **Exact user-facing messages** follow the correction brief ("Task added successfully.", "Task updated successfully.", "Task deleted successfully.", "Task status changed to X.", "Edit cancelled.", "Form cleared.", storage-recovery message).
15. **Icons are inline SVG drawn in `ui.js`** (no icon library, no emoji, no icons inside `<option>` elements). They are decorative (`aria-hidden`); the text label carries the meaning, with a screen-reader-only "Status:" / "Category:" prefix. Completed tasks are no longer struck through, so titles stay readable.
