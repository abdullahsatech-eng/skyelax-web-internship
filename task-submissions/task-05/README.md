# ScopeBridge — SKYELAX Web Development Internship, Task 05

**Task 05: Build a React Web Application.**
ScopeBridge is a frontend-only React + TypeScript prototype for freelance web developers and small agencies who deliver fixed-price website projects. It keeps the **original agreement** (scope, budget, deadline) clearly separate from **proposed changes**, and shows what each change would do to the budget and completion date.

> Tagline: *Make every project change clear before the extra work begins.*

**This is a frontend prototype.** There is no backend, database, login, email or payment. All data is fictional. No commercial demand or customer adoption is claimed. "Approved" and "Rejected" are **demonstration statuses**: no client is contacted and nothing is legally binding.

---

## Core features

| Area | What you can do |
| --- | --- |
| Dashboard | Totals, active projects, pending requests, proposed extra cost per currency, cost impact table, recent projects and change requests, empty states |
| Projects | List, search, filter by status, create, edit, delete (with confirmation), detail page |
| Original scope | Add and remove scope items (title and description) inside the project form |
| Change requests | Create (as draft, or send for review), view, edit (draft/pending only), delete, search, filter by status and project |
| Status workflow | Draft → Pending review → Approved (demo) / Rejected (demo), every decision can be reopened |
| Impact | Original budget + proposed cost = illustrative revised budget; original date + days = illustrative revised date; live preview while typing |

**Visual language used everywhere:** *solid* = part of the original agreement (or approved in the demo); *dashed / hatched amber* = proposed, not agreed yet.

## Technology stack

- React 19 and TypeScript (strict mode)
- Vite 6 (dev server and production build)
- Vitest (unit tests for business logic)
- Plain CSS with design tokens (`src/styles/`)
- Hash-based routing implemented in about 60 lines (`src/lib/router.ts`, `src/lib/useRoute.ts`)
- Inline SVG icons (`src/components/ui/Icon.tsx`)

Dependencies: only `react` and `react-dom` at runtime. Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, and the two React type packages.

**Deliberate deviations from the suggested stack** (each removes a dependency without losing function):
- **No React Router.** GitHub Pages cannot rewrite unknown paths to `index.html`, so path-based routes would break on refresh. Hash URLs (`#/projects/abc`) work on any static host with zero configuration.
- **No Lucide / Tailwind.** A 21-icon inline SVG set and ~900 lines of tokenised CSS cover the need without extra packages.
- **No React Testing Library / jsdom.** Automated tests cover the pure logic. UI flows are covered by the manual checklist below.

## Prerequisites

- **Node.js 18.18 or newer** (20 or 22 LTS recommended). Check with `node -v`. Download from https://nodejs.org if needed.
- **VS Code** (or any editor). **Git is not required.**

## Run it in VS Code

