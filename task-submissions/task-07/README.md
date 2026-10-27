# StockDesk - Inventory Management (SKYELAX Task 07)

**Task:** Build a Database-Driven Web Application (SKYELAX Web Development Internship, Task 07).
**Location in repository:** `task-submissions/task-07/` (self-contained; no other task folder is touched).

> **Verification status (read first):** this code was written without the ability to install
> dependencies or reach MongoDB Atlas, so **nothing here has been compiled, run, or tested
> against a real database yet**. See [docs/testing-record.md](docs/testing-record.md) for the exact
> status of every check and the steps to run them yourself.

## What it does

StockDesk lets a small business manage products stored in MongoDB Atlas.

- View all products (name, SKU, category, supplier, price, stock).
- Add, edit and delete products (deletion asks for confirmation).
- Pick the category and supplier from lists loaded from the database.
- Search by name/SKU and filter by category (optional extras, done in the browser).
- Clear loading, empty, success and error states; a failed load is never shown as an empty inventory.

Categories and suppliers are **read-only reference data** (no screens to manage them).
Out of scope on purpose: authentication, orders, payments, analytics and anything for Tasks 08-11.

## Technology

| Part | Choice |
|---|---|
| Frontend | React 18, TypeScript, Vite, plain responsive CSS (Grid/Flexbox) |
| Backend | Node.js, Express 4, TypeScript |
| Database | MongoDB Atlas via Mongoose 8 |
| Validation | Zod (server), mirrored rules in the form (client) |
| Tests | Vitest, Supertest, React Testing Library, Postman collection |

These are recommended choices, not official Task 07 requirements. Versions are the ranges in the two
`package.json` files; the exact installed versions will be pinned in `package-lock.json` after you run `npm install`.

## Project layout

```
task-07/
├── README.md
├── .gitignore               # excludes .env, node_modules, dist
├── docs/                    # requirements traceability + testing record
├── postman/                 # API collection with expected results
├── server/                  # Express API
│   ├── .env.example
│   ├── src/  (app, server, config, db/, models/, routes/, validation/, middleware/, utils/, scripts/)
│   └── tests/
└── client/                  # React app
    ├── .env.example
    └── src/  (App, api/, components/, lib/, test/, styles.css)
```

## Database design

Three collections in the database named by `MONGODB_DATABASE` (default `stockdesk`):

| Collection | Fields | Indexes / rules |
|---|---|---|
| `categories` | `_id`, `name`, `description?`, `createdAt` | unique `name` |
| `suppliers` | `_id`, `name`, `email?`, `phone?`, `createdAt` | - |
| `products` | `_id`, `name`, `sku`, `categoryId`, `supplierId`, `priceCents`, `quantity`, `createdAt`, `updatedAt` | unique `sku`; indexes on `categoryId`, `supplierId` |

**Relationships:** one category and one supplier can be used by many products. MongoDB has no foreign
keys, so the API checks that the referenced category and supplier exist before every create/update
(response `400 INVALID_REFERENCE`). Duplicate SKUs are enforced by the unique index and reported as `409`.

**Money:** prices are stored as integer minor units (`priceCents`) and exposed by the API as strings
such as `"24.50"`. No floating-point arithmetic is applied to prices; maximum is 9,999,999.99. The
interface is currency-neutral (it shows the amount without a currency symbol).

**Timestamps:** `createdAt`/`updatedAt` are maintained by Mongoose; clients cannot set them.

## Setup

### Prerequisites
Node.js 18.18 or newer (Node 22 was present in the authoring environment) and a MongoDB Atlas account.
Git is **not** required.

### 1. MongoDB Atlas
1. Sign in at <https://cloud.mongodb.com> and create a free cluster (M0 is sufficient).
2. **Database Access -> Add New Database User.** Use password authentication and a strong password. Under
   privileges choose *Specific Privileges* -> role `readWrite` on database `stockdesk` (add a second
   `readWrite` entry for `stockdesk_test` if you will run the integration tests). Do not use an admin user.
3. **Network Access -> Add IP Address -> "Add Current IP Address".** Avoid `0.0.0.0/0` (open to everyone).
   If your home IP changes, add the new one.
4. **Database -> Connect -> Drivers.** Copy the connection string (`mongodb+srv://...`) and replace
   `<password>` with your user's password. If the password has special characters (`@ : / ? # %`),
   URL-encode them.

### 2. Backend configuration
```
cd server
copy .env.example .env        (Windows)   |   cp .env.example .env   (macOS/Linux)
```
Edit `server/.env` and set `MONGODB_URI` to your connection string. **Never commit `.env`** (it is
excluded by `.gitignore`) and never paste the string into code, documents or screenshots.

### 3. Install, initialise the database, start
```
cd server
npm install
npm run db:setup      # creates indexes and adds missing reference data
npm run dev           # API on http://localhost:3000
```
`db:setup` is safe to repeat: it only inserts categories/suppliers that do not exist yet (matched by
name) and never overwrites or deletes anything. Collections are created on first use; indexes are built
at startup and by `db:setup`.

