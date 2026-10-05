# TaskFlow — Personal Task Manager

**SKYELAX Software Solutions Web Development Internship — Task 04: Interactive JavaScript Web Application**

## Live Demo

**Expected GitHub Pages URL:**

https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-04/

> **Deployment Status:** GitHub Pages deployment is currently pending.
> The URL above is the expected live URL once GitHub Pages finishes building and deploying the latest commit.

---

## Project Overview

TaskFlow is a browser-based personal task and project management application developed using HTML5, CSS3, and vanilla JavaScript.

The application provides a practical interactive web experience for creating, managing, updating, filtering, and completing tasks directly in the browser.

The project is designed as a static web application and is compatible with GitHub Pages.

There is no backend, framework, build step, or external API dependency.

Task data is stored locally in the user's browser using `localStorage`.

---

## Main Features

### Task Management

- Create tasks
- View task history
- Edit existing tasks
- Delete tasks
- Change task status
- Clear the form
- Cancel editing
- Reset all task data

### Task Information

Each task can contain:

- Title
- Description
- Category
- Priority
- Status
- Optional due date
- Created date
- Updated date

### Task Categories

- Work
- Personal
- Study
- Development

### Priority Levels

- Low
- Medium
- High

### Status Levels

- Pending
- In Progress
- Completed

Status, priority, and category information is communicated using icons and text rather than relying on colour alone.

---

## Search, Filtering and Sorting

TaskFlow provides interactive task discovery features including:

- Search by task information
- Filter by status
- Filter by overdue tasks
- Filter by category
- Filter by priority
- Sort by newest
- Sort by oldest
- Sort by priority
- Sort by due date
- Sort by title

---

## Statistics

The application displays live task statistics derived from the stored task data.

Statistics include:

- Total tasks
- Pending tasks
- In Progress tasks
- Completed tasks
- Overdue tasks

---

## Validation and User Feedback

TaskFlow includes client-side validation and user feedback.

Validation handles:

- Required task title
- Whitespace-only titles
- Maximum title length
- Maximum description length
- Valid category values
- Valid priority values
- Valid status values
- Valid due dates

The interface provides:

- Accessible inline validation errors
- Success feedback
- Clear create/edit mode
- Delete confirmation
- Reset confirmation
- Empty states
- Clear form actions
- Cancel edit actions

---

## Local Storage

TaskFlow uses browser `localStorage` for persistence.

Storage key:

`taskflow.tasks`

The stored structure uses:

`{
  "version": 1,
  "tasks": [...]
}`

Tasks remain available after refreshing the page in the same browser.

The application also includes recovery handling for corrupted or invalid stored data.

Valid task records can be retained while invalid records are skipped, and the original data can be backed up for recovery purposes.

> `localStorage` is browser-local storage and is not an encrypted or secure database. Sensitive information should not be stored in TaskFlow.

---

## Responsive Design

TaskFlow uses a fluid responsive layout designed for broad compatibility across:

- Smartphones
- Tablets
- Laptops
- Desktop computers
- Large desktop displays

The interface supports different viewport sizes and orientations without requiring separate device-specific versions of the application.

The implementation uses responsive CSS techniques including:

- CSS Grid
- Flexible layouts
- `min()`
- `minmax()`
- `clamp()`
- Relative units
- Responsive breakpoints

The application avoids device-specific JavaScript detection and device-specific HTML layouts.

---

## Accessibility

TaskFlow follows practical accessibility principles including:

- Semantic HTML
- Logical heading structure
- Form labels
- Keyboard-accessible controls
- Visible keyboard focus
- Accessible validation messages
- `aria-invalid`
- `aria-describedby`
- Polite live-region feedback
- Skip navigation link
- Touch-friendly controls
- Status information represented by text and symbols
- Reduced-motion support

No formal WCAG compliance audit has been performed.

---

## Project Structure

    task-04/
    │
    ├── index.html
    │
    ├── assets/
    │   └── icons/
    │       └── favicon.svg
    │
    ├── css/
    │   ├── base.css
    │   ├── layout.css
    │   ├── components.css
    │   └── responsive.css
    │
    ├── js/
    │   ├── app.js
    │   ├── storage.js
    │   ├── tasks.js
    │   ├── validation.js
    │   └── ui.js
    │
    ├── tests/
    │   ├── logic.test.mjs
    │   ├── e2e.mjs
    │   ├── scenario.mjs
    │   └── icons.mjs
    │
    ├── docs/
    │   ├── REQUIREMENTS.md
    │   ├── TRACEABILITY.md
    │   ├── ARCHITECTURE.md
    │   ├── TEST_PLAN.md
    │   ├── QA_CHECKLIST.md
    │   └── DECISIONS.md
    │
    └── README.md

---

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`
- SVG icons
- GitHub Pages

No frontend framework or backend is required.

---

## Testing

The project includes automated and manual testing resources.

### Logic Tests

The project includes zero-dependency Node.js tests covering areas such as:

- Validation
- Task logic
- Storage handling
- Storage recovery

Example command:

`node --test tests/logic.test.mjs`

### Optional Browser Tests

Browser-based tests are also included for testing the real interface.

These tests can cover workflows such as:

`Create → Edit → Change Status → Refresh → Delete`

The browser tests require a compatible browser testing environment such as Playwright.

### Manual Testing

Manual testing covers:

- Task creation
- Task editing
- Task deletion
- Status changes
- Search
- Filtering
- Sorting
- Validation
- Local storage persistence
- Responsive behaviour
- Keyboard interaction
- Accessibility behaviour
- GitHub Pages deployment

Testing results and limitations are documented in:

`docs/QA_CHECKLIST.md`

---

## GitHub Pages Deployment

The project is hosted from the repository:

`abdullahsatech-eng/skyelax-web-internship`

GitHub Pages is configured to deploy from:

`main` branch

The Task 04 application is located at:

`task-submissions/task-04/`

### Expected Live URL

https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-04/

### Current Deployment Status

The GitHub Pages deployment may temporarily show a pending or building status immediately after a new commit.

Once GitHub Pages completes the deployment, the expected URL above should serve the TaskFlow application.

---

## Known Limitations

- Task data is stored locally in one browser.
- Clearing browser site data removes stored tasks.
- There is no cloud synchronization.
- There is no backend database.
- Multiple browser tabs are not synchronized.
- The most recent save may overwrite changes made in another tab.
- Dates are stored as calendar dates without time-zone-specific scheduling.
- System dark-mode behaviour has not been fully visually tested.
- No formal WCAG audit has been performed.

---

## Project Documentation

Additional engineering documentation is available in the `docs/` directory:

- Requirements
- Architecture
- Requirements traceability
- Test plan
- QA checklist
- Engineering decisions

These documents support requirements verification, implementation review, testing, and project quality assurance.

---

## Internship Task

**Organization:** SKYELAX Software Solutions

**Internship Area:** Web Development

**Task:** Task 04 — Interactive JavaScript Web Application

**Application:** TaskFlow — Personal Task Manager

**Implementation:** HTML5 + CSS3 + Vanilla JavaScript

**Deployment:** GitHub Pages
