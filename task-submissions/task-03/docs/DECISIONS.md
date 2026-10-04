# Decisions

| # | Decision | Reason |
|---|----------|--------|
| 1 | Static HTML/CSS/JS | Matches task scope; simple to host on GitHub Pages |
| 2 | CSS split into six files | Clear responsibilities and easier maintenance |
| 3 | JS split by behaviour | Navigation applies everywhere; form logic only on Contact |
| 4 | Mobile-first, breakpoints 600/700/900/1100px | Content reflows naturally; 900px switches to desktop navigation |
| 5 | Menu links stay visible without JavaScript | `js-enabled` class is added by script |
| 6 | System font stack, no external fonts | No external requests; reliable loading |
| 7 | SVG logo, icons and hero illustration | No photographs supplied; SVGs are small and sharp at any size |
| 8 | Contact form is a labelled demonstration | No backend exists; it must not claim delivery |
| 9 | Accessibility: semantic HTML, skip link, focus styles, labelled fields, `aria-current`, reduced motion | WCAG-informed practice; no formal compliance claimed |
| 10 | Projects shown as fictional concepts | Avoids implying real clients or results |
| 11 | Richer palette (blue, teal, violet, orange) with gradient headers and tinted sections | Response to mentor feedback to improve the UI and add colour |
| 12 | Accent colours applied through CSS custom properties per card | One component style, four colours, no duplicated rules |

## Assumptions due to missing source documents
The official Requirements & Design, Foundation, Design System and Design Tokens documents were not available. Colours, spacing, typography, breakpoints, page copy and service section IDs are developer choices, not official values. Update `tokens.css` and the pages if the official documents specify exact values.
