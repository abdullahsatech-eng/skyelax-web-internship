# Project Foundation

## Purpose
A five-page responsive website for the fictional NexaWorks Digital, delivered as Task 3 of the SKYELAX Web Development Internship.

## Scope
In scope: Home, About, Services, Projects and Contact pages; shared design system; mobile navigation; frontend form validation; documentation and manual test plan.
Out of scope: backend, database, email delivery, authentication, real client content.

## Technical stack
HTML5, CSS3, vanilla JavaScript. Static hosting (GitHub Pages).

## Folder structure
See `README.md`. The project lives in `task-submissions/task-03/`, separate from earlier tasks.

## Architecture
CSS is loaded in this order on every page:
1. `tokens.css`: colours, type, spacing, radii, shadows
2. `base.css`: reset, typography, focus, skip link
3. `layout.css`: container, grids, header, navigation panel, footer structure
4. `components.css`: buttons, cards, nav links, forms, steps, CTA, notices, footer content
5. `pages.css`: hero, services detail, contact layout
6. `responsive.css`: breakpoints at 600, 700, 900 and 1100px

JavaScript:
- `navigation.js` (all pages): mobile menu toggle with accessible state
- `contact-form.js` (Contact page only): validation and status messages

## Relative paths
All pages sit in the project root and reference `css/`, `js/` and `assets/` with relative paths.

## Deployment
Upload through the GitHub browser interface and enable GitHub Pages (see `README.md`).
