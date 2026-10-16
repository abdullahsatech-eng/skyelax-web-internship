# FixFlow: Service Request Management

FixFlow is a small full-stack application for tracking service requests (IT support, maintenance,
electrical, plumbing and other issues). It was built for **SKYELAX Web Development Internship, Task 06:
"Develop a REST API and Connect It with the Frontend"**.

It is a portfolio demonstration. All sample records are fictional and contain no real people or organisations.

## Features

- REST API with `GET`, `POST`, `PUT` and `DELETE` for service requests, plus a health check.
- Persistent storage in MongoDB Atlas (nothing is stored only in the browser).
- Server-side validation with field-level error messages, consistent JSON envelopes and correct HTTP status codes.
- Centralised error handling that never leaks stack traces or secrets.
- React interface: live status summary, search and filters, pagination, details view, create/edit form,
  confirmation before deletion, and loading, empty, success and error states.
- Responsive layout (table on wide screens, cards on narrow ones), labelled forms, keyboard-operable dialogs.
- Automated tests (Vitest, Supertest, React Testing Library) and an importable Postman collection.

## Technology

| Area | Choice |
|---|---|
| Frontend | React 19, TypeScript, Vite, plain CSS design tokens |
| Backend | Node.js 20+, Express 5, TypeScript, Mongoose 8, Zod 3 |
| Database | MongoDB Atlas |
| Tests | Vitest, Supertest, React Testing Library, Postman |

Dependency versions are declared as ranges in `client/package.json` and `server/package.json`. After your first
`npm install`, the exact versions that were installed are recorded in each `package-lock.json`; commit those files.

## Architecture

```
React client  --HTTP/JSON-->  Express API  --Mongoose-->  MongoDB Atlas
(client/)                     (server/)                   (serviceRequests collection)
```

The API is layered so each part has one job: **routes** map URLs to **controllers**; controllers validate input
with **Zod schemas** and call the **service**; the service applies rules (such as "not found") and talks to a
**repository** interface; the MongoDB repository implements it using a **Mongoose model**. **Middleware**
turns every error into the documented JSON shape. The repository interface is also what lets the API tests run
without a database.

On the client, `src/api/` is the only code that calls `fetch`; components receive data through the
`useRequests` hook and never build URLs themselves.

## Directory structure

```
task-submissions/task-06/
  client/                 React app (src/api, components, features/requests, hooks, types, utils; tests/)
  server/                 Express API (src/config, controllers, errors, middleware, models, routes,
                          scripts, services, types, validators; tests/)
  postman/                FixFlow.postman_collection.json
  docs/                   API.md, TEST_PLAN.md, DEPLOYMENT.md
  PROJECT_STATE.md        Status, requirement traceability, limitations
  README.md
```

## Prerequisites

- Node.js 20 or newer (check with `node -v`) and npm.
- A free MongoDB Atlas account (see below).
- Postman (optional but required for requirement R12).

## 1. Set up MongoDB Atlas

Full click-by-click steps are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md#1-mongodb-atlas). In short:

1. Create (or reuse) an Atlas project and a free cluster.
2. Create a **database user** with a strong password and the narrowest role that works (read/write on the
   `fixflow` database; see the deployment guide).
3. Add your current IP address under **Network Access** (avoid permanent "allow from anywhere").
4. Copy the connection string and put it in `server/.env` (never in the client, never in a commit, never in chat).

## 2. Install and run locally

Use two terminals.

**Terminal 1: API**

```
cd task-submissions/task-06/server
npm install
copy .env.example .env        (macOS/Linux: cp .env.example .env)
```

Open `server/.env`, replace the `MONGODB_URI` placeholders with your own Atlas values, then:

```
npm run seed                  (optional: inserts 8 fictional demo records if the collection is empty)
npm run dev
```

The API listens on `http://localhost:4000`. Check `http://localhost:4000/api/v1/health`: a healthy API with a
working database returns `{"data":{"status":"ok","database":"up",...}}`.

**Terminal 2: web client**

```
cd task-submissions/task-06/client
npm install
copy .env.example .env        (macOS/Linux: cp .env.example .env)
npm run dev
```

Open the address Vite prints (normally `http://localhost:5173`). The default `CLIENT_ORIGIN` in the API example
file already allows that address.

## Environment variables

| File | Variable | Purpose |
|---|---|---|
| `server/.env` | `MONGODB_URI` | Atlas connection string (required, secret) |
| `server/.env` | `PORT` | API port, default `4000` |
| `server/.env` | `NODE_ENV` | `development` or `production` |
| `server/.env` | `CLIENT_ORIGIN` | Allowed browser origin(s) for CORS; required in production |
| `client/.env` | `VITE_API_BASE_URL` | API address including `/api/v1`; public value only |

The API refuses to start if a required variable is missing and says which one.

## API summary

Base path: `/api/v1`. Full details, schemas and examples are in [`docs/API.md`](docs/API.md).

| Method | Path | Success | Purpose |
|---|---|---|---|
| GET | `/requests` | 200 | List with `search`, `status`, `priority`, `category`, `page`, `limit` |
| GET | `/requests/:id` | 200 | Get one request |
| POST | `/requests` | 201 | Create |
| PUT | `/requests/:id` | 200 | Replace the editable fields |
| DELETE | `/requests/:id` | 204 | Delete (no body) |
| GET | `/health` | 200 / 503 | API and database health |

Errors use `{ "error": { "code", "message", "details?" } }` with 400, 404, 413, 422, 500 or 503.

Example validation failure (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is not valid.",
    "details": [{ "field": "requesterEmail", "message": "Requester email must be a valid email address" }]
  }
}
```

## Testing

```
cd server && npm test        # API tests (no database needed)
cd client && npm test        # UI and client-logic tests
npm run typecheck            # in either folder
npm run build                # in either folder
```

`server/tests/mongoRepository.integration.test.ts` tests the real MongoDB layer. It is **skipped** unless you set
`TEST_MONGODB_URI`; it always uses a separate database called `fixflow_test`.

```
PowerShell:  $env:TEST_MONGODB_URI="<your connection string>"; npm test
cmd.exe:     set TEST_MONGODB_URI=<your connection string> && npm test
```

### Postman

1. Start the API (`npm run dev` in `server/`).
2. In Postman choose **Import** and select `postman/FixFlow.postman_collection.json`.
3. Open the collection's **Variables** tab and check `baseUrl` (default `http://localhost:4000/api/v1`).
4. Run the whole collection with **Run collection** so the requests execute in order (request 02 stores
   `requestId` for the later ones).
5. Every request has assertions; a red test names the status or field that did not match. Failures in
   request 02 cause most later failures, so fix that one first.

Optional command line run: `npx newman run postman/FixFlow.postman_collection.json --env-var baseUrl=http://localhost:4000/api/v1`.

The full test plan and where to record your results is in [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md).

## Build

```
cd server && npm run build && npm start     # compiles to server/dist and runs it
cd client && npm run build                   # static site in client/dist
```

## Deployment

The frontend is a static site and the API needs a Node host, so they deploy separately (for example the client
and API on Render, the database on Atlas). Exact settings are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
Free tiers can sleep when idle, so the first request after a pause may be slow, and availability is not guaranteed.

## Known limitations

See [`PROJECT_STATE.md`](PROJECT_STATE.md) for the current verification status, including which checks have not yet
been run on a machine with a database.

- There is no authentication; anyone who can reach the API can change data. That is intentionally outside Task 06.
- No public deployment URL is claimed until one has been created and tested.
