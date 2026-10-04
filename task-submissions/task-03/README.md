# NexaWorks Digital — Task 3 Website

A modern, responsive, five-page business website developed for **Task 3 of the SKYELAX Software Solutions Web Development Internship**.

**Live Website:** [View NexaWorks Digital](https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-03/)

**Repository:** [SKYELAX Web Development Internship](https://github.com/abdullahsatech-eng/skyelax-web-internship/tree/main/task-submissions/task-03)

---

## Project Overview

NexaWorks Digital is a fictional digital solutions company created to demonstrate responsive web development, user-centered design, accessibility, maintainable code structure, and software quality engineering.

The website provides information about the company, its services, completed project concepts, and a contact form through a consistent, accessible, and mobile-friendly interface.

## Features

- **Five responsive pages:** Home, About, Services, Projects, and Contact
- **Consistent design system:** Shared header, navigation, footer, and reusable design tokens
- **Responsive navigation:** Collapsible mobile menu for smaller screens
- **Accessibility:** Skip navigation link, visible keyboard focus styles, and `aria-current` navigation state
- **Contact form:** Accessible client-side form validation
- **Service showcase:** Website Development, UI/UX Design, Web Applications, and Business Automation
- **Project portfolio:** Clearly labelled fictional project concepts
- **Scalable assets:** SVG logo, service icons, and hero illustration
- **Supporting documentation:** Requirements, traceability, design decisions, project foundation, and QA checklist
- **Manual testing plan:** Documented test cases for quality assurance

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic website structure |
| CSS3 | Styling, layouts, and responsive design |
| CSS Custom Properties | Reusable design tokens |
| CSS Grid & Flexbox | Flexible page layouts |
| JavaScript | Navigation and form validation |
| SVG | Scalable icons and illustrations |
| GitHub Pages | Website hosting |

No frameworks, build tools, or backend services are required.

## Project Structure

```text
task-03/
├── assets/
│   ├── icons/
│   │   ├── automation.svg
│   │   ├── logo.svg
│   │   ├── ui-ux.svg
│   │   ├── web-app.svg
│   │   ├── website.svg
│   └── images/
│       └── hero-illustration.svg
├── css/
│   ├── base.css
│   ├── components.css
│   ├── layout.css
│   ├── pages.css
│   ├── responsive.css
│   └── tokens.css
├── docs/
│   ├── DECISIONS.md
│   ├── PROJECT_FOUNDATION.md
│   ├── QA_CHECKLIST.md
│   ├── REQUIREMENTS.md
│   └── TRACEABILITY.md
├── js/
│   ├── contact-form.js
│   └── navigation.js
├── tests/
│   └── manual-test-plan.md
├── about.html
├── contact.html
├── index.html
├── projects.html
├── services.html
└── README.md
```

## Website Pages

- **Home:** Introduction to NexaWorks Digital and its core offerings.
- **About:** Company overview, mission, and values.
- **Services:** Overview of the company's digital services.
- **Projects:** Fictional project concepts demonstrating the company's capabilities.
- **Contact:** Contact information and a client-side validated contact form.

## Getting Started

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/abdullahsatech-eng/skyelax-web-internship.git
   ```

2. Navigate to the Task 3 directory:

   ```bash
   cd skyelax-web-internship/task-submissions/task-03
   ```

3. Open the folder in Visual Studio Code.

4. Install the **Live Server** extension, if needed.

5. Right-click `index.html` and select **Open with Live Server**.

Alternatively, open `index.html` directly in a browser.

## Deployment

The website is hosted using **GitHub Pages**.

**Live URL:**  
https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-03/

To configure GitHub Pages:

1. Open the repository on GitHub.
2. Navigate to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder.
5. Click **Save** and wait for GitHub Pages to publish the site.

The website uses relative asset paths to support deployment from a repository subdirectory.

## Accessibility and Responsive Design

The project applies user-centered design principles, including:

- Semantic HTML structure
- Keyboard-accessible navigation
- Visible focus indicators
- Skip link for easier navigation
- Accessible form labels and validation feedback
- Responsive layouts for different screen sizes
- Consistent visual components and reusable design tokens

## Testing and Quality Assurance

Testing documentation is available in the `tests/` and `docs/` directories.

- `tests/manual-test-plan.md` — Manual test procedures
- `docs/QA_CHECKLIST.md` — Quality assurance checklist
- `docs/REQUIREMENTS.md` — Project requirements
- `docs/TRACEABILITY.md` — Requirements traceability
- `docs/DECISIONS.md` — Design and implementation decisions

Follow the manual test plan to check navigation, responsiveness, form validation, accessibility, and general functionality across supported browsers and devices.

## Known Limitations

- The contact form performs client-side validation only. It does not send or store submissions.
- Project examples are fictional concepts created for demonstration purposes.
- Official Task 3 specification documents were not available when the project was developed. Design and implementation decisions are documented in `docs/DECISIONS.md`.
- Cross-browser, device, and accessibility testing should be completed manually using the supplied test plan.

## Learning Outcomes

This project demonstrates practical application of:

- Responsive web development
- Human-Computer Interaction (HCI)
- Requirements engineering
- Software quality engineering
- Web accessibility
- Maintainable and reusable code organization
- Manual testing and documentation
- GitHub-based version control and deployment

## Internship

**Program:** SKYELAX Software Solutions — Web Development Internship  
**Task:** Task 3 — Responsive Multi-Page Business Website  
**Project:** NexaWorks Digital

---

*Developed as an internship learning project to demonstrate modern, responsive, and accessible web development practices.*
