# Testing record - Task 07

**Honest status:** the application and tests were authored in an environment where the npm registry and
MongoDB Atlas were unreachable. Dependencies could not be installed, so **no TypeScript compile, Vite build,
automated test run, Postman run, browser check or Atlas connection has been performed.** Fill in the
"Your result" column when you run each item.

Status values: Passed / Failed / Blocked / Not run.

## Checks that were actually performed during authoring
| Check | Result |
|---|---|
| Node 22.22.2 / npm 10.9.7 present | Confirmed |
| `npm install` | **Blocked** (network unavailable, timed out) |
| Syntax parse of 21 server `.ts` files (type-stripping) | Passed for 20; `httpError.ts` skipped only because strip-only mode does not support constructor parameter properties (valid TypeScript, accepted by `tsc`/`tsx`) |
| Money conversion logic (`utils/money.ts`) executed directly in Node, 18 assertions including the float artefact `0.1+0.2` | Passed |
| Postman collection is valid JSON (21 requests) | Passed |
| Client `.tsx` files parsed / compiled | **Not run** (no TypeScript/JSX toolchain offline) |

## Automated tests (to run yourself)
Commands: `cd server && npm run typecheck && npm test`, `cd client && npm run build && npm test`.

| Suite | Tests cover | Needs Atlas? | Status in authoring env | Your result |
|---|---|---|---|---|
| `server/tests/money.test.ts` | cents conversion, round trips | No | Not run (logic checked manually, see above) | |
| `server/tests/validation.test.ts` | required fields, negative price/quantity, fractional quantity, bad ids, unknown fields, SKU normalisation | No | Not run | |
| `server/tests/errorHandling.test.ts` | 503 while disconnected, malformed JSON, 404 route, 409/400/503/500 mapping, no secret leakage | No | Not run | |
| `server/tests/products.integration.test.ts` | create/read/update/delete persistence, 404, malformed id, duplicate SKU (index), invalid data, invalid references, reference data | **Yes** (`TEST_MONGODB_URI`, `*_test` database) | **Blocked** (no credentials/network) | |
| `client/src/lib/validateProduct.test.ts` | form rules | No | Not run | |
| `client/src/App.test.tsx` | loading, empty, load failure + retry, form validation, create, server-error with values kept, edit, delete confirm/cancel/success/failure, search | No (mocked fetch; not evidence of DB connectivity) | Not run | |

Without `TEST_MONGODB_URI`, the integration suite reports a skipped test named "BLOCKED..." - that must not be counted as a pass.

## Manual API checks (Postman collection, run in order)
Import `postman/stockdesk.postman_collection.json`; start the API first. Expected results are embedded in each request.

| # | Request | Expected | Your result |
|---|---|---|---|
| 00 | GET /api/health | 200, database `connected` | |
| 01-02 | GET categories / suppliers | 200, non-empty (after `npm run db:setup`) | |
| 03 | POST valid product | 201, price `"24.50"` | |
| 04 | GET list | 200, contains new product | |
| 05 | GET one | 200 | |
| 06 | PUT update | 200, quantity 3, price `"30.00"` | |
| 07 | GET after update | 200, update persisted | |
| 08 | POST duplicate SKU | 409 `DUPLICATE_VALUE` | |
| 09-13 | negative price, negative quantity, fractional quantity, missing fields, `_id` in body | 400 each | |
| 14-15 | nonexistent category / supplier | 400 `INVALID_REFERENCE` | |
| 16 | GET `/api/products/not-an-id` | 400 `INVALID_ID` | |
| 17 | GET missing valid id | 404 | |
| 18 | DELETE | 204 | |
| 19 | GET after delete | 404 | |
| 20 | DELETE again | 404 | |

Database-outage check (safe): stop the API, set a wrong password in `.env`, start it - it must exit with a clear
message and no secret in the output. Or, with the API running, briefly remove your IP from Atlas Network Access
and reload the app: expect "Could not load the inventory" / 503, not an empty list.

## Manual browser checklist
| Check | Your result |
|---|---|
| Loading indicator appears, then products | |
| Empty database shows "No products yet" (not an error) | |
| API stopped -> error panel with "Try again" (not an empty list); Try again works after restart | |
| Add product with valid data -> success message, row appears; refresh page, still there | |
| Submit empty form -> inline errors, nothing sent, focus moves to first error | |
| Duplicate SKU -> message on SKU field, other entries preserved | |
| Edit product -> change persists after refresh | |
| Delete -> confirmation; Cancel keeps it; Confirm removes it; refresh, still gone | |
| Search and category filter narrow the list; "Clear filters" works | |
| Quantity 0 shows "Out of stock" text badge | |

## Responsive and accessibility checks (not yet performed)
Use browser dev tools device mode.

| Check | Your result |
|---|---|
| 375 px: no horizontal page scroll, rows readable as labelled blocks, buttons not clipped | |
| 768 px, 1366 px, 1440 px: layout sensible, table readable | |
| Keyboard only: Tab reaches skip link, search, filter, buttons, form; focus ring visible; Esc closes the delete dialog | |
| Every input has a visible label; errors are announced (screen reader or inspect `role="alert"`) | |
| Contrast spot-check with browser dev tools | |

## Regression review (do before committing)
- Every changed/added file is under `task-submissions/task-07/`.
- No file named `.env` is in the upload; `server/.env.example` contains only placeholders.
- Root README, other task folders and live-demo links are unchanged in the GitHub "Files changed" view.
