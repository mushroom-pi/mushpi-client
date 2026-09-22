# 🍄 Mushroom Pi 🍓 - Hub Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)![React Query](https://img.shields.io/badge/React%20Query-%23FF4154.svg?style=for-the-badge&logo=react%20query&logoColor=white)![React Router](https://img.shields.io/badge/React_Router-%23CA4245.svg?style=for-the-badge&logo=react-router&logoColor=white)![MaterialUI](https://img.shields.io/badge/Material%20UI-%23FFFFFF.svg?style=for-the-badge&logo=MUI&logoColor=#007FFF)![Vitest](https://img.shields.io/badge/Vitest-%23252529.svg?style=for-the-badge&logo=vitest&logoColor=FCC72B)

The **dashboard** for Mushroom Pi: a React 19 single-page app that visualises the data `mushpi-server` collects. It shows Pico units, live sensor charts, recipes and batches, and lets you send control commands — all through the server's REST API. It never talks to Pico units directly.

```
mushpi-grow (Pico 2W) ──REST──▶ mushpi-server (NestJS) ◀──REST── mushpi-client (React)
    port 5000                     port 3000                          port 5173
```

## Stack

React 19 · TypeScript ~5.9 · Vite 7 · MUI v7 + `@mui/x-date-pickers` v8 · TanStack React Query v5 · axios · React Router DOM v7 · Recharts v3 · zod v4 · dayjs · lodash · react-icons — built and tested with Yarn 4 (Berry) and Vitest 4.

## Prerequisites & Install

- **Node.js** (see `@types/node` in `package.json`)
- **Yarn 4 (Berry)** — pinned via `packageManager: yarn@4.14.1`; enable with `corepack enable`
- A running `mushpi-server` on `http://localhost:3000` (for live data and API regeneration)

```bash
yarn install
```

## Run & Build

```bash
yarn dev        # dev server → http://localhost:5173/
yarn build      # tsc -b && vite build (typecheck + bundle)
yarn preview    # serve the built bundle locally
```

### Where the backend URL lives

The client is configured by two `VITE_*` environment variables, read from a local, gitignored `.env` (there is no committed `.env.example`):

| Variable            | Default                 | Purpose                                                                              |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL` | `http://localhost:3000` | API origin for the generated client and image-URL resolution (`src/utils/apiUrl.ts`) |
| `VITE_DOCS_PATH`    | `contract`              | Path for the "API Docs" button on the Server page                                    |

```bash
# .env
VITE_API_BASE_URL=http://localhost:3000
VITE_DOCS_PATH=contract
```

There is **no Vite dev proxy** — all API traffic goes cross-origin to the server, so the server's CORS origin must include `http://localhost:5173` (its `CLIENT_URL` setting). In production the dashboard is served by the server itself and the API base is baked as `/` (same-origin).

## The Generated API Client (read this first)

`src/api/generated/api.ts` and `src/api/generated/schemas.ts` are **auto-generated from `mushpi-server`'s OpenAPI spec**. This is the single most important thing to know before touching the client:

- **Never hand-edit the generated files** — they are gitignored and regenerated on demand.
- The typed axios API comes from `openapi-generator-cli` (`typescript-axios`); the Zod validation schemas come from `openapi-zod-client`.
- After **any** `mushpi-server` endpoint or DTO change, regenerate:

```bash
yarn gen:all:remote   # regenerate BOTH, reading http://localhost:3000/contract-json
```

The remote variants require a running server. Offline, point at a local spec file (`./openapi.json`):

```bash
yarn gen:client          # API client from local openapi.json
yarn gen:schemas         # Zod schemas from local openapi.json

yarn gen:client:remote   # just the API client, from the running server
yarn gen:schemas:remote  # just the Zod schemas, from the running server
```

- **New API classes are not auto-wired.** When a new server controller appears, the generated `*Api` class lands in `api.ts` but must be manually imported and instantiated in `src/api/client.ts` alongside the existing `PicoUnits`, `Batches`, `Control`, etc.
- `yarn build` runs `tsc`, so a stale or broken generated `schemas.ts` will fail the build — regenerate before building.

## Project Layout

```
src/
├── api/         generated client (never edit) + client.ts, adapter.ts, queryKeys.ts
├── assets/      static SVGs
├── components/  shared components — atoms/ + molecules/ under ui/
├── contexts/    8 context providers (PicoUnit, PicoUnits, Recipe, Recipes, Batch, Batches, Charts, Toast)
├── hooks/       9 hooks + BatchForm/ + RecipeForm/
├── interfaces/  shared TS interfaces
├── layout/      app shell — Page wrapper, Sidebar
├── pages/       10 pages, one <Page>/index.tsx per route
├── styles/      global.css + variables.css
├── test/        Vitest setup.ts + fixtures.tsx
├── theme/       tokens.ts (sole colour source) + mushroomTheme.ts
├── types/       shared TS types
└── utils/       helpers (apiUrl.ts, buildInfo, …)
App.tsx   main.tsx
```

Routes:

| Path              | Page          |
| ----------------- | ------------- |
| `/`               | Dashboard     |
| `/pico-units`     | Units list    |
| `/pico-units/:id` | Unit detail   |
| `/readings`       | Charts        |
| `/recipes`        | Recipes list  |
| `/recipes/:id`    | Recipe detail |
| `/batches`        | Batches list  |
| `/batches/:id`    | Batch detail  |
| `/server`         | Server health |
| `/settings`       | Settings      |

## Day-to-Day Commands

| Command                                                | What it does                                              |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `yarn dev`                                             | Vite dev server on port 5173                              |
| `yarn build`                                           | `tsc -b && vite build` (typecheck + bundle)               |
| `yarn preview`                                         | Serve the built bundle                                    |
| `yarn lint` / `yarn lint:fix`                          | ESLint (local, autofixing)                                |
| `yarn lint:ci`                                         | ESLint gate — `--max-warnings=0` (non-mutating)           |
| `yarn format` / `yarn format:check`                    | Prettier                                                  |
| `yarn test` / `yarn test:watch` / `yarn test:coverage` | Vitest                                                    |
| `yarn gen:all:remote`                                  | Regenerate API client + Zod schemas from a running server |
| `yarn audit:prod` / `yarn audit:ci`                    | Dependency audit (informational / gating)                 |
| `yarn knip` / `yarn knip:ci`                           | Dead-code / unused-dependency report and gate             |

Convention: bare scripts are local (may mutate); `:ci` scripts are non-mutating fail-on-findings gates.

## Pointers

- [`AGENTS.md`](AGENTS.md) — authoritative agent instructions: path aliases, component inventory, state-management conventions, coding rules.
- [`REFERENCE.md`](REFERENCE.md) — long-tail gotchas (regeneration offline, polling/mutation patterns, image handling, Husky, knip).
- `mushpi-docs/architecture/c4-container.md` and `mushpi-docs/architecture/c4-component-client.md` — where this app fits in the system and its internals.
- `mushpi-docs/versioning.md` — release & version semantics (the footer build/release versions).

> This README is for humans. `AGENTS.md` + `REFERENCE.md` are the authoritative instructions that coding agents read.

## License

Distributed under the MIT License — see [`LICENSE`](LICENSE).

Copyright (c) 2026 [Adriana Martín de Aguilera](https://www.amda.dev)
