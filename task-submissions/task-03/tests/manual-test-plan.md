# Manual Test Plan

Record results yourself. Leave Actual Result and Pass/Fail empty until tested.

| ID | Feature | Preconditions | Steps | Expected result | Actual result | Pass/Fail |
|----|---------|---------------|-------|-----------------|---------------|-----------|
| TC-01 | Home page | Site served | Open `index.html`; scroll through | Hero, 4 service cards, approach, concepts and CTA display; CTA reads "Let's Discuss Your Project" | | |
| TC-02 | About page | Site served | Open `about.html` | Overview, mission, values, process, audience and CTA display | | |
| TC-03 | Services page | Site served | Open `services.html`; use the jump links | Four services shown; each link scrolls to its section | | |
| TC-04 | Projects page | Site served | Open `projects.html` | Four concept cards with Objective, Solution, Intended outcome; fictional notice visible | | |
| TC-05 | Form validation | `contact.html` open | Submit empty form | Four errors shown; focus moves to name; status asks to fix fields | | |
| TC-06 | Form success | `contact.html` open | Enter valid values (message 20+ characters); submit | Form resets; message says nothing was sent or stored | | |
| TC-07 | Navigation consistency | Any page | Compare header on all pages | Same labels and order; current page highlighted | | |
| TC-08 | Responsive layout | Browser dev tools | Check 320, 375, 390, 600, 768, 900, 1024, 1366, 1920px on every page | No horizontal scroll, overlap or clipped content | | |
| TC-09 | Component consistency | Any page | Compare buttons, cards, footer | Visually consistent; footer is dark with light text | | |
| TC-10 | Links and assets | Site served | Click every link; check Network tab | No broken links or 404 files | | |
| TC-11 | Mobile menu | Width under 900px | Open menu; press Escape; reopen and click outside; reopen and select a link; resize to desktop | Menu closes each time; `aria-expanded` updates; desktop shows inline nav | | |
| TC-12 | CSS/JS loading | Dev tools Console | Load each page | No console errors; six CSS files and scripts load | | |
| TC-13 | Accessibility basics | Keyboard only | Tab through each page; use skip link; check labels | Logical order, visible focus, skip link works | | |
| TC-14 | GitHub Pages | After deployment | Open published URL | All pages and assets load from the subpath | | |
| TC-15 | Visual colour | Site served | View every page at desktop width | Gradient header band, coloured card accents, tinted sections and gradient CTA visible | | |
