# ScopeBridge — SKYELAX Web Development Internship, Task 05

**Task 05: Build a React Web Application**

ScopeBridge is a frontend-only React and TypeScript prototype designed for freelance web developers and small agencies managing fixed-price website projects.

It helps users maintain a clear distinction between the **original project agreement** and **proposed changes**, including their potential impact on the project budget and completion date.

> **Tagline:** Make every project change clear before the extra work begins.

## Live Demo

**Live Application:** [Open ScopeBridge](https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-05/)

**GitHub Repository:** [SKYELAX Web Development Internship](https://github.com/abdullahsatech-eng/skyelax-web-internship)

**Project Directory:** `task-submissions/task-05/`

## Project Overview

Fixed-price website projects can become difficult to manage when clients request additional features after the original agreement has been established.

ScopeBridge demonstrates how developers can record the original scope, manage change requests, and review proposed budget and schedule adjustments before accepting additional work.

The application separates agreed project information from proposed changes through consistent visual indicators and a structured change-request workflow.

**Important:** ScopeBridge is a frontend demonstration prototype. It does not provide a backend, database, authentication, external integrations, or legally binding approvals. All sample data is fictional.

## Core Features

| Feature | Description |
|---|---|
| Dashboard | Displays project statistics, pending requests, budget impact, recent activity, and empty states. |
| Project Management | Create, view, edit, search, filter, and delete projects. |
| Original Scope | Add and remove scope items with titles and descriptions. |
| Change Requests | Create, view, edit, search, filter, and delete change requests. |
| Status Workflow | Manage draft, pending review, approved (demo), and rejected (demo) statuses. |
| Budget Impact | Calculate illustrative revised budgets from the original budget and included change costs. |
| Schedule Impact | Calculate illustrative revised completion dates using proposed extension days. |
| Live Preview | Display budget and schedule impact while entering change-request details. |
| Form Validation | Provide field-level errors and an accessible error summary. |
| Search and Filtering | Find projects and change requests using search fields and status filters. |
| Local Persistence | Save application data in the current browser using `localStorage`. |
| Responsive Interface | Provide mobile navigation and a desktop sidebar with adaptable layouts. |
| Data Management | Reset demo data or clear all application data after confirmation. |

## Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Static typing and maintainable application code |
| Vite 6 | Development server and production build |
| Vitest | Automated unit testing |
| CSS | Responsive styling and reusable design tokens |
| HTML5 | Semantic page structure and accessible forms |
| Browser `localStorage` | Local data persistence |
| Inline SVG | Lightweight interface icons |
| GitHub Pages | Static application hosting |

The application uses React and React DOM as runtime dependencies. Development dependencies include Vite, TypeScript, Vitest, the React Vite plugin, and React type packages.

## React Concepts Demonstrated

- **Components and props:** Reusable interface components with typed properties.
- **State management:** `useReducer`, `useState`, and React Context.
- **Custom hooks:** Shared application logic and route management.
- **Controlled forms:** Form inputs, validation, and submission handling.
- **Conditional rendering:** Status-dependent controls, error messages, and empty states.
- **Effects and refs:** Local persistence and focus management.
- **Derived data:** Dashboard statistics and project summaries calculated from application state.
- **Stable keys:** Record identifiers used to maintain consistent component rendering.
- **Component reuse:** Shared buttons, fields, panels, badges, dialogs, and other UI elements.

## Application Workflow

1. Open the dashboard to review project statistics and pending change requests.
2. Select an existing project or create a new project.
3. Review its original budget, completion date, and scope items.
4. Create a change request describing additional work.
5. Enter the proposed additional cost and schedule extension.
6. Review the live impact preview.
7. Save the request as a draft or send it for review.
8. Demonstrate approval, rejection, or reopening through the status workflow.
9. Review the resulting project and dashboard calculations.

All approval and rejection actions are demonstrations only.

## Budget and Schedule Calculation Rules

- Each project has one currency: USD, EUR, GBP, or PKR.
- Currency conversion is not supported.
- Cost adjustments must be non-negative and may contain up to two decimal places.
- Schedule extensions must be whole numbers from 0 to 730 days.
- Every change request must affect cost, schedule, or both.
- Pending and approved demonstration requests are included in illustrative revised figures.
- Draft and rejected demonstration requests are excluded.
- Revised budget equals the original budget plus included change-request costs.
- Revised completion date equals the original date plus included schedule-extension days.
- Currency cannot be changed once a project has change requests.
- Invalid or unavailable date calculations must not display misleading results.

These calculations illustrate a possible workflow; they do not constitute financial or contractual approval.

## Project Structure

```text
task-05/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── data/
    │   └── demoData.ts
    ├── lib/
    │   ├── calculations.ts
    │   ├── validation.ts
    │   ├── statusRules.ts
    │   ├── filters.ts
    │   ├── money.ts
    │   ├── dates.ts
    │   ├── storage.ts
    │   ├── router.ts
    │   ├── useRoute.ts
    │   └── *.test.ts
    ├── state/
    │   ├── appReducer.ts
    │   ├── AppContext.tsx
    │   ├── useAppActions.ts
    │   ├── ToastContext.tsx
    │   └── selectors.ts
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   └── domain components
    ├── pages/
    └── styles/
```

### Directory Responsibilities

| Directory | Responsibility |
|---|---|
| `data/` | Fictional demonstration data |
| `lib/` | Reusable business logic, calculations, validation, filtering, and tests |
| `state/` | Shared state, reducer, persistence integration, and application actions |
| `components/ui/` | Reusable interface primitives |
| `components/layout/` | Shared application layout and navigation |
| `pages/` | Application screens |
| `styles/` | Design tokens, base styles, layouts, and component styles |

## Software Engineering Principles

### Separation of Concerns

Business logic, application state, reusable components, pages, and styles are organized into separate modules.

### Single Source of Truth

Projects and change requests share a common application state. Dashboard values are derived from that state rather than maintained as separate, potentially inconsistent values.

### Centralized Business Rules

The application reducer enforces important rules, including status transitions, editing restrictions, project relationships, and currency restrictions.

### Data Integrity

Change requests reference projects through project identifiers. Deleting a project also removes its associated change requests, and invalid stored relationships are handled during data loading.

### Maintainability

Reusable components, typed data structures, meaningful module boundaries, and centralized validation help reduce duplication and make future changes easier.

### Reliable Calculations

Money is processed using integer cents where appropriate to reduce floating-point calculation errors. Date calculations use UTC-based calendar operations to reduce time-zone inconsistencies.

## UI/UX and Human-Computer Interaction

The interface focuses on usability, clarity, and error prevention rather than decoration alone.

- Consistent layouts, typography, spacing, and reusable interface elements.
- Clear distinction between original agreements and proposed changes.
- Visible form labels, hints, and validation messages.
- Live budget and schedule impact previews.
- Confirmation dialogs for destructive actions.
- Accessible feedback messages for user actions.
- Search, filtering, and empty states that help users understand available information.
- Keyboard navigation, visible focus indicators, and a skip-to-content link.
- Responsive navigation and layouts for smaller and larger screens.

Solid styling represents original or approved demonstration information, while dashed or hatched amber styling identifies proposed changes.

## Accessibility and Responsive Design

The application incorporates practical accessibility and responsive design considerations.

### Accessibility

- Semantic HTML landmarks and logical heading structure.
- Labels associated with form inputs.
- Accessible validation messages and an error summary.
- Keyboard-operable controls and visible focus indicators.
- Focus management during navigation and dialog interactions.
- Status indicators that use text and visual styling rather than colour alone.
- Reduced-motion preferences.
- Touch-friendly controls on supported devices.

### Responsive Design

- Mobile and tablet navigation through a bottom navigation bar.
- Desktop sidebar navigation from the configured 1024px breakpoint.
- CSS Grid and Flexbox for adaptable layouts.
- Reflowing cards, forms, and filters.
- Support for narrow screens and long text.

The application was designed with accessibility considerations, but a formal WCAG audit has not been completed. Formal WCAG compliance is not claimed.

## Setup and Installation

### Prerequisites

- Node.js 18.18 or newer.
- VS Code or another code editor.
- A web browser.

Git is not required to run the application locally.

### Run Locally

1. Download or extract the Task 05 project.
2. Open the `task-05` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Install the project dependencies:

   ```bash
   npm install
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL printed in the terminal, normally `http://localhost:5173`.

### Available Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run automated unit tests |
| `npm run build` | Check types and create the production build |
| `npm run preview` | Preview the generated production build locally |

## Testing and Verification

The following checks were performed during development:

| Test | Result |
|---|---|
| TypeScript type checking | Passed |
| Automated unit tests | 58 tests passed across 5 test files |
| Production build | Passed |
| Local development server | Started successfully |
| GitHub Pages deployment | Live application verified as working |

The automated tests focus on business logic, including calculations, validation, status rules, filtering, and related functions.

### Manual Testing Areas

- Dashboard figures and project summaries.
- Project creation, editing, searching, filtering, and deletion.
- Original scope management.
- Change-request creation and validation.
- Live budget and schedule previews.
- Status transitions and editing restrictions.
- Empty states and error handling.
- Local persistence and data reset.
- Keyboard navigation and focus management.
- Responsive layouts across mobile, tablet, and desktop widths.

### Regression Testing

After significant changes, rerun type checking, automated tests, and the production build. Also verify the affected interface workflows and ensure existing project functionality continues to work.

## Deployment

ScopeBridge is published using GitHub Pages.

**Live URL:** [https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-05/](https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-05/)

The application uses hash-based routing to support navigation on static hosting. The Vite build produces the HTML, JavaScript, CSS, and other assets required by the deployed application.

For future deployment updates:

1. Run `npm run typecheck`.
2. Run `npm test`.
3. Run `npm run build`.
4. Publish the generated production files to the appropriate Task 05 deployment directory.
5. Open the live URL and verify the application and its main workflows.

The published files must be the production build, not the uncompiled React/TypeScript source files.

## Requirements Traceability

| No. | Requirement area | Implementation |
|---:|---|---|
| 1 | React project setup | React, TypeScript, and Vite configuration |
| 2 | Reusable components | `components/ui/` and shared domain components |
| 3 | Component props | Typed component properties |
| 4 | State management | Reducer, context, and local component state |
| 5 | Interactive forms | Project and change-request forms |
| 6 | User input handling | Validation, parsing, search, and filtering |
| 7 | Reusable UI elements | Buttons, fields, panels, badges, and dialogs |
| 8 | Conditional rendering | Status-dependent controls, errors, and empty states |
| 9 | Dynamic data | Dashboard, project lists, and detail pages |
| 10 | Responsive layouts | CSS Grid, Flexbox, and responsive navigation |
| 11 | Organized structure | Separated data, logic, state, components, pages, and styles |
| 12 | Deployment | GitHub Pages static deployment |

This table maps the implemented application to the Task 05 requirement areas documented for this project. The official Task 05 instructions remain the final authority for assessment.

## Known Limitations

- No backend or database.
- No authentication, user accounts, or role management.
- No real client notifications, email integrations, or approval links.
- No payment processing, invoicing, or external integrations.
- Data is stored only in the current browser and is not synchronized across devices.
- Clearing browser site data can remove saved application data.
- Approval and rejection statuses are for demonstration purposes only.
- Currency conversion is not supported.
- Schedule extensions are added sequentially and do not model overlapping work.
- Automated UI/component tests are not included; browser workflows also require manual verification.
- No formal accessibility audit has been completed.

## Future Improvements

Potential improvements, outside the current frontend prototype scope, include:

- Backend persistence and secure authentication.
- Role-based access for developers and clients.
- Real client approval workflows and notifications.
- Project history and audit records.
- Integration with invoicing or payment systems.
- Automated component and end-to-end UI testing.
- Further accessibility and cross-browser testing.

These are potential future enhancements, not claims about existing functionality.

## Conclusion

ScopeBridge demonstrates how a React and TypeScript application can organize fixed-price website projects and proposed scope changes through reusable components, centralized state management, validation, responsive layouts, and illustrative budget and schedule calculations.

The project emphasizes maintainable software construction, usability, clear information presentation, and separation between original agreements and proposed changes.

**Task:** 05 — Build a React Web Application  
**Internship:** SKYELAX Web Development Internship  
**Project:** ScopeBridge  
**Deployment:** GitHub Pages  
**Status:** Implemented and deployed as a frontend demonstration prototype
