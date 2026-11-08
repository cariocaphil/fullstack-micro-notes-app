# fullstack-micro-notes-app

A minimal contract-first full-stack notes application for exploring integration between Spring Boot, React, OpenAPI, generated TypeScript clients, Zod, React Hook Form, and TanStack Query.

This is a learning project focused on architectural clarity, simplicity, and maintainability.

## Technology stack

- **Backend:** Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA, Jakarta Bean Validation, H2 (file-based)
- **Frontend:** React, TypeScript, Vite, npm, Zod, React Hook Form (resolver-ready)
- **Contract:** OpenAPI 3.0.3 specification in [`contracts/openapi.yaml`](contracts/openapi.yaml)
- **Codegen:** [typed-openapi](https://github.com/astahmer/typed-openapi) — typed fetch client + Zod v4 schemas from the same contract

## Contract layers

| Layer | Role |
|-------|------|
| **OpenAPI** (`contracts/openapi.yaml`) | Shared API contract — source of truth |
| **TypeScript types** | Compile-time guarantees for requests/responses |
| **Zod schemas** | Runtime validation (forms, client input/output) |

Do not hand-write duplicate request schemas. Regenerate from the contract instead.

## Repository structure

```text
fullstack-micro-notes-app/
├── backend/      # Spring Boot application
├── frontend/     # React + Vite application
│   └── src/api/
│       ├── generated/   # typed-openapi output (committed)
│       ├── client.ts    # relative-/api notes client
│       └── schemas.ts   # stable CreateNoteRequest re-export
├── contracts/    # OpenAPI specification (source of truth)
├── README.md
└── .gitignore
```

## OpenAPI contract

[`contracts/openapi.yaml`](contracts/openapi.yaml) is the authoritative API specification.

The Spring Boot backend conforms to this contract. The frontend TypeScript client and Zod schemas are generated from the same file.

## Generated frontend API

Generator: **typed-openapi** with `--runtime zod` and a default fetcher.

Rationale: one tool produces both a typed HTTP client and object-shaped Zod schemas (including `CreateNoteRequest`) suitable for `zodResolver()` in PR #4, without overlapping generators.

Artifacts live in [`frontend/src/api/generated/`](frontend/src/api/generated/) and are committed so builds do not require codegen.

```bash
cd frontend
npm run generate:api   # regenerate from contracts/openapi.yaml
npm run check:api      # fail if generated files are stale (no tracked-file edits)
npm test               # Zod constraints, zodResolver smoke test, relative URL checks
```

Stable schema import for forms:

```ts
import { CreateNoteRequest } from "./api/schemas";
```

### Talking to Spring Boot

In development, Vite proxies `/api` to `http://localhost:8080`. The handwritten [`frontend/src/api/client.ts`](frontend/src/api/client.ts) wraps the generated client so `fetch` uses relative paths such as `/api/notes` (not `https://api.example.com` or `:8080`).

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Notes API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notes` | List notes (newest first) |
| `POST` | `/api/notes` | Create a note |
| `DELETE` | `/api/notes/{id}` | Delete a note |

Request body for create:

```json
{ "content": "Buy milk" }
```

`content` is required, length 3–100, and must contain at least one non-whitespace character.

### Example requests

```bash
# Create
curl -s -X POST http://localhost:8080/api/notes \
  -H 'Content-Type: application/json' \
  -d '{"content":"Buy milk"}'

# List
curl -s http://localhost:8080/api/notes

# Delete
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE http://localhost:8080/api/notes/1
```

Errors return:

```json
{ "code": "VALIDATION_ERROR", "message": "..." }
```

Stable codes: `VALIDATION_ERROR` (400), `NOTE_NOT_FOUND` (404).

## Backend

Prerequisites: Java 21+

```bash
cd backend
./mvnw spring-boot:run
```

Health check: `GET http://localhost:8080/api/health` → `{ "status": "UP" }`

Run tests (uses in-memory H2; also validates the OpenAPI contract):

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

1. **PR #1 — Project Foundation** — Monorepo bootstrap, health endpoint, React shell (done)
2. **PR #2 — OpenAPI Contract & Backend** — OpenAPI spec and notes API implementation (done)
3. **PR #3 — Generated TypeScript Client & Zod** — Client generation and Zod schemas (current)
4. **PR #4 — React Form & TanStack Query Integration** — Forms and data fetching wired to the contract