In a second terminal:
```
cd client
npm install
npm run dev           # app on http://localhost:5173
```
Vite proxies `/api` to port 3000, so no CORS or URL configuration is needed in development.
If the API is hosted elsewhere, set `VITE_API_BASE_URL` in `client/.env` and `CORS_ORIGIN` in `server/.env`.

### Scripts
| Folder | Command | Purpose |
|---|---|---|
| server | `npm run dev` | API with auto-restart |
| server | `npm run build` / `npm start` | compile to `dist/` and run it |
| server | `npm run typecheck` | TypeScript check (src and tests) |
| server | `npm run db:setup` | indexes + reference data |
| server | `npm test` | all server tests |
| client | `npm run dev` / `build` / `preview` | dev server, typecheck+bundle, preview |
| client | `npm test` | UI and validation tests |

## API

All responses are JSON. Success: `{ "data": ... }`. Errors: `{ "error": { "code", "message", "details?" } }`.

| Method | Endpoint | Result |
|---|---|---|
| GET | `/api/health` | `200` `{status, database}` (works without a database) |
| GET | `/api/products` | `200` list, newest first |
| GET | `/api/products/:id` | `200` one product |
| POST | `/api/products` | `201` created product |
| PUT | `/api/products/:id` | `200` updated product (full replacement of editable fields) |
| DELETE | `/api/products/:id` | `204` no body |
| GET | `/api/categories` | `200` list |
| GET | `/api/suppliers` | `200` list |

Product body (both POST and PUT): `{ name, sku, categoryId, supplierId, price, quantity }`.

| Status | When |
|---|---|
| 400 | invalid/missing fields, unknown fields (e.g. `_id`), malformed JSON, malformed id (`INVALID_ID`), nonexistent category/supplier (`INVALID_REFERENCE`) |
| 404 | well-formed id with no matching product |
| 409 | duplicate SKU |
| 503 | database unreachable (`DATABASE_UNAVAILABLE`) - used instead of 500 so clients can tell outages from bugs |
| 500 | unexpected failure; message is generic, details are only in the server log |

A nonexistent category/supplier is reported as 400 (a bad value in the request) rather than 409; this is a
design decision, applied consistently.

### Validation rules (enforced on the server; the form mirrors them)
- `name`: required, trimmed, at most 120 characters.
- `sku`: required, trimmed, at most 40, letters/numbers/`.`/`-`/`_` only, stored in capitals, unique.
- `categoryId`, `supplierId`: 24-character hex ids that must exist.
- `price`: zero or more, at most 2 decimals, maximum 9999999.99 (string or number accepted).
- `quantity`: whole number, 0 to 1,000,000,000 (must be a JSON number).
- Only these six fields are accepted; anything else is rejected, so `_id`, timestamps and `priceCents` cannot be set by clients.

## Testing

```
cd server && npm test        # unit + API-level tests (no database needed for most)
cd client && npm test        # UI tests with a mocked API
```
- **Real-database integration tests** (`server/tests/products.integration.test.ts`) run only if `TEST_MONGODB_URI`
  is set in `server/.env`, and only against a database whose name ends in `_test` (default `stockdesk_test`).
  They delete all documents in that database - never point them at `stockdesk`. Without the variable they are
  reported as skipped, not passed.
- The client tests replace `fetch` with an in-memory fake. They prove UI behaviour, **not** database connectivity.
- **Postman:** import `postman/stockdesk.postman_collection.json`, run the requests in order against a running
  API. Each request lists the expected status and has an assertion script.
- **Manual browser checklist:** see [docs/testing-record.md](docs/testing-record.md).

## Security notes
- The connection string exists only in `server/.env`; the browser never receives it. Error responses and logs
  are scrubbed of connection strings and stack traces.
- Strict request schemas prevent mass assignment; MongoDB queries go through Mongoose with validated values.
- Request bodies are limited to 10 kB; CORS allows only `CORS_ORIGIN`.
- Use a least-privilege Atlas user and an IP allow-list as described above.

## Troubleshooting
| Symptom | Likely cause / fix |
|---|---|
| `MONGODB_URI is missing or still a placeholder` | `.env` not created in `server/`, or still contains the example text |
| `Could not connect to MongoDB` with a timeout / server selection error | your IP is not in Atlas Network Access, or no internet |
| `bad auth` / `Authentication failed` | wrong user or password, or password not URL-encoded |
| Page says "Could not load the inventory" | API not running on port 3000, or database unreachable (503) |
| Add button is disabled / yellow notice about categories | run `npm run db:setup` in `server/` |
| `EADDRINUSE` | another program uses the port; change `PORT` (and the proxy target in `client/vite.config.ts`) |

## Known limitations
- Not yet compiled or run (see the top of this file). Expect to possibly fix small type or dependency issues on first run.
- No authentication, pagination, or deployment (not required by Task 07).
- Search and category filtering run in the browser over the loaded list, which is fine for small inventories only.
- Category/supplier management and deletion safeguards for reference data are intentionally absent; they are seeded, read-only data.
- Accessibility was designed in (labels, focus styles, text-based status) but has **not** been audited; no WCAG compliance is claimed.
