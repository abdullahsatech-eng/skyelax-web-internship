# Test plan and results

Status key:
- **PASSED (sandbox)**: executed by the author in a limited environment (no npm registry or database access).
- **NOT RUN**: written but not yet executed. These need your machine (`npm install`, Atlas, Postman).
- Fill the **Your result** column with PASS / FAIL and notes when you run them.

## A. What was actually executed before delivery

The delivery environment could not install npm packages or reach MongoDB, so the real test runners (Vitest,
Supertest), the TypeScript compiler with library types and the real Express/Mongoose server could **not** run.

| # | Check | How | Result |
|---|---|---|---|
| A1 | All 50 `.ts`/`.tsx` files (client, server, tests) are syntactically valid | esbuild parse of every file | PASSED (sandbox), 50/50 |
| A2 | Postman collection is valid JSON; all 22 test scripts parse as JavaScript | Node `JSON.parse` + `new Function` | PASSED (sandbox) |
| A3 | Client bundles with React 19 | esbuild bundle of `src/main.tsx` | PASSED (sandbox) |
| A4 | UI workflow in Chromium against a **stand-in API** that mimics this contract (not the real server): 62 checks covering six viewports, CRUD, filters, details, focus trap, Escape, focus return, touch-target size, overflow | Playwright script | PASSED (sandbox), 62/62 |
| A5 | UI error states by intercepting network calls: slow load, empty collection, 503, network failure, non-JSON 502, server 422 with input preserved, double-click sends one POST, failed delete | Playwright script | PASSED (sandbox), 13/13 |
| A6 | Client validation rules behave as specified | `tsx` script | PASSED (sandbox), 6/6 |

Viewports tested in A4: 320x640, 375x812, 768x1024, 1024x768, 1366x768, 1920x1080 (Chromium only). Per viewport:
no horizontal page overflow with the list and with the create dialog open, dialog within the viewport, submit button
visible, dialog controls at least 44px tall, no console errors.

**Limits of A4/A5:** the stand-in API is not the real backend, so they prove the UI logic, not full-stack integration.
Only Chromium was used. Contrast ratios and screen readers were not measured; only keyboard behaviour was exercised.

## B. Backend automated tests (`cd server && npm test`): NOT RUN

Run against an in-memory repository (no database). Expected: all pass.

| # | Area | Cases | Your result |
|---|---|---|---|
| B1 | POST | 201 + `Location` header; defaults (`priority` medium, `status` open); email lowercased; trimming | |
| B2 | POST validation | 16 invalid payloads (missing/blank/short/long fields, bad email, bad enums, client-supplied `id`/`createdAt`) each give 422 `VALIDATION_ERROR` with the right `field` | |
| B3 | POST body problems | `{}` lists every required field; JSON array body, empty body: 422; malformed JSON: 400 `MALFORMED_JSON`; oversized: 413 | |
| B4 | GET list | empty list shape; newest first; filters (status, priority, category, search, combined); `statusCounts` ignore filters; pagination meta; 8 invalid queries give 422 | |
| B5 | GET one | 200; unknown valid id 404; four malformed ids 400 `INVALID_ID` | |
| B6 | PUT | full replace + `updatedAt` change + persisted; incomplete body 422; `id`/`createdAt`/`updatedAt` rejected; invalid values; 404; 400 | |
| B7 | DELETE | 204 with empty body; then GET 404; second delete 404; unknown 404; malformed 400 | |
| B8 | Errors | unknown routes (4 variants) JSON 404; repository failure gives 500 with no leaked text; `MongoServerSelectionError` gives 503 without host details; all errors share the envelope | |
| B9 | Health | 200 up; 503 when check false; 503 when check throws, no secret in body | |
| B10 | CORS | allowed origin echoed; other origin gets no header; preflight for PUT | |
| B11 | Config | missing `MONGODB_URI`, missing `CLIENT_ORIGIN` in production, defaults, origin parsing, invalid port | |

## C. Persistence tests against real MongoDB: NOT RUN (needs Atlas)

`server/tests/mongoRepository.integration.test.ts`, enabled by `TEST_MONGODB_URI`, uses database `fixflow_test`.
Without the variable Vitest reports these as **skipped**; skipped is not passed.

| # | Case | Your result |
|---|---|---|
| C1 | Health reports database up | |
| C2 | Create, read, update, delete lifecycle, verified directly in the database | |
| C3 | Search with regex characters escaped, filters, pagination, `statusCounts` | |
| C4 | Unknown ids return 404 | |

## D. Frontend automated tests (`cd client && npm test`): NOT RUN

API module mocked, so these prove UI behaviour only. Expected: all pass.

| # | Case | Your result |
|---|---|---|
| D1 | Loading state, then data rendered; empty state; no-match state; API failure with retry and recovery | |
| D2 | Create: inline validation blocks submit; success notice and list reload; server field errors shown and input kept | |
| D3 | Details loaded through `getRequest`; edit pre-fills form, sends PUT payload, shows notice | |
| D4 | Delete: confirmation first, cancel does nothing, confirm deletes and refreshes, failure shown in dialog | |
| D5 | `validateRequestForm` rules; `apiRequest` (success, 204, 422 mapping, 404/5xx messages, non-JSON error, network failure) | |

## E. Full-stack and manual checks: NOT RUN (needs your machine)

| # | Check | Steps | Expected | Your result |
|---|---|---|---|---|
| E1 | Type checks | `npm run typecheck` in `server/` and `client/` | no errors | |
| E2 | Production builds | `npm run build` in both | succeed | |
| E3 | Postman collection | Run all 22 requests in order | all assertions pass | |
| E4 | CRUD in the browser against the real API | create, edit, view, delete a record | each succeeds, list refreshes | |
| E5 | Persistence across restart | create a record, stop and restart `npm run dev`, reload the page | record still present | |
| E6 | Seed | `npm run seed` on an empty collection | "Inserted 8 demo record(s)." then again: "Nothing inserted" | |
| E7 | Missing env var | start API without `MONGODB_URI` | clear message naming the variable, exit | |
| E8 | Keyboard | Tab through page and dialogs; Esc closes dialogs; visible focus ring | all operable | |
| E9 | Real-device or browser-resize check at the six viewports in Firefox/Safari if available | | no overflow | |
| E10 | Deployment checklist | `docs/DEPLOYMENT.md` section 4 | all ticked | |
