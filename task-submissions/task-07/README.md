# Task 07 — StockDesk Inventory Management System

## Overview

StockDesk is a web-based inventory management system designed to help users manage products, categories, and suppliers through a centralized interface.

The project uses a React and TypeScript frontend and a Node.js, Express, TypeScript, and MongoDB backend.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- Zod for request validation

**Testing**
- Vitest
- Supertest

## Project Structure

```text
task-07/
├── client/
├── server/
├── docs/
├── postman/
├── .gitignore
└── README.md
```

## Main Features

- View and manage inventory products.
- Create, update, and delete products.
- Organize products by category.
- Associate products with suppliers.
- Validate product data and API requests.
- Handle API errors and network failures.
- Connect the application to MongoDB.
- Test frontend and backend functionality.

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or another compatible MongoDB deployment
- A modern web browser

## Local Setup

### 1. Backend

Open a terminal in the `server` directory and install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a template. Configure your MongoDB connection string and database settings. Never commit the real `.env` file.

Initialize the database reference data:

```bash
npm run db:setup
```

Start the development server:

```bash
npm run dev
```

The backend uses port `3000` by default.

### 2. Frontend

Open another terminal in the `client` directory:

```bash
npm install
npm run dev
```

Vite uses port `5173` by default.

For local development, the frontend can use the Vite development server proxy. For deployment, configure `VITE_API_BASE_URL` to point to the hosted backend API.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API and database status |
| GET | `/api/products` | Retrieve products |
| POST | `/api/products` | Create a product |
| GET | `/api/products/:id` | Retrieve a product by ID |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/categories` | Retrieve categories |
| GET | `/api/suppliers` | Retrieve suppliers |

## Testing and Build

Run backend checks from the `server` directory:

```bash
npm run typecheck
npm test
npm run build
```

Run frontend checks from the `client` directory:

```bash
npm run typecheck
npm test
npm run build
```

## Security Notes

- Keep database credentials and secrets in environment variables.
- Do not upload `.env` files containing private credentials.
- Use `.env.example` to document required configuration variables.
- Configure CORS for the actual deployed frontend origin.
- Validate incoming API data before database operations.

## Project Status

The application has passed the frontend production build, backend TypeScript type checking, and the available backend automated tests in the current development environment. Some integration tests were skipped; deployment and production-environment checks must be verified separately.

## Repository

[SKYELAX Web Development Internship](https://github.com/abdullahsatech-eng/skyelax-web-internship)

---

*Task 07 — StockDesk Inventory Management System*
