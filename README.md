# fullstack-micro-notes-app

A minimal contract-first full-stack notes application for exploring integration between Spring Boot, React, OpenAPI, generated TypeScript clients, Zod, React Hook Form, and TanStack Query.

This is a learning project focused on architectural clarity, simplicity, and maintainability.

## Technology stack

- **Backend:** Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA, Jakarta Bean Validation, H2 (file-based)
- **Frontend:** React, TypeScript, Vite, npm
- **Contract (upcoming):** OpenAPI specification in `contracts/`

## Repository structure

```text
fullstack-micro-notes-app/
├── backend/      # Spring Boot application
├── frontend/     # React + Vite application
├── contracts/    # OpenAPI specification (PR #2)
├── README.md
└── .gitignore
```

## Backend

Prerequisites: Java 21+

```bash
cd backend
./mvnw spring-boot:run
```

Health check: `GET http://localhost:8080/api/health` → `{ "status": "UP" }`

Run tests:

```bash
cd backend
./mvnw test
```

## Frontend

Prerequisites: Node.js 20+ and npm

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
cd frontend
npm run build
```

## Development roadmap

1. **PR #1 — Project Foundation** — Monorepo bootstrap, health endpoint, React shell
2. **PR #2 — OpenAPI Contract & Backend** — OpenAPI spec and notes API implementation
3. **PR #3 — Generated TypeScript Client & Zod** — Client generation and Zod schemas
4. **PR #4 — React Form & TanStack Query Integration** — Forms and data fetching wired to the contract
