# Requirements

Official task: build an interactive JavaScript web application (HTML, CSS, JS) with a functional UI, JavaScript logic, interactive controls, form handling, validation, CRUD, localStorage, invalid-input handling, success/error messages, responsive design and testing. Selected application: **TaskFlow**.

## User stories
| ID | Story |
|---|---|
| US-01 | As a user, I want to view my tasks so I can understand what I need to do. |
| US-02 | As a user, I want to create a task so I can record work I need to complete. |
| US-03 | As a user, I want to edit a task so I can correct or update its information. |
| US-04 | As a user, I want to delete a task so I can remove tasks I no longer need. |
| US-05 | As a user, I want to change task status so I can track progress. |
| US-06 | As a user, I want my tasks to persist after refresh so I do not lose my work. |
| US-07 | As a user, I want to search/filter/sort tasks so I can quickly find relevant tasks. |
| US-08 | As a user, I want clear validation and feedback so I understand what happened. |

## Functional requirements (priority)
| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Functional UI (header, form, list, controls, stats, feedback, empty states) | MUST |
| FR-02 | Create task (title, description, category, priority, status, optional due date) | MUST |
| FR-03 | Display tasks; list updates with state | MUST |
| FR-04 | Edit task; Create vs Edit mode clearly distinct | MUST |
| FR-05 | Delete task with confirmation | MUST |
| FR-06 | Change status (Pending / In Progress / Completed) | MUST |
| FR-07, FR-08 | Validate input; invalid input never crashes the app | MUST |
| FR-09, FR-10 | Store in localStorage; survive refresh | MUST |
| FR-11, FR-12, FR-13 | Search, filter, sort | SHOULD |
| FR-14 | Statistics from real state (incl. derived overdue) | SHOULD |
| FR-15 | Empty states (no tasks / no results) | MUST |
| FR-16 | Truthful feedback for real operations | MUST |
| FR-17 | Safe recovery from corrupt storage | MUST |
| FR-18 | Reset all data with confirmation | SHOULD |
| FR-19 | Responsive interface | MUST |
| FR-20, FR-21 | Keyboard access; accessible form errors | MUST |
| FR-22 | Safe rendering of user content (textContent only) | MUST |

## Business rules
Title required, trimmed, max 100; description optional, max 500; no silent truncation. Category in {Work, Personal, Study, Development}; priority in {Low, Medium, High}; status in {Pending, In Progress, Completed}. Due date optional, valid `YYYY-MM-DD`, past dates allowed. **Overdue** is derived (due date before today and status not Completed), never stored. IDs come from `crypto.randomUUID()` with a fallback; duplicate titles are allowed.

## Optional features
Not implemented: export/import, drag and drop, keyboard shortcuts, theme toggle, analytics. (Automatic dark colours via `prefers-color-scheme` are in the CSS.)
