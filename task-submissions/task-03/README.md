# NexaWorks Digital: Task 3 Website

A responsive five-page business website for the fictional company **NexaWorks Digital**, built for Task 3 of the SKYELAX Software Solutions Web Development Internship.

## Purpose

Deliver a professional multi-page website with a consistent design system, responsive layouts, accessible interactions and supporting documentation.

## Features

- Five pages: Home, About, Services, Projects, Contact
- Shared header, navigation, footer and design tokens
- Mobile-first responsive layouts with a collapsible mobile menu
- Skip link, visible focus styles and `aria-current` navigation state
- Contact form with accessible client-side validation (frontend demonstration only; nothing is sent or stored)
- Four services: Website Development, UI/UX Design, Web Applications, Business Automation
- Clearly labelled fictional project concepts
- SVG logo, service icons and hero illustration

## Technologies

HTML5, CSS3 (custom properties, Grid, Flexbox) and vanilla JavaScript. No frameworks, build tools or backend.

## Folder structure

```text
task-03/
├── assets/
│   ├── icons/      logo.svg, website.svg, ui-ux.svg, web-app.svg, automation.svg
│   └── images/     hero-illustration.svg
├── css/            tokens, base, layout, components, pages, responsive
├── js/             navigation.js, contact-form.js
├── docs/           DECISIONS, PROJECT_FOUNDATION, QA_CHECKLIST, REQUIREMENTS, TRACEABILITY
├── tests/          manual-test-plan.md
├── index.html  about.html  services.html  projects.html  contact.html
└── README.md
```

## Preview locally

1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

## Deploy to GitHub Pages (browser only)

1. In your repository, open the `task-submissions/task-03` folder.
2. Use **Add file > Upload files** and upload the contents of this folder, keeping the subfolders. Commit the upload.
3. Open **Settings > Pages**, choose **Deploy from a branch**, select your branch and the root folder, and save.
4. Open `https://<username>.github.io/<repository>/task-submissions/task-03/` and check every page.

All paths are relative, so the site works from a repository subpath without changes.

## Known limitations

- The contact form is a frontend demonstration with no backend.
- The official Task 3 specification documents were not available; design values are developer choices (see `docs/DECISIONS.md`).
- Browser, device and accessibility testing must be done manually (see `tests/manual-test-plan.md`).

## Testing

Follow `tests/manual-test-plan.md`, record the results, and complete `docs/QA_CHECKLIST.md` before submission.
