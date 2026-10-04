# Traceability Matrix

Status "Implemented, pending manual verification" means the code exists but has not yet been tested by the developer in a browser.

| ID | Requirement | Page / component | Implementation | Acceptance criteria | Test | Status |
|----|-------------|------------------|----------------|---------------------|------|--------|
| P-01 | Home page | Hero, services, approach, concepts, CTA | `index.html`, `pages.css` | All sections display | TC-01 | Implemented, pending manual verification |
| P-02 | About page | Overview, mission, values, process | `about.html` | Sections readable | TC-02 | Implemented, pending manual verification |
| P-03 | Services page | Four service sections with IDs | `services.html` | Four anchors work | TC-03 | Implemented, pending manual verification |
| P-04 | Projects page | Four labelled concept cards | `projects.html` | Labelled fictional | TC-04 | Implemented, pending manual verification |
| P-05 | Contact page | Form and information | `contact.html`, `contact-form.js` | Validation works, no false delivery claim | TC-05, TC-06 | Implemented, pending manual verification |
| P-06 | Consistent navigation | Header | All HTML, `navigation.js` | Same links, `aria-current` per page | TC-07 | Implemented, pending manual verification |
| P-07 | Responsive layout | All pages | `responsive.css`, `layout.css` | No horizontal scroll 320–1920px | TC-08 | Implemented, pending manual verification |
| P-08 | Reusable patterns | Buttons, cards, CTA panel | `components.css` | Same components on all pages | TC-09 | Implemented, pending manual verification |
| P-09 | Footer | Footer | All HTML, `layout.css`, `components.css` | Dark footer identical on all pages | TC-09 | Implemented, pending manual verification |
| P-10 | Internal links | All links | All HTML | No broken links or anchors | TC-10 | Implemented, pending manual verification |
| P-11 | Visual assets | Logo, icons, hero illustration | `assets/` | Assets load | TC-10 | Implemented, pending manual verification |
| P-12 | Screen-size testing | n/a | `tests/manual-test-plan.md` | Results recorded | TC-08 | Not started (developer action) |
| B-01 | Brand and services | All pages | All HTML | Four services named consistently | TC-03 | Implemented, pending manual verification |
| B-02 | CTA wording | Hero, CTA panels | HTML | Exact wording present | TC-01 | Implemented, pending manual verification |
| B-03 | Honest contact form | Contact | `contact.html`, `contact-form.js` | Demo notice and honest message | TC-05, TC-06 | Implemented, pending manual verification |
| B-04 | Mobile menu | Header | `navigation.js`, `layout.css`, `responsive.css` | Toggle, Escape, outside click, resize reset | TC-11 | Implemented, pending manual verification |
| B-05 | CSS architecture | All pages | `css/*.css` | Six files in order | TC-12 | Implemented, pending manual verification |
| B-06 | JS architecture | All pages | `js/*.js` | Loads with `defer`, no console errors | TC-12 | Implemented, pending manual verification |
| B-07 | Accessibility basics | All pages | `base.css`, HTML | Keyboard, focus, labels checked | TC-13 | Implemented, pending manual verification |
| B-08 | Static / GitHub Pages | Project | Relative paths | Works from subpath | TC-14 | Not started (deployment pending) |
| B-09 | No fabricated claims | Content | All HTML | Copy reviewed | TC-04 | Implemented, pending manual verification |
| B-10 | Documentation | Docs | `docs/`, `tests/`, `README.md` | Files present | QA checklist | Implemented, pending manual verification |
| M-01 | Richer colour and UI | All pages | `tokens.css`, `components.css`, `pages.css` | Mentor-visible colour on every page | TC-15 | Implemented, pending manual verification |
