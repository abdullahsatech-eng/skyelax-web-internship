## Testing and Verification

The project was verified locally using the following checks:

| Check | Result |
|:--|:--|
| TypeScript type checking | Passed |
| Automated tests | 58 tests passed across 5 test files |
| Production build | Passed |
| Local application | Started successfully with Vite |
| GitHub Pages deployment | Deployed; live application available |

These results describe the checks performed during development. Repeat them after significant code changes.

## Deployment — GitHub Pages

**Live application:** [ScopeBridge — Task 05](https://abdullahsatech-eng.github.io/skyelax-web-internship/task-submissions/task-05/)

ScopeBridge is deployed as a static frontend application using GitHub Pages. The production build is generated with Vite and published under the Task 05 directory.

To run the application locally:

1. Open the `task-05` folder in VS Code.
2. Open the integrated terminal.
3. Install dependencies if necessary:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal.

To verify a production build:

```bash
npm run typecheck
npm test
npm run build
```

The production output is generated in `dist/`. For deployment changes, ensure the published files contain the generated HTML and assets rather than the uncompiled React/TypeScript source.

## Dependencies and Project Files

The project uses React, React DOM, TypeScript, Vite, and Vitest. Install the dependencies declared in `package.json` with `npm install`.

Keep `package.json` and `package-lock.json` synchronized when dependencies change. Do not commit generated dependency folders such as `node_modules/`.

## Known Limitations

- Frontend only: no backend, database, authentication, roles, real approval links, emails, payments, invoicing, or external integrations.
- Data is stored in the current browser using `localStorage`; it is not synchronized across devices or users.
- Approval and rejection are demonstration statuses and have no legal or external effect.
- Schedule extensions are added together; real projects may have overlapping work.
- Currency conversion and negative cost adjustments are not supported.
- Automated tests focus on business logic; manual browser testing is also required for interface workflows.
- The interface was designed with accessibility considerations, but no formal WCAG audit has been completed and formal compliance is not claimed.
