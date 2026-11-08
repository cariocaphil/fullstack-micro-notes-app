# fullstack-micro-notes-app

A minimal contract-first full-stack notes application for exploring integration between Spring Boot, React, OpenAPI, generated TypeScript clients, Zod, React Hook Form, KoliBri, and TanStack Query.

This is a learning project focused on architectural clarity, accessibility, simplicity, and maintainability.

## Technology stack

- **Backend:** Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA, Jakarta Bean Validation, H2 (file-based)
- **Frontend:** React 19, TypeScript, Vite, npm
- **Contract:** OpenAPI 3.0.3 in [`contracts/openapi.yaml`](contracts/openapi.yaml)
- **Codegen:** [typed-openapi](https://github.com/astahmer/typed-openapi) (typed client + Zod v4 schemas)
- **Forms:** React Hook Form + `@hookform/resolvers` + generated `CreateNoteRequest`
- **UI:** KoliBri (`@public-ui/react-v19`, `@public-ui/components`, `@public-ui/theme-default` / DEFAULT theme)
- **Server state:** TanStack Query

## How the pieces fit together

| Layer | Responsibility |
|-------|----------------|
| **OpenAPI** | Shared API contract (source of truth) |
| **Zod** | Runtime validation generated from the contract |
| **React Hook Form** | Form state, blur/submit validation lifecycle |
| **KoliBri** | Accessible UI components (`KolInputText`, `KolButton`, `KolAlert`) |
| **TanStack Query** | Server state, mutations, cache invalidation |
| **Generated API client** | Typed HTTP via relative `/api` paths |
| **Spring Boot** | Backend validation, notes operations, H2 persistence |

Data flow: OpenAPI → typed-openapi → Zod + client → RHF/`zodResolver` → KoliBri → TanStack Query → Vite `/api` proxy → Spring Boot → H2.

Field validation errors use KoliBri `_msg`. API failures use `KolAlert` only (no duplicated messages).

## Repository structure

```text
fullstack-micro-notes-app/
├── backend/
├── frontend/
│   └── src/
│       ├── api/           # generated client + stable schema exports
│       ├── components/    # NoteForm, NotesList
│       ├── query/         # noteKeys + API wrappers that reject on HTTP errors
│       ├── App.tsx
│       └── main.tsx       # KoliBri register + QueryClientProvider
├── contracts/openapi.yaml
├── README.md
└── .gitignore
```

## OpenAPI contract

[`contracts/openapi.yaml`](contracts/openapi.yaml) is authoritative. Do not hand-write duplicate request schemas.

```bash
cd frontend
npm run generate:api
npm run check:api
```

## Notes API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notes` | List notes (newest first) |
| `POST` | `/api/notes` | Create a note |
| `DELETE` | `/api/notes/{id}` | Delete a note |

## Backend

```bash
cd backend
./mvnw spring-boot:run
./mvnw test
```

Health: `GET http://localhost:8080/api/health`

## Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173 — proxies /api → :8080
npm test
npm run build
```

KoliBri is registered with the **DEFAULT** theme before React renders (`register(DEFAULT, defineCustomElements)` in `main.tsx`). Use `@public-ui/react-v19` because this app runs on React 19.

### Manual browser smoke (recommended before merge)

Automated happy-dom tests cannot fully reproduce KoliBri web-component behavior. Manually verify:

1. Start Spring Boot and Vite
2. Invalid note → field validation via `_msg`
3. Create a valid note → appears in the list
4. Reload → note persists (H2)
5. Delete → note disappears

## Development roadmap

1. **PR #1 — Project Foundation** — done
2. **PR #2 — OpenAPI Contract & Backend** — done
3. **PR #3 — Generated TypeScript Client & Zod** — done
4. **PR #4 — React Form, KoliBri & TanStack Query** — current / complete when manual smoke passes

## Known limitations

- KoliBri Stencil components do **not** bootstrap under happy-dom (`Skipping bootstrapping lazy components`). Component tests use HTML doubles that preserve the KoliBri React prop contract (`_on.onInput(event, value)`, `_msg`, `_label`). Prefer a real-browser smoke test for WC behavior.
- `field.ref` attaches to the KoliBri host element (`FocusableElement.focus()`), not the native shadow-DOM input.
- Mutation helpers force `throwOnStatusError: true` and map failures to `NotesApiError` so `mutateAsync` rejects on HTTP 4xx/5xx.
- Verified KoliBri callback shape: `onInput` is `EventValueOrEventCallback` → `(event, value) => void` (use the `value` argument, not `event.target.value`).
