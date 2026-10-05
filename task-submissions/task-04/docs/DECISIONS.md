# Design Decisions

This document records the major engineering and design decisions made during the development of TaskFlow — Personal Task Manager.

The purpose is to document what was implemented and why each approach was selected.

---

## 1. JavaScript Architecture

### Decision

Use Vanilla JavaScript with classic deferred scripts instead of ES modules or a JavaScript framework.

### Rationale

This approach:

- Matches the requirements of the task.
- Requires no build process.
- Keeps the application lightweight.
- Works directly with GitHub Pages.
- Allows the application to run from a local file:// URL.

### Correction Made

The first version used ES modules. When index.html was opened directly using file://, the browser blocked the module loading behaviour. This caused the dropdowns to remain empty and the application controls to stop working.

The implementation was therefore changed to classic scripts sharing a single window.TaskFlow namespace.

---

## 2. Five JavaScript Modules

### Decision

Separate the application into five JavaScript files with clear responsibilities.

### Structure

    js/
    ├── validation.js
    ├── tasks.js
    ├── storage.js
    ├── ui.js
    └── app.js

### Rationale

Each module has a focused responsibility.

| Module | Responsibility |
|---|---|
| validation.js | Validation rules and stored-record validation |
| tasks.js | Task operations and task-related calculations |
| storage.js | Local storage, schema versioning and recovery |
| ui.js | DOM rendering and form helpers |
| app.js | Application state, events and orchestration |

The core logic is kept independent from the DOM where practical, allowing it to be tested separately.

---

## 3. Inline Delete and Reset Confirmation

### Decision

Use inline confirmation controls instead of a custom modal dialog.

### Rationale

Inline confirmation was selected because it is:

- Simpler to implement.
- Easier to understand.
- More accessible.
- Less disruptive to the user's workflow.
- Free from the need to maintain a modal focus trap.

The approach is used for destructive actions such as:

- Delete task
- Reset all data

---

## 4. Versioned Local Storage Schema

### Decision

Store task data using a versioned object structure.

    {
      "version": 1,
      "tasks": [...]
    }

### Rationale

A versioned schema makes future changes easier to manage.

If the data structure changes in a future version, migration logic can be introduced without completely replacing the storage system.

For compatibility, a bare task array can also be accepted when loading existing data.

---

## 5. Per-Record Storage Recovery

### Decision

Use per-record recovery when invalid task data is found in localStorage.

### Rationale

If stored data contains invalid records:

- Valid records are retained.
- Invalid records are skipped.
- The original raw data is backed up.
- The user receives a storage-recovery notice.

The backup uses:

    taskflow.tasks.backup

This approach prevents one invalid record from causing the entire task list to become unusable.

---

## 6. Due Date Representation

### Decision

Store due dates as YYYY-MM-DD strings.

### Rationale

Plain calendar dates avoid unnecessary time-zone shifts.

The application compares the due date against the user's local calendar date when determining whether a task is overdue.

---

## 7. Overdue Task Handling

### Decision

Treat overdue as a derived condition rather than a task status.

### Rationale

The application has three actual task statuses:

- Pending
- In Progress
- Completed

A task can also become overdue based on its due date.

Therefore, overdue status is calculated from the task's due date and completion state rather than being stored as a fourth status.

Overdue is also available as a filter option.

---

## 8. Status and Priority Visual Communication

### Decision

Use a combination of text, symbol/icon, and colour.

### Rationale

Meaning should not depend on colour alone.

Users can identify status or priority through visible text and symbols even when colour differences are difficult to perceive.

This also improves usability and accessibility.

---

## 9. Feedback System

### Decision

Use a single live feedback region for user messages.

### Rationale

The feedback system provides immediate confirmation without interrupting the user's workflow.

The feedback region is used for:

- Successful task creation
- Successful task updates
- Successful deletion
- Status changes
- Form clearing
- Edit cancellation
- Storage recovery notices
- Errors

Success messages automatically hide after approximately six seconds.

Errors and important notices remain visible until the next relevant action.

---

## 10. System Dark Mode

### Decision

Support system colour preferences using prefers-color-scheme.

### Rationale

Dark-mode support was implemented through CSS rather than JavaScript.

This keeps the implementation lightweight and avoids unnecessary application state or theme-management code.

No separate theme toggle was introduced because it was not necessary for the core TaskFlow requirements.

---

## 11. Hidden Element Behaviour

### Decision

Use the following CSS rule:

    [hidden] {
        display: none !important;
    }

### Rationale

Testing revealed that component-level display rules could override the browser's normal handling of the hidden attribute.

This caused the Cancel button to appear when the application was in Create mode.

The rule ensures that elements marked as hidden remain hidden regardless of component display rules.

---

## 12. Static Dropdown Options

### Decision

Keep dropdown options directly in the HTML instead of generating them dynamically with JavaScript.

### Rationale

The main form and filter dropdowns contain their options directly in index.html.

This ensures that the options exist even if a JavaScript problem occurs.

Placeholder options are used for required selections, including:

- Select category
- Select priority

An unselected placeholder fails validation and produces an appropriate validation message.

---

## 13. Sticky Feedback Bar

### Decision

Keep the feedback bar visible near the top of the viewport.

### Rationale

The feedback message should remain noticeable even when the user is:

- Scrolled down the page.
- Working with the form.
- Reviewing the task list.
- Using a small smartphone screen.

This improves visibility of success, error, and recovery messages.

---

## 14. Consistent User-Facing Messages

### Decision

Use clear and consistent messages for important user actions.

### Rationale

The application uses predictable feedback messages such as:

- Task added successfully.
- Task updated successfully.
- Task deleted successfully.
- Task status changed to X.
- Edit cancelled.
- Form cleared.

Storage-recovery situations also provide an appropriate user-facing notice.

Consistent messages make the interface easier to understand and reduce ambiguity.

---

## 15. Inline SVG Icons

### Decision

Use inline SVG icons created in ui.js.

### Rationale

The project does not depend on an external icon library.

The implementation uses:

- Inline SVG
- No emoji
- No external icon dependency
- No icons inside option elements

Icons are decorative and use aria-hidden.

The visible text label carries the actual meaning.

For additional accessibility, screen-reader-only prefixes such as Status: and Category: are used where appropriate.

---

## 16. Completed Task Presentation

### Decision

Completed task titles are not struck through.

### Rationale

During UI review, the strikethrough effect made completed task titles less readable.

The application therefore communicates completion through:

- Completed icon
- Completed label
- Status styling

The task title remains readable.

---

## 17. Overall Design Principle

The overall implementation follows a simple principle:

Keep the application functional, understandable, maintainable, accessible, and easy to deploy.

TaskFlow therefore prioritizes:

- Clear responsibilities
- Minimal dependencies
- Reliable browser behaviour
- Safe data handling
- Responsive design
- Accessible interaction
- Clear user feedback
- Testability
- GitHub Pages compatibility
