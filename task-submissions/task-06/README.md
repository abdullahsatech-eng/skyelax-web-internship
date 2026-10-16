# FixFlow — Service Request Management Platform

FixFlow is a full-stack web application developed for the **SKYELAX Web Development Internship — Task 06: Develop a REST API and Connect It with the Frontend**.

The application enables users to create, view, update, search, filter, and delete service requests for common issues such as IT support, maintenance, electrical problems, and plumbing.

FixFlow is a portfolio demonstration. All sample records are fictional and do not represent real people or organisations.

## 1. Key Features

### REST API
- RESTful endpoints for retrieving, creating, updating, and deleting service requests.
- Appropriate HTTP status codes and structured JSON responses.
- Server-side input validation with field-level error details.
- Centralised error handling without exposing stack traces or secrets.
- API health-check endpoint.
- Search, filtering, and pagination for service requests.

### Frontend
- React and TypeScript interface connected to the REST API.
- Dashboard summary of request statuses.
- Search and filter controls.
- Paginated request list.
- Request details view.
- Create and edit forms.
- Confirmation before deletion.
- Loading, empty, success, and error states.
- Responsive table layout on wider screens and card layout on smaller screens.
- Labelled forms and keyboard-operable dialogs.

### Testing and Documentation
- Automated frontend tests using Vitest and React Testing Library.
- Automated API tests using Vitest and Supertest.
- Optional MongoDB repository integration tests.
- Importable Postman collection with request assertions.
- API documentation, test plan, deployment guide, and project-state documentation.

## 2. Technology Stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | CSS and design tokens |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB Atlas |
| Data access | Mongoose 8 |
| Validation | Zod 3 |
| Testing | Vitest, Supertest, React Testing Library |
| API testing | Postman or another API client |

Dependency version ranges are declared in `client/package.json` and `server/package.json`. The corresponding `package-lock.json` files record the resolved dependency versions.

## 3. Architecture

```text
React Frontend
      |
      | HTTP / JSON
      v
Express REST API
      |
      | Service and repository layers
      v
Mongoose
      |
      v
MongoDB Atlas
```

The backend separates routing, controllers, validation, services, repository access, and error handling to improve maintainability and testability.

The frontend centralises HTTP requests in `client/src/api/`. Components access request data through the application's hooks and feature modules rather than constructing API URLs independently.

The repository abstraction allows API tests to run without requiring a live database. Separate integration tests can verify the actual MongoDB repository.

## 4. Project Structure

```text
task-submissions/task-06/
├── client/                 # React frontend
├── server/                 # Express REST API
├── postman/
│   └── FixFlow.postman_collection.json
├── docs/
│   ├── API.md
│   ├── TEST_PLAN.md
│   └── DEPLOYMENT.md
├── PROJECT_STATE.md
└── README.md
```

## 5. Prerequisites

- Node.js 20 or newer.
- npm.
- A MongoDB Atlas account and database connection string.
- Postman or another API client for API verification.

## 6. Run the Application Locally

Run the backend and frontend in separate terminals.

### 6.1 Configure MongoDB Atlas

1. Create or reuse a MongoDB Atlas project and cluster.
2. Create a database user with the minimum permissions needed for the `fixflow` database.
3. Allow your current IP address through Atlas Network Access.
4. Configure the connection string in `server/.env`.

**Security:** Never commit `.env` files or expose database credentials in the frontend, GitHub, screenshots, or public documentation.

Detailed instructions are available in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

### 6.2 Start the Backend

From the project root, open a terminal and run:

```powershell
cd task-submissions/task-06/server
npm install
Copy-Item .env.example .env
```

Open `server/.env` and replace the MongoDB connection-string placeholder with your own valid connection string.

If you already have a correctly configured `.env`, do not overwrite it with the example file.

Optionally seed the database with fictional demonstration records:

```powershell
npm run seed
```

Start the API:

```powershell
npm run dev
```

The API normally runs at:

`http://localhost:4000`

Check the health endpoint:

`http://localhost:4000/api/v1/health`

A healthy API with a working database should return a successful response indicating that the API is running and the database is available.

### 6.3 Start the Frontend

Open a second terminal:

```powershell
cd task-submissions/task-06/client
npm install
Copy-Item .env.example .env
```

