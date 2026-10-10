# TaskFlow — Personal Task Manager

**SKYELAX Software Solutions | Web Development Internship | Task 04**

A responsive, browser-based task management application built using HTML5, CSS3, and vanilla JavaScript.

> **Tagline:** Organize your tasks. Track your progress. Stay in control.

## Live Demo

<escape><div align="center">
  <a href="https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-04/">
    <img src="https://img.shields.io/badge/Live%20Demo-Open%20TaskFlow-2563EB?style=for-the-badge&logo=githubpages&logoColor=white" alt="Open TaskFlow Live Demo">
  </a>
  <br><br>
  <a href="https://github.com/abdullahsatech-eng/skyelax-web-internship">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository">
  </a>
</div></escape>

| Project detail | Information |
|---|---|
| Organization | SKYELAX Software Solutions |
| Internship | Web Development |
| Task | Task 04 — Interactive JavaScript Web Application |
| Application | TaskFlow — Personal Task Manager |
| Technologies | HTML5, CSS3, Vanilla JavaScript |
| Hosting | GitHub Pages |
| Deployment | Previously verified as deployed |
| Backend | Not required |
| Data storage | Browser `localStorage` |

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#project-objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Workflow](#application-workflow)
- [Task Data Model](#task-data-model)
- [Project Structure](#project-structure)
- [Architecture and Code Organization](#architecture-and-code-organization)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Installation and Usage](#installation-and-usage)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Known Limitations](#known-limitations)
- [Project Documentation](#project-documentation)
- [Future Improvements](#future-improvements)
- [Internship Information](#internship-information)

## Project Overview

TaskFlow is a personal task and project management application developed as part of the SKYELAX Software Solutions Web Development Internship.

It enables users to create, view, edit, organize, filter, sort, and complete tasks directly in their browser.

The application provides a practical demonstration of interactive web development using native browser technologies. It combines task management, form validation, local data persistence, dynamic statistics, responsive layouts, and accessible user feedback.

TaskFlow is designed as a static web application and can be hosted on GitHub Pages without a backend server or build process.

**Scope:** This application manages tasks within the current browser. It does not provide cloud synchronization or shared multi-user task management.

## Project Objectives

- Build an interactive web application using HTML, CSS, and JavaScript.
- Implement complete task management operations.
- Validate user input and communicate errors clearly.
- Persist task data across browser refreshes.
- Provide useful search, filtering, sorting, and statistics.
- Create a responsive and accessible interface.
- Organize the source code into maintainable modules.
- Support automated and manual testing.
- Deploy the application using GitHub Pages.

## Features

### 1. Task Management

| Operation | Description |
|---|---|
| Create | Add a task using the task form. |
| Read | View existing tasks and task history. |
| Update | Edit task details and change task status. |
| Delete | Remove a task. |
| Clear form | Clear form inputs when appropriate. |
| Cancel editing | Exit edit mode without intentionally saving the draft. |
| Reset data | Reset stored task data through the available reset workflow. |

### 2. Task Information

Each task can contain the following information:

| Field | Description |
|---|---|
| Title | Required task name. |
| Description | Additional information about the task. |
| Category | Work, Personal, Study, or Development. |
| Priority | Low, Medium, or High. |
| Status | Pending, In Progress, or Completed. |
| Due date | Optional task deadline. |
| Created date | Date the task was created. |
| Updated date | Date the task was last updated. |

### 3. Categories, Priorities, and Statuses

| Category | Available values |
|---|---|
| Task category | Work, Personal, Study, Development |
| Priority | Low, Medium, High |
| Status | Pending, In Progress, Completed |

Status, category, and priority information is communicated using text and symbols rather than relying on colour alone.

### 4. Search, Filtering, and Sorting

TaskFlow includes tools to help users find and organize tasks.

| Capability | Available options |
|---|---|
| Search | Search task information. |
| Status filter | Pending, In Progress, Completed. |
| Overdue filter | Find overdue tasks. |
| Category filter | Work, Personal, Study, Development. |
| Priority filter | Low, Medium, High. |
| Sort by date | Newest and oldest. |
| Sort by priority | Organize tasks by priority. |
| Sort by deadline | Sort by due date. |
| Sort by title | Organize alphabetically. |

### 5. Dashboard Statistics

TaskFlow calculates statistics from the stored task data.

| Statistic | Purpose |
|---|---|
| Total tasks | Number of stored tasks. |
| Pending tasks | Tasks awaiting progress. |
| In Progress tasks | Tasks currently being worked on. |
| Completed tasks | Tasks marked complete. |
| Overdue tasks | Tasks identified as overdue by the application. |

Statistics are derived from task data rather than maintained as unrelated manual counters.

### 6. Validation and User Feedback

The application includes client-side validation for:

- Required task titles.
- Titles containing only whitespace.
- Maximum title length.
- Maximum description length.
- Valid category, priority, and status values.
- Valid due dates.

The interface also supports:

- Inline validation messages.
- Success feedback.
- Clear create/edit mode indicators.
- Delete confirmation.
- Reset confirmation.
- Empty states.
- Clear form actions.
- Cancel editing actions.

### 7. Local Data Persistence

TaskFlow uses the browser's `localStorage` API to retain tasks across page refreshes in the same browser.

**Storage key:** `taskflow.tasks`

**Stored data structure:**

```json
{
  "version": 1,
  "tasks": []
}
```

The application includes recovery handling for malformed or invalid stored data. Valid task records can be retained while invalid records are skipped, with backup handling available for recovery.

`localStorage` is browser-local storage, not an encrypted database. Avoid storing passwords, payment information, or other sensitive data.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic document structure and form elements |
| CSS3 | Styling, layout, and responsive presentation |
| Vanilla JavaScript | Task logic, validation, state updates, and interactions |
| `localStorage` | Browser-local persistence |
| SVG | Scalable icons |
| Node.js test runner | Automated logic testing |
| GitHub Pages | Static hosting |

The application does not require a frontend framework, backend server, database, or production build step.

## Application Workflow

1. Open the TaskFlow application.
2. View the task list and dashboard statistics.
3. Create a task by entering its details.
4. Validate and save the task.
5. Search, filter, or sort tasks to find relevant items.
6. Edit a task or update its status.
7. Mark tasks as completed when finished.
8. Delete individual tasks or use the available reset workflow.
9. Refresh the browser and verify that saved tasks remain available.

Task data is stored only in the current browser and is not automatically synchronized with other devices.

## Task Data Model

A task is represented by structured information such as its identifier, title, description, category, priority, status, optional due date, and creation/update dates.

The following is a **conceptual example**, not a guarantee of the exact property names used by the implementation:

```json
{
  "version": 1,
  "tasks": [
    {
      "title": "Prepare project documentation",
      "description": "Review the project README",
      "category": "Development",
      "priority": "High",
      "status": "In Progress",
      "dueDate": "2026-10-20"
    }
  ]
}
```

The application uses a versioned storage structure to support validation and recovery of browser-stored task data.

## Project Structure

```text
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
```

### Directory Responsibilities

| Path | Responsibility |
|---|---|
| `index.html` | Main application document |
| `assets/icons/` | Application icons and favicon |
| `css/base.css` | Base styling and global design rules |
| `css/layout.css` | Main layout and structural styling |
| `css/components.css` | Reusable component styles |
| `css/responsive.css` | Responsive layout rules |
| `js/app.js` | Application initialization and coordination |
| `js/storage.js` | Browser storage and recovery logic |
| `js/tasks.js` | Task operations and task-related logic |
| `js/validation.js` | Input validation |
| `js/ui.js` | Rendering and interface interactions |
| `tests/` | Automated and browser-oriented test resources |
| `docs/` | Requirements, architecture, testing, QA, and decisions |

## Architecture and Code Organization

TaskFlow separates the application into HTML, CSS, JavaScript, testing, and documentation resources.

### Separation of Concerns

- HTML defines the document structure.
- CSS controls presentation and responsive layouts.
- JavaScript handles interactions and application logic.
- Storage logic is separated from task operations.
- Validation logic is separated from interface rendering.
- Testing resources are kept outside the application source modules.

### Maintainability

The modular structure makes individual responsibilities easier to inspect, test, debug, and improve without unnecessarily changing unrelated functionality.

### Data Integrity

Stored task records are checked during recovery, and the application handles invalid storage data without relying on the assumption that browser data is always valid.

## Responsive Design

TaskFlow uses a fluid layout intended for:

- Smartphones.
- Tablets.
- Laptops.
- Desktop computers.
- Large desktop displays.

Responsive techniques include:

- CSS Grid.
- Flexible layouts.
- `min()` and `minmax()`.
- `clamp()` for adaptable sizing.
- Relative units.
- Responsive breakpoints.

The application adapts its layout to available screen space rather than relying on device-specific JavaScript detection.

## Accessibility

TaskFlow incorporates practical accessibility considerations:

- Semantic HTML.
- Logical heading structure.
- Labels associated with form controls.
- Keyboard-accessible controls.
- Visible keyboard focus.
- Accessible validation messages.
- `aria-invalid` and `aria-describedby` where appropriate.
- Polite live-region feedback.
- A skip-navigation link.
- Touch-friendly controls.
- Status information communicated through text and symbols.
- Reduced-motion support.

**Accessibility status:** No formal WCAG compliance audit has been performed. The presence of accessibility features should not be interpreted as proof of full WCAG compliance.

## Installation and Usage

### Prerequisites

- A modern web browser.
- VS Code or another code editor.
- Node.js for running the automated logic tests.

A local development server is recommended for consistent browser testing.

### Run the Application Locally

1. Download the repository or the Task 04 project folder.
2. Open `task-submissions/task-04/` in VS Code.
3. Start a local static server or use a compatible browser preview extension.
4. Open the application's `index.html`.
5. Test task creation, editing, filtering, sorting, and persistence.

Because TaskFlow is a static HTML/CSS/JavaScript application, it does not require a frontend build command.

### Run Automated Logic Tests

From the `task-04` project directory, run:

```bash
node --test tests/logic.test.mjs
```

This command runs the automated logic tests using Node.js's built-in test runner.

## Testing and Quality Assurance

TaskFlow includes automated and manual testing resources.

### Automated Logic Tests

The zero-dependency Node.js test suite covers areas such as:

- Input validation.
- Task logic.
- Storage handling.
- Storage recovery.

Run the test suite with:

```bash
node --test tests/logic.test.mjs
```

### Optional Browser Tests

Browser-oriented tests are included for testing real interface workflows.

Examples of workflows to verify include:

`Create → Edit → Change Status → Refresh → Delete`

The browser tests require a compatible browser testing environment, such as Playwright, if that is the environment expected by the included test scripts.

### Manual Testing Checklist

| Test area | Verification |
|---|---|
| Task creation | Valid task can be created |
| Task editing | Existing task details can be updated |
| Task deletion | Task is removed through the intended workflow |
| Status changes | Task status updates correctly |
| Search | Matching tasks can be found |
| Filtering | Status, overdue, category, and priority filters work |
| Sorting | Supported sorting options produce the expected order |
| Validation | Invalid input receives understandable feedback |
| Persistence | Saved tasks remain after refreshing |
| Recovery | Invalid stored data is handled safely |
| Responsive layout | Interface adapts to different viewport widths |
| Keyboard navigation | Main workflows can be operated using a keyboard |
| Accessibility feedback | Errors, status messages, and focus are understandable |
| Deployment | Live GitHub Pages URL loads the application |

Testing results and known issues should be recorded in [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md).

**Verification note:** The checklist identifies what should be tested; it does not mean every listed test has passed. Record actual results in the QA documentation.

## GitHub Pages Deployment

TaskFlow is hosted in the following repository:

[**abdullahsatech-eng/skyelax-web-internship**](https://github.com/abdullahsatech-eng/skyelax-web-internship)

The application is located at:

`task-submissions/task-04/`

### Live URL

[https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-04/](https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-04/)

### Deployment Information

| Setting | Value |
|---|---|
| Hosting service | GitHub Pages |
| Repository | `abdullahsatech-eng/skyelax-web-internship` |
| Application directory | `task-submissions/task-04/` |
| Application type | Static web application |
| Build step | Not required |
| Backend server | Not required |

After updating the deployed files, open the live URL and verify the main task-management workflows. A new commit may take time to appear on GitHub Pages.

## Known Limitations

- Tasks are stored in one browser's local storage.
- Clearing browser site data may remove stored tasks.
- There is no cloud synchronization.
- There is no backend database.
- Multiple browser tabs are not synchronized.
- Changes from one tab may overwrite newer changes from another tab.
- Dates are stored as calendar dates without time-zone-specific scheduling.
- System dark-mode behaviour has not been fully visually tested.
- No formal WCAG audit has been completed.
- Optional browser tests require their compatible testing environment.

These limitations describe the current application's scope rather than guaranteed future functionality.

## Project Documentation

The `docs/` directory contains supporting engineering documentation.

| Document | Purpose |
|---|---|
| [`REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Records application requirements |
| [`TRACEABILITY.md`](docs/TRACEABILITY.md) | Maps requirements to implementation and verification |
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Describes the application structure |
| [`TEST_PLAN.md`](docs/TEST_PLAN.md) | Defines testing scope and approach |
| [`QA_CHECKLIST.md`](docs/QA_CHECKLIST.md) | Records QA checks and results |
| [`DECISIONS.md`](docs/DECISIONS.md) | Documents important engineering decisions |

These documents support requirements verification, implementation review, testing, and quality assurance.

## Future Improvements

Potential enhancements include:

- Optional export and import of task data.
- Better cross-tab change handling.
- Additional automated browser tests.
- Further keyboard and screen-reader testing.
- More detailed task-history and reporting features.
- Additional visual and responsive testing across browsers.

These are possible future improvements, not features currently claimed as implemented.

## Internship Information

| Field | Details |
|---|---|
| Organization | SKYELAX Software Solutions |
| Internship area | Web Development |
| Task number | Task 04 |
| Task title | Interactive JavaScript Web Application |
| Application | TaskFlow — Personal Task Manager |
| Implementation | HTML5, CSS3, Vanilla JavaScript |
| Deployment | GitHub Pages |

## Conclusion

TaskFlow demonstrates the development of a responsive and interactive browser-based task manager using native web technologies.

The application combines task CRUD operations, search and filtering, sorting, validation, local persistence, dynamic statistics, accessibility considerations, and modular source-code organization.

The project provides a foundation for further development while keeping its current scope focused on personal task management in the browser.