1. Extract the ZIP. You get a folder named `task-05`.
2. In VS Code choose **File → Open Folder…** and select that `task-05` folder.
3. Open the terminal: **Terminal → New Terminal**.
4. Install dependencies (first time only):
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open the local address printed in the terminal (normally http://localhost:5173).

### Other commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | TypeScript check, no output files |
| `npm test` | Run the unit tests once |
| `npm run build` | Type check, then create the production site in `dist/` |
| `npm run preview` | Serve the built `dist/` locally to check it |

## Project structure

```
task-05/
├── index.html
├── package.json / vite.config.ts / tsconfig.json
├── public/favicon.svg
└── src/
    ├── main.tsx, App.tsx          Entry point and route table
    ├── types.ts                   Domain types (Project, ScopeItem, ChangeRequest…)
    ├── data/demoData.ts           Fictional demo projects and change requests
    ├── lib/                       Pure, tested logic (no React)
    │   ├── calculations.ts        Budget, date and dashboard calculations
    │   ├── validation.ts          Form validation rules and messages
    │   ├── statusRules.ts         Allowed status transitions, editability
    │   ├── filters.ts             Search, filter, sort
    │   ├── money.ts, dates.ts     Parsing and formatting
    │   ├── storage.ts             localStorage load/save with validation
    │   ├── router.ts, useRoute.ts Hash routing
    │   └── *.test.ts              Unit tests
    ├── state/
    │   ├── appReducer.ts          The one pure reducer (also enforces business rules)
    │   ├── AppContext.tsx         Provider: reducer + persistence
    │   ├── useAppActions.ts       User operations: ids, timestamps, dispatch, feedback
    │   ├── ToastContext.tsx       Accessible status messages
    │   └── selectors.ts           Lookup maps and per-project summaries
    ├── components/
    │   ├── ui/                    Reusable primitives (Button, Field, Panel, Badge, Dialog…)
    │   ├── layout/AppShell.tsx    Sidebar / bottom navigation, skip link
    │   └── *.tsx                  Domain components (ImpactLedger, ProjectCard…)
    ├── pages/                     One component per screen
    └── styles/                    tokens, base, layout, components
```

## React concepts demonstrated

- **Components and props:** small reusable components (`Panel`, `StatCard`, `ChangeRequestItem`, `Field` family) receive typed props.
- **State:** `useReducer` for shared application data; `useState` for form drafts, filters and dialogs; context to share data without prop drilling.
- **Effects and refs:** persistence to localStorage, focus management (error summary, page headings, new scope rows), native `<dialog>` control.
- **Forms:** controlled inputs, validation on submit, field-level errors that clear as the user fixes them, an error summary that moves focus.
- **Conditional rendering:** empty states, locked (approved) changes, preview vs. hint, not-found screens, disabled currency when a project has changes.
- **Lists and keys:** stable string ids as keys; derived data via `useMemo`.
- **Custom hooks:** `useRoute`, `useAppData`, `useAppActions`, `useToast`.
- **`key` to reset state:** forms are keyed by record id so switching records never leaks old input.

## Software engineering principles applied

- **Separation of concerns:** pure logic (`lib/`), state (`state/`), UI primitives, domain components, pages and styles live in separate folders. Business rules are never inside JSX.
- **Single source of truth:** dashboard, lists and detail pages all read the same `AppData`. Dashboard figures are derived, never stored.
- **Rules enforced in one place:** the reducer rejects invalid status transitions, edits to approved changes, change requests for missing projects, and currency changes once changes exist. UI buttons only reflect those rules.
- **Referential integrity:** change requests reference `projectId`; deleting a project removes its change requests; stored data with orphaned records is cleaned on load.
- **Algorithmic choices:** change requests are grouped by project in one pass (O(n)) instead of re-scanning per project; projects are looked up through a `Map`; search is a single pass with all-words matching; money is summed in integer cents to avoid floating-point drift; `Intl.NumberFormat` instances are cached.
- **HCI:** visible labels and hints, recognition over recall (status shown as icon + text, solid/dashed convention), error prevention (confirm dialogs, locked decisions, currency lock, safe default of "Save as draft" on Enter), error recovery (every decision can be reopened, form errors listed with jump links), consistent components, live preview of impact.

## Calculation rules

1. **Cost** is a number from 0 to 1,000,000,000 with at most two decimals. **Negative adjustments are not allowed** (a price reduction is a scope reduction, which is out of scope for this prototype).
2. **Schedule extension** is a whole number of days from 0 to 730. The deadline cannot move earlier.
3. **A change must affect cost, schedule, or both.** Cost 0 with days above 0 (schedule-only) is valid; cost 0 and days 0 is rejected.
4. **Included in revised figures:** Approved (demo) and Pending review. **Excluded:** Draft and Rejected (demo).
5. **Revised budget** = original budget + sum of included costs. Approved and proposed amounts are always shown on separate lines. Proposed amounts are never labelled as revenue.
6. **Revised date** = original date + sum of included days (assumes extensions add up one after another). Calendar maths is done in UTC, so results do not depend on the viewer's time zone. If a date cannot be calculated, the app says so instead of showing a wrong date.
7. **One currency per project** (USD, EUR, GBP, PKR). There is no conversion. Dashboard totals are grouped per currency and never added across currencies. The currency is locked once a project has change requests.

## Status model

| From | Allowed next status |
| --- | --- |
| Draft | Pending review |
| Pending review | Approved (demo), Rejected (demo), Draft |
| Approved (demo) | Pending review (reopen) |
| Rejected (demo) | Pending review (reopen), Draft |

Only Draft and Pending review changes can be edited. Approved and rejected changes are locked until reopened, so a decision is never rewritten silently.

## Demo data and localStorage

- The app starts with fictional demo data (5 projects, 11 change requests, amounts in USD, EUR and PKR).
- Changes are saved to **this browser only** (`localStorage` key `scopebridge.task05.v1`). Data is **not synchronised** between browsers, devices or people.
- Malformed or tampered stored data never crashes the app: invalid records are dropped, orphaned change requests removed, and unreadable data falls back to the demo data.
- The footer has **Reset demo data** and **Clear all data** (both ask for confirmation).

## Requirements traceability

| # | Task 05 requirement | Where it is met |
| --- | --- | --- |
| 1 | Set up a React project | Vite + React + TypeScript (`package.json`, `vite.config.ts`) |
| 2 | Reusable components | `components/ui/*`, `ImpactLedger`, `ProjectCard`, `ChangeRequestItem` reused across pages |
| 3 | Props | Typed props on every component |
| 4 | State management | `appReducer` + context; local state for forms/filters |
| 5 | Interactive forms | Project form, change-request form with validation and preview |
| 6 | Handle user input | `lib/validation.ts`, `lib/money.ts` (parsing), search/filter inputs |
| 7 | Reusable UI elements | Button, Field, Panel, Badge, ConfirmDialog, EmptyState, StatCard |
| 8 | Conditional rendering | Empty states, locked changes, preview, not-found, error summary |
| 9 | Display dynamic data | Dashboard, lists, detail pages all derived from state |
| 10 | Responsive layouts | CSS Grid/Flexbox, bottom nav on small screens, sidebar on desktop |
| 11 | Organise project structure | See *Project structure* |
| 12 | Deploy the application | Static-hosting ready (see *Deployment*). **Not yet deployed** |

## Manual test checklist

Run `npm run dev` and tick each item.

**Primary workflow**
- [ ] Dashboard shows 5 projects, 3 active, 4 pending, proposed cost per currency.
- [ ] Open *Lumen Dental Booking Site*; 4 original scope items are listed.
- [ ] Impact panel shows $14,000 → $17,180 and 18 Dec 2026 → 1 Jan 2027.
- [ ] Click *New change request*; the project is preselected.
- [ ] Enter title, description, cost `1,250.50`, days `7`; preview shows $15,250.50 and 25 Dec 2026.
- [ ] *Save and send for review* opens the change with status *Pending review* and a toast.
- [ ] *Mark approved (demo)*: badge changes, *Edit change* disappears. *Reopen for review* restores it.
- [ ] Dashboard now shows 5 pending and $4,850.50 proposed USD.

**Validation**
- [ ] Empty change form: error summary lists 4 problems and receives focus; links jump to fields.
- [ ] Cost `-50`, `abc`, and cost `0` with days `0` each show a specific message.
- [ ] Project form: budget `0`, empty scope title, impossible date are rejected.

**Search, filters, empty states**
- [ ] Projects: search `dental` → 1 result; `zzzz` → "No projects match"; *Clear* restores 5.
- [ ] Change requests: search `atlas` → 3; status *Approved* → 4.
- [ ] *Clear all data* → empty dashboard; *Load demo data* restores.

**Destructive actions**
- [ ] *Delete project* opens a dialog; Escape cancels and focus returns to the button; confirming removes the project and its change requests.
- [ ] Opening a deleted project's address shows "Project not found".

**Keyboard and screen reader**
- [ ] Tab reveals *Skip to main content*; Enter focuses the main area.
- [ ] A form can be completed and saved with the keyboard only (Enter saves a draft).
- [ ] After navigating, focus lands on the page heading.

**Responsive** (browser dev tools, widths 320, 375, 430, 768, 1024, 1280, 1440)
- [ ] No horizontal scrolling; bottom tab bar below 1024px, sidebar from 1024px.
- [ ] Buttons stack and remain tappable; long names wrap.

## Accessibility and responsive notes

Designed toward WCAG 2.2 AA; **no formal audit has been done and compliance is not claimed.** Implemented: semantic landmarks and one `h1` per page with a logical heading order; visible labels linked to inputs; `aria-invalid` and `aria-describedby` for errors; an error summary that takes focus; polite live region for feedback; native `<dialog>` (focus trap, Escape, focus return); skip link; focus moves to the page heading on navigation; visible 3px focus outlines; status shown by icon + text + outline style, never colour alone; checked contrast of the main text/background pairs (all at least 4.5:1, control borders at least 3:1); `prefers-reduced-motion` respected; touch targets of 44px on touch devices; inputs at 16px to avoid mobile zoom.

Layout: bottom tab bar on mobile and tablet, sidebar from 1024px; cards, filters and forms reflow with CSS Grid/Flexbox; there are no wide tables.

## Deployment (GitHub Pages, upload through the website)

The build is static and uses relative asset paths (`base: './'`) plus hash routes, so it works from any sub-folder.

1. In the terminal run `npm run build`. This creates a `dist/` folder.
2. In your GitHub repository, upload the contents of `dist/` into a folder served by GitHub Pages (for example `task-submissions/task-05/dist/`) using **Add file → Upload files**.
3. With Pages enabled for the repository (**Settings → Pages**), the app will be available at  
   `https://<your-username>.github.io/skyelax-web-internship/task-submissions/task-05/dist/`  
   (the exact address depends on how Pages is configured for your repository).

This was **not deployed or tested on GitHub Pages** while preparing the project. Verify the live link yourself after uploading.

## Known limitations

- Frontend only: no backend, database, authentication, roles, real approval links, emails, payments, invoicing or integrations (reserved for later tasks or out of scope).
- Data lives in one browser's localStorage; clearing site data removes it.
- Schedule extensions are simply added together; real projects may overlap work.
- No currency conversion; no negative cost adjustments.
- No automated UI/component tests (logic is tested; UI was verified with browser automation and the manual checklist).
- No lockfile is included; `npm install` creates `package-lock.json`.