Configure `client/.env` if necessary. The `VITE_API_BASE_URL` variable should point to the API base URL, including `/api/v1`.

For local development, the expected API base URL is:

`http://localhost:4000/api/v1`

Start the frontend:

```powershell
npm run dev
```

Open the local URL displayed by Vite, normally:

`http://localhost:5173`

## 7. Environment Variables

| File | Variable | Purpose |
|---|---|---|
| `server/.env` | `MONGODB_URI` | MongoDB Atlas connection string; secret |
| `server/.env` | `PORT` | API port; defaults to `4000` |
| `server/.env` | `NODE_ENV` | Runtime environment |
| `server/.env` | `CLIENT_ORIGIN` | Allowed frontend origin for CORS |
| `client/.env` | `VITE_API_BASE_URL` | Public API base URL, including `/api/v1` |

Use the environment-variable names and requirements defined by the actual `.env.example` files. Frontend variables prefixed with `VITE_` are exposed to the browser and must never contain secrets.

## 8. REST API Reference

**Base URL:** `http://localhost:4000/api/v1`

Full request schemas, response examples, and error details are documented in [`docs/API.md`](docs/API.md).

| Method | Endpoint | Success status | Purpose |
|---|---|---:|---|
| GET | `/requests` | 200 | List service requests |
| GET | `/requests/:id` | 200 | Retrieve one request |
| POST | `/requests` | 201 | Create a request |
| PUT | `/requests/:id` | 200 | Update a request |
| DELETE | `/requests/:id` | 204 | Delete a request |
| GET | `/health` | 200 or 503 | Check API and database health |

The list endpoint supports search, status filtering, priority filtering, category filtering, and pagination.

Successful responses use structured JSON envelopes. Error responses follow the documented format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is not valid.",
    "details": [
      {
        "field": "requesterEmail",
        "message": "Requester email must be a valid email address"
      }
    ]
  }
}
```

The actual response status and error structure depend on the error encountered. See `docs/API.md` for the complete specification.

## 9. Testing

Run commands from the appropriate directory.

### Backend tests

```powershell
cd task-submissions/task-06/server
npm test
npm run typecheck
npm run build
```

### Frontend tests

```powershell
cd task-submissions/task-06/client
npm test
npm run typecheck
npm run build
```

The MongoDB repository integration tests require a separate test database configured through `TEST_MONGODB_URI`. They are skipped when that variable is not configured. The integration tests use a separate database named `fixflow_test`.

Do not use the production database for destructive integration tests.

### Postman API testing

1. Start the backend.
2. Open Postman and select **Import**.
3. Import `postman/FixFlow.postman_collection.json`.
4. Check that the collection's `baseUrl` variable points to the API.
5. Run the collection and inspect the response status codes and assertions.

The collection is designed to execute requests in order, including saving the created request ID for subsequent operations.

The complete verification checklist is in [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md).

## 10. Deployment

The frontend is a static web application, while the Express API requires a Node.js hosting environment. MongoDB Atlas provides the database service.

The frontend and backend can be deployed separately. Hosting configuration, environment variables, CORS requirements, and verification steps are described in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

**Deployment status:** No public deployment URL is claimed here. A deployment should be described as live only after the hosted frontend and API have been deployed and verified.

## 11. Known Limitations

- Authentication and role-based access control are not implemented; these are outside the stated scope of Task 06.
- The API must not be treated as a secure production service for unrestricted public use without appropriate access controls and a security review.
- MongoDB integration-test coverage depends on configuring the dedicated test database.
- Hosting availability and response times depend on the selected provider and its service tier.

See [`PROJECT_STATE.md`](PROJECT_STATE.md) for the current verification status and known limitations.

## 12. Task 06 Deliverable Summary

FixFlow demonstrates the following Task 06 requirements:

- REST API routes and CRUD operations.
- Appropriate HTTP status codes and structured JSON responses.
- Server-side input validation and API error handling.
- Frontend integration with the API.
- Dynamic display and management of service-request data.
- API testing using Postman or an equivalent API client.
- Project organisation and supporting technical documentation.

**Repository:** [SKYELAX Web Development Internship](https://github.com/abdullahsatech-eng/skyelax-web-internship/tree/main/task-submissions/task-06)

This README describes the intended functionality and setup. Refer to the test results and `PROJECT_STATE.md` for the checks actually completed.
