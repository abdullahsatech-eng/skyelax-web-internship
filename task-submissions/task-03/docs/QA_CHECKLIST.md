# QA Checklist

**Project:** NexaWorks Digital — Task 3  
**Testing Type:** Functional, Responsive, Accessibility, and Deployment Testing  
**Status:** Pending Verification

> Tick each item only after you have personally verified it. Record any issues found and retest after fixing them.

## 1. Page Completeness

- [ ] Home, About, Services, Projects, and Contact pages open and display full content
- [ ] Each page has a unique title and exactly one `<h1>`
- [ ] All required sections and content are present
- [ ] Images, icons, and visual assets display correctly

## 2. Links and Navigation

- [ ] Header navigation links work on every page
- [ ] Footer links work on every page
- [ ] Service anchor links (`services.html#...`) navigate to the correct sections
- [ ] Current page is correctly highlighted in the navigation
- [ ] All internal links navigate to the correct pages
- [ ] No broken links or 404 errors for CSS, JavaScript, or SVG assets

## 3. Styling Consistency

- [ ] Header, dark footer, buttons, and cards are visually consistent across pages
- [ ] Gradient header band and accent colours appear as intended
- [ ] Tinted sections and gradient CTA display correctly
- [ ] No unstyled elements or unexpected layout differences
- [ ] Typography, spacing, and alignment are consistent

## 4. JavaScript Functionality

- [ ] Mobile menu opens and closes correctly
- [ ] Escape key closes the mobile menu
- [ ] Clicking outside closes the mobile menu
- [ ] Navigation selection closes the mobile menu
- [ ] `aria-expanded` updates correctly when the menu opens and closes
- [ ] No JavaScript console errors on any page

## 5. Contact Form

- [ ] Empty form submission displays validation errors
- [ ] Focus moves to the first invalid field
- [ ] Invalid email addresses are rejected
- [ ] Short messages are rejected
- [ ] Valid submission displays the correct demonstration message
- [ ] Form resets after valid submission
- [ ] Form clearly communicates that no data is sent or stored

## 6. Responsive Design

**Test viewport widths:** 320, 375, 390, 600, 768, 900, 1024, 1366, and 1920px.

- [ ] No horizontal scrolling on any page
- [ ] No overlapping or clipped content
- [ ] Text remains readable at different viewport sizes
- [ ] Navigation adapts correctly to screen size
- [ ] Images and cards resize appropriately
- [ ] Touch targets are comfortable on mobile devices
- [ ] All five pages remain usable at the tested widths

## 7. Accessibility

- [ ] Skip link works using the keyboard
- [ ] Focus indicators are always visible
- [ ] Tab order is logical on all pages
- [ ] Interactive elements are keyboard accessible
- [ ] Form fields have accessible labels
- [ ] Validation messages are understandable
- [ ] Website remains usable at 200% zoom
- [ ] Colour contrast has been checked using an accessibility tool

## 8. Browser Compatibility

- [ ] Google Chrome
- [ ] Microsoft Edge
- [ ] Mozilla Firefox
- [ ] Mobile browser

## 9. Regression Testing

- [ ] Task 1 folder remains unchanged
- [ ] Task 2 folder remains unchanged
- [ ] Existing repository content remains intact
- [ ] Task 3 changes do not interfere with other internship tasks

## 10. Deployment

- [ ] GitHub Pages URL loads successfully
- [ ] All five pages load from the published URL
- [ ] Relative asset paths work from the repository subpath
- [ ] CSS and JavaScript files load correctly after deployment
- [ ] SVG icons and illustrations display correctly on the live website
- [ ] Navigation and contact form functionality work on the deployed site

**Live Website:**  
https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-03/

## 11. QA Summary

| Metric | Result |
|---|---|
| Total test cases | 15 |
| Passed | To be recorded |
| Failed | To be recorded |
| Not tested | To be recorded |
| Defects resolved | To be recorded |
| Final QA status | Pending verification |

## 12. Defect Log

| Test ID | Issue Description | Severity | Resolution | Retest Status |
|---|---|---|---|---|
| | | | | |

## 13. Final Verification

- [ ] All applicable checklist items have been reviewed
- [ ] Failed tests have been documented
- [ ] Identified issues have been resolved where possible
- [ ] Fixed issues have been retested
- [ ] Manual Test Plan results have been recorded
- [ ] Final QA status has been updated

**Final Notes:**  
Complete this checklist based on actual testing. Do not mark untested items as passed. Any remaining limitations or unresolved issues should be documented before finalizing the project.
