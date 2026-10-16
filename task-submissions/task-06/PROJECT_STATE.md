# Project state: FixFlow (Task 06)

Last updated: 16 October 2026 (delivery of the first complete implementation).

## Summary

All source code, tests, documentation, the Postman collection and configuration templates exist. The code has
been **written and partially verified in a sandbox that had no npm registry or database access**. The real test
suites, the TypeScript type-check, production builds, Postman run, database integration and deployment have
**not** been run yet and are marked UNVERIFIED below. See `docs/TEST_PLAN.md` for exact evidence.

Status key: **PASS** = verified with real evidence. **PARTIAL** = some evidence, not sufficient. **UNVERIFIED** = not yet run.

## Requirement traceability

| ID | Requirement | Implemented in | Evidence so far | Evidence still needed | Status |
|---|---|---|---|---|---|
| R1 | REST API routes | `server/src/routes/requestRoutes.ts`, `server/src/app.ts` | Syntax valid | `npm test` (B1-B10), Postman 01-22 | UNVERIFIED |
| R2 | GET requests | `controller.list`, `controller.getOne` | UI exercised GET against a stand-in API | B4, B5, Postman 03-05, real run | UNVERIFIED |
| R3 | POST requests | `controller.create` | same (stand-in) | B1-B3, Postman 02 | UNVERIFIED |
| R4 | PUT/PATCH | `controller.replace` (PUT) | same (stand-in) | B6, Postman 06 | UNVERIFIED |
| R5 | DELETE | `controller.remove` (204) | same (stand-in) | B7, Postman 20-22 | UNVERIFIED |
| R6 | HTTP status codes | `requestController.ts`, `errorHandler.ts`, documented in `docs/API.md` | none | B1-B10, Postman | UNVERIFIED |
| R7 | Structured JSON | `{data}` / `{data, meta}` / `{error}` envelopes | none | B8 shape test, Postman | UNVERIFIED |
| R8 | Input validation | `server/src/validators/` (Zod, strict) plus client mirror | Client rules run directly (A6, 6/6) | B2, B3, Postman 08-14 | UNVERIFIED (server), PARTIAL (client) |
| R9 | API error handling | `server/src/middleware/errorHandler.ts` | none | B3, B8, B9, Postman 15-19 | UNVERIFIED |
| R10 | API connected to frontend | `client/src/api/` (single fetch layer) | UI tested against a stand-in API, 62/62 and 13/13 | Run client against the real API (E4) | PARTIAL |
| R11 | API data displayed | `client/src/features/requests/` | same | E4 with real data | PARTIAL |
| R12 | Test with Postman | `postman/FixFlow.postman_collection.json` (22 requests, 67 assertions) | Valid JSON, scripts parse | Execute the collection (E3) | UNVERIFIED |
| R13 | Configured, working, documented | README, `docs/`, `.env.example` files | Docs written | Fresh-machine setup (README steps 1 and 2) works | UNVERIFIED |

Do not mark a row PASS until the evidence column has a real result recorded in `docs/TEST_PLAN.md`.

## Other acceptance items

| Item | Status |
|---|---|
| Data persists in MongoDB (restart test, E5) | UNVERIFIED |
| Real-database persistence tests (C1-C4) | UNVERIFIED |
| Backend tests (B), frontend tests (D) | UNVERIFIED (not executed) |
| `npm run typecheck`, `npm run build` (both packages) | UNVERIFIED |
| Responsive layout at the six viewports | PASSED in Chromium against a stand-in API (A4); other browsers not tested |
| Keyboard basics (focus trap, Escape, focus return) | PASSED in Chromium (A4); full manual pass (E8) pending |
| Colour contrast measured, screen reader tested | Not tested |
| Tasks 01-05 untouched | The delivery contains only `task-submissions/task-06/`; no other path is created |
| Public deployment | Not done; no URL is claimed |

## Decisions and assumptions

- Stack as specified in the approved prompt. Zod 3 is used rather than Zod 4 for a stable, well-known API.
- Repository interface between service and MongoDB so API tests run without a database; real persistence is
  covered by a separate opt-in suite using database `fixflow_test`.
- `statusCounts` in list `meta` covers the whole collection so dashboard numbers stay correct when filtering or paging.
- PUT requires all editable fields (full replacement). Unknown or server-managed fields give 422.
- Extra status code beyond the contract list: 413 for bodies over 10 KB (documented).
- Client uses relative asset paths (`base: './'`) so it works from any static hosting path; no client-side routes.
- Recommended frontend host is a separate static host, not a changed GitHub Pages source, to avoid disturbing earlier tasks.
- No package-lock files are included because the delivery environment could not run `npm install`. Generate and commit them.
- Package versions are caret ranges chosen from knowledge, not looked up live. If `npm install` reports a conflict, record the fix here.

## Known limitations

- No authentication (out of scope; anyone with the API URL can modify data).
- Search uses a case-insensitive regular expression scan, fine for demo size but not for large collections.
- Free hosting may sleep when idle.
- Seed data are fictional and prefixed `[Demo]`.

## Next steps

1. Run `npm install`, `npm run typecheck`, `npm test` and `npm run build` in `server/` and `client/`; fix anything that fails.
2. Create the Atlas cluster, fill `server/.env`, run `npm run seed`, run both apps, exercise the UI (E4, E5).
3. Run the Postman collection (E3); optionally run the integration suite with `TEST_MONGODB_URI` (C1-C4).
4. Record all results in `docs/TEST_PLAN.md`, then update the table above.
5. Deploy following `docs/DEPLOYMENT.md` and tick its checklist.
6. Commit the generated `package-lock.json` files.
