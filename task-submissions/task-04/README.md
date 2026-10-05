# TaskFlow - Personal Task Manager

SKYELAX Software Solutions Web Development Internship - **Task 04: Interactive JavaScript Web Application**

TaskFlow is a browser-based task manager built with HTML5, CSS3 and vanilla JavaScript (plain `<script>` files). There is no backend, framework, build step or external request. Tasks are stored in the browser's `localStorage`.

## Features
- Create, view, edit and delete tasks (title, description, category, priority, status, optional due date)
- Change status inline: Pending / In Progress / Completed
- Search, filter (status, overdue, category, priority) and sort (newest, oldest, priority, due date, title)
- Live statistics (total, pending, in progress, completed, overdue) derived from real data
- Validation with accessible inline errors; clear Create vs Edit mode
- Inline confirmation for delete ("Delete 'X'? This action cannot be undone." with Cancel / Confirm) and for "Reset all data"
- Status, priority and category badges combine an SVG icon with a text label (never colour alone)
- "Clear form" and "Cancel edit" actions; each task card shows category, priority, status, due date and created/updated time
- Safe recovery from corrupt `localStorage` data (valid tasks are kept, bad data is backed up)
- Responsive layout, keyboard support, visible focus, reduced-motion support

## Project structure
```
task-04/
  index.html
  css/   base.css  layout.css  components.css  responsive.css
  js/    app.js  storage.js  tasks.js  validation.js  ui.js
  assets/icons/favicon.svg
  tests/ logic.test.mjs (Node)   e2e.mjs + scenario.mjs (optional, Playwright)
  docs/  REQUIREMENTS  TRACEABILITY  ARCHITECTURE  TEST_PLAN  QA_CHECKLIST  DECISIONS
```

## Run locally
Just double-click `index.html`. It uses ordinary script files and static dropdown options, so it works straight from disk as well as from a web server (verified in Chromium over `file://` and over HTTP). Optionally: `python -m http.server 8000` then open http://localhost:8000/. No install step; Git is not needed.

## localStorage behaviour
Key `taskflow.tasks` holds `{ "version": 1, "tasks": [...] }`. Data is written only after a successful create / update / delete / status change / reset - not on keystrokes. On load, every record is validated: valid tasks are kept, invalid ones are skipped, the raw original is copied to `taskflow.tasks.backup`, and a notice is shown. localStorage is **not encrypted** and not a secure database; do not store sensitive information.

## Testing
- `node --test tests/logic.test.mjs` - 20 zero-dependency tests of validation, task logic and storage recovery.
- `node tests/e2e.mjs [url]` and `node tests/scenario.mjs [url]` and `node tests/icons.mjs [url]` - optional browser tests (need `npm i playwright`) that drive the real UI in headless Chromium. `scenario.mjs` runs the full create -> edit -> status -> refresh -> delete walkthrough.
- Results, including what was **NOT TESTED**, are in `docs/QA_CHECKLIST.md`.

## Responsive compatibility
Designed and tested for broad cross-device and cross-viewport compatibility across modern smartphones, tablets, laptops and desktop computers. One fluid layout (CSS Grid, `min()`, `minmax()`, `clamp()`, rem units) with three breakpoints and no device-specific code. Details: `docs/ARCHITECTURE.md`.

## Accessibility approach
Designed with practical accessibility principles: semantic landmarks, one `h1`, labelled controls, `aria-invalid` + `aria-describedby` errors, a polite live region for feedback, skip link, visible focus, 44px minimum touch targets, status/priority conveyed by text and symbols (not colour alone). No formal WCAG audit has been performed.

## Deploy to GitHub Pages (browser only)
1. On github.com open the repo `abdullahsatech-eng/skyelax-web-internship`.
2. **Add file -> Upload files**, drag the *contents* of this folder (`index.html`, `css`, `js`, `assets`, `docs`, `tests`, `README.md`) so they land in `task-submissions/task-04/` (type the path into the file-name box when creating/uploading, or upload into that folder after opening it).
3. Commit directly to `main`.
4. **Settings -> Pages**: deploy from branch `main`, folder `/ (root)`.
5. After the build finishes, open `https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-04/` and run the live checks in `docs/QA_CHECKLIST.md` (TC-49, TC-50).

All paths are relative, so the app works in a sub-folder.

## Known limitations
- Data lives in one browser on one device; clearing site data deletes tasks. There is no sync or export.
- Two tabs open at once are not synchronised (last save wins).
- Dates are plain calendar dates (no time or time zone).
- Dark colours follow the system setting (`prefers-color-scheme`); this was not visually tested.
