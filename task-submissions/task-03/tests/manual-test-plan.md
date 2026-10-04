# Manual Test Plan

**Project:** NexaWorks Digital — Task 3  
**Testing Type:** Manual Functional, Responsive, and Accessibility Testing  
**Test Environment:** To be recorded during testing  
**Test Date:** To be recorded

## Testing Instructions

- Run the website locally using Live Server or use the deployed GitHub Pages website.
- Execute each test using the steps provided.
- Record the observed outcome in **Actual Result**.
- Mark **Pass** only if the expected result is met; otherwise, mark **Fail**.
- Record any defects or unexpected behavior in the Notes column.

## Test Cases

| ID | Feature | Preconditions | Test Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|---|
| TC-01 | Home Page | Website is accessible | Open `index.html` and scroll through the page | Hero, four service cards, approach, project concepts, and CTA display correctly | | |
| TC-02 | About Page | Website is accessible | Open `about.html` | Overview, mission, values, process, audience, and CTA display correctly | | |
| TC-03 | Services Page | Website is accessible | Open `services.html` and use jump links | All four services display and each jump link navigates to the correct section | | |
| TC-04 | Projects Page | Website is accessible | Open `projects.html` | Four project concept cards display with objectives, solutions, intended outcomes, and fictional notice | | |
| TC-05 | Form Validation | Contact page is open | Submit the form without entering any data | Four validation errors display, focus moves to the name field, and status requests corrections | | |
| TC-06 | Form Success | Contact page is open | Enter valid form values, including a message of at least 20 characters, and submit | Form resets and a status message confirms that nothing was sent or stored | | |
| TC-07 | Navigation Consistency | Website is accessible | Compare the header navigation on all five pages | Same navigation labels and order appear, and the current page is highlighted | | |
| TC-08 | Responsive Layout | Browser developer tools available | Check all five pages at 320, 375, 390, 600, 768, 900, 1024, 1366, and 1920px widths | No horizontal scrolling, overlapping, or clipped content | | |
| TC-09 | Component Consistency | Website is accessible | Compare buttons, cards, and footer across all pages | Components are visually consistent; footer has a dark background and light text | | |
| TC-10 | Links and Assets | Website is accessible | Click internal and external links; inspect the Network tab | Links work and no assets return 404 errors | | |
| TC-11 | Mobile Menu | Viewport is under 900px | Open menu, press Escape, reopen and click outside, reopen and select a link, then resize to desktop | Menu closes as expected, `aria-expanded` updates correctly, and desktop navigation displays inline | | |
| TC-12 | CSS and JavaScript Loading | Browser developer tools available | Load each page and inspect the Console and Network tabs | Six CSS files and required scripts load with no console errors | | |
| TC-13 | Accessibility Basics | Keyboard available | Navigate each page using Tab and Shift+Tab; test skip link and form labels | Logical keyboard order, visible focus, working skip link, and accessible labels | | |
| TC-14 | GitHub Pages | Website deployed | Open the published URL and navigate through all pages | Pages, styles, scripts, and assets load correctly from the repository subpath | | |
| TC-15 | Visual Styling | Website is accessible | View every page at desktop width | Gradient header band, coloured card accents, tinted sections, and gradient CTA are visible | | |

## Test Summary

| Metric | Result |
|---|---|
| Total Test Cases | 15 |
| Passed | To be completed |
| Failed | To be completed |
| Not Tested | To be completed |
| Overall Status | Pending |

## Defect Log

| Test ID | Issue Found | Severity | Status |
|---|---|---|---|
| | | | |

## Final Notes

Complete the actual result and Pass/Fail fields after performing each test. Do not mark untested cases as passed. Record any issues in the defect log, resolve them where possible, and retest before finalizing the QA checklist.
