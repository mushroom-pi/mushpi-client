# mushpi-client — Project Context

React 19 + Vite web dashboard served from Raspberry Pi 3 B+. Talks only to `mushpi-server`; never directly to Pico units.

> **Skill**: For general React frontend patterns (atomic design, React Query conventions, Zod form validation, ModalForm/DataTable usage), load the `frontend-react` skill. This file documents **only** what is specific to this project or deviates from standard frontend conventions.
>
> **Reference**: long-tail details (path aliases, image handling, polling/mutation/chart gotchas, directory & file detail, regeneration, Vitest, known quirks, palettes, Husky, knip) live in [`REFERENCE.md`](./REFERENCE.md) — load **only when the task touches those areas**; the full topic list is at its top.

## Stack

React 19 · TypeScript ~5.9 · Vite 7 · MUI v7 + `@mui/x-date-pickers` v8 · TanStack React Query v5 · axios · React Router DOM v7 · Recharts v3 · zod v4 · dayjs · lodash · react-icons · Yarn Berry 4

## Path Aliases

14 aliases in `vite.config.ts` + `tsconfig.app.json` (keep in sync) — full table: REFERENCE.md §Path Aliases.

## API Client

`src/api/generated/api.ts` and `src/api/generated/schemas.ts` are auto-generated from `mushpi-server`'s OpenAPI spec. **Never edit manually.** Both files are gitignored. Always regenerate after any `mushpi-server` endpoint change.

```bash
yarn gen:client:remote   # regenerate API client from running server (port 3000)
yarn gen:client          # regenerate from local openapi.json
yarn gen:schemas:remote  # regenerate Zod schemas from running server
yarn gen:schemas         # regenerate from local openapi.json
yarn gen:all:remote      # regenerate both
```

Offline regeneration (no server running): REFERENCE.md §Regenerating the Client.

**New API classes must be manually wired.** After introducing a new server controller (e.g. `DashboardModule`), the generated `*Api` class (e.g. `DashboardApi`) is created in `src/api/generated/api.ts` but is **not auto-exported**. You must manually import and instantiate it in `src/api/client.ts` alongside the other API exports. Same pattern as existing `Control`, `Images`, `Monitoring`, etc.

## Routing

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

Page h1 titles mirror `navItems` labels (`<PageTitle>` for lists, `<ItemPage title>` for details). Tab-title & dialog-auto-open rules: REFERENCE.md §Known Quirks.

## Directory Structure

Directory-level index — per-file commentary in REFERENCE.md §Directory & File Detail.

```
src/
├── api/         generated client (never edit) + client.ts, adapter.ts, queryKeys.ts
├── assets/      static SVGs (~assets)
├── components/  shared components — see "Shared Components" below
├── contexts/    8: PicoUnit, PicoUnits, Recipe, Recipes, Batch, Batches, Charts, Toast
├── hooks/       9 hooks + BatchForm/ + RecipeForm/
├── interfaces/  shared TS interfaces
├── layout/      app shell — Page wrapper, Sidebar
├── pages/       10 pages, one <Page>/index.tsx per route (never bare <Page>.tsx)
├── styles/      global.css + variables.css (pre-mount token mirror)
├── test/        setup.ts, fixtures.tsx
├── theme/       tokens.ts (sole color source) + mushroomTheme.ts + tokens.test.ts
├── types/       shared TS types
└── utils/       helpers
App.tsx   main.tsx
```

## Shared Components

- **atoms** (`components/ui/atoms/`): AddNew, BigDisplay, CardSkeleton, ColorSwatchPicker, DateTimeField, DeleteButton, EditButton, FieldRow, FirmwareCompatBadge, HeaderAndIcon, IconChartRow, InfoField, Loading, PageTitle, ReadableTime, RefreshButton, StatusChip, UnitHealthIcon
- **molecules** (`components/ui/molecules/`): BatchesTable, CardGridSkeleton, ChartsTabs, ChartsTabsSkeleton, ConfirmDialog, CreateBatchDialog, DataTable, EditableInfoCard, Error, ErrorBoundary, GraphTab, ImageManager, InfoCard, Invalid, ItemPage, ModalForm, OnOffInfo, OnOffInput, ReadingsCsvDownloadButton, ServerDownBanner, TableSkeleton

Plus shared forms `BatchForm`/`PicoUnitForm`/`RecipeForm` and `components/provisioning/` (details: REFERENCE.md §Directory & File Detail). Import via the `~components` barrel.

## Form Validation

All Create/Edit dialogs validate against generated Zod schemas (see `frontend-react` skill for general pattern). Project-specific rules:

- **Never hardcode validation bounds** — use the generated Zod schemas as the single source of truth.
- Many server DTOs are `.partial()` — only validate constraints when a value is present.

## State Management

Standard React Query patterns apply (see `frontend-react` skill). Project-specific inventory:

- Query key factories in `src/api/queryKeys.ts`: `picoUnitKeys`, `picoUnitsKeys`, `readingsKeys`, `recipeKeys`, `batchKeys`, `dashboardKeys`, `serverHealthKeys`, `serverPingKeys`, `settingsKeys`
- Context hooks: usePicoUnit (detail page via `PicoUnitProvider` + `usePicoUnitContext`), usePicoUnits (list page), useRecipe, useRecipes, useBatch, useBatches, useCharts

Poll/mutation patterns (`createOptimisticMutation`, one-shot vs. control mutations, `pollPico`, dual-cache `applyPollResult`, 60 s refresh) + Settings singleton: REFERENCE.md §Polling Gotchas, §Known Quirks.

## Build & Development

- `yarn dev` — http://localhost:5173/
- `yarn build` — `tsc -b && vite build` (may fail if generated schemas.ts has TS errors; regenerate)
- `yarn preview` — `vite preview` (serve the built bundle locally)
- `npx vite build` — builds without typecheck
- `yarn lint` / `yarn lint:fix` — ESLint (fixing, local)
- `yarn lint:ci` — ESLint gate: `--max-warnings=0`, non-mutating (CI form — never point CI at `lint`)
- `yarn format` / `yarn format:check` — Prettier
- `yarn test` / `yarn test:watch` / `yarn test:coverage` — Vitest
- `yarn audit:prod` — informational production audit: `yarn npm audit --environment production --recursive --no-deprecations` (Yarn's own exit code)
- `yarn audit:ci` — audit gate: `audit:prod` + `--severity high`; non-mutating
- `yarn knip` — dead-code/unused-dep report (config: `knip.json`); `yarn knip:ci` — gate (unused files + runtime deps, no devDeps; needs `--no-gitignore` — REFERENCE.md §Knip)
- Script convention: bare = local (may mutate); `:ci` = non-mutating fail-on-findings gate. Scripts run under `sh` — use the tool's native exit code, never `$?`/`[[` bashisms
- Husky pre-commit (v9): `.husky/pre-commit` runs `npx --no-install lint-staged`; wiring via `"prepare": "husky"` and `git config core.hooksPath=.husky/_`. lint-staged runs `eslint --fix` + `prettier --write` on staged files. ESLint severity policy + exec-bit repair: REFERENCE.md §Husky.

## Versioning

- Commit messages follow Conventional Commits, enforced by commitlint (`commitlint.config.cjs` + `.husky/commit-msg` hook).
- The `package.json` version is bumped only when releasing (on the `main` branch) — never during day-to-day `dev` work.
- Never edit the root `release.json` or git tags.

## Testing

- **Test runner**: Vitest 3.x with jsdom environment. Config lives in `vitest.config.ts` (separate file — merging into `vite.config.ts` causes type conflicts between Vitest's bundled vite and the project's `@vitejs/plugin-react`).
- **Global setup**: `src/test/setup.ts` auto-applies `@testing-library/jest-dom` matchers and runs `cleanup()` after each test via `afterEach`.
- **Shared fixtures**: `src/test/fixtures.tsx` exports `makePicoUnit()` (factory), `renderWithProviders()` (QueryClientProvider wrapper), and other shared test helpers.
- **What to test**: Pure utilities (`methods.ts`), custom hooks with logic (`useAsyncWithToast`), mutation factories (`createOptimisticMutation`), ErrorBoundary, and dialogs that send hardware commands (`DevicesDialog`). Skip pass-through React Query wrappers, generated API code, and presentational-only components.
- **Never test generated code** in `src/api/generated/`.
- Despite `globals: true`, test files must still import from `vitest` — REFERENCE.md §Testing (Vitest) Detail.

## Environment

- `VITE_API_BASE_URL` — API origin for the generated client and `resolveApiUrl()` (dev: `http://localhost:3000` via **local, gitignored `.env`**; prod: baked as `/` at Docker build — same-origin). Both use the shared `API_BASE` constant (`src/utils/apiUrl.ts`); its **trailing-slash normalization is load-bearing — never remove it** (mechanism: REFERENCE.md §Known Quirks).
- `VITE_DOCS_PATH` — drives the Server page "API Docs" button link (default `contract` in local `.env`); read in `src/pages/Server/index.tsx`.
- `__APP_BUILD_VERSION__` / `__APP_RELEASE_VERSION__` — **not env vars**; Vite `define` globals injected in `vite.config.ts` (client `package.json` version; root `release.json` `release`, resolved as `../release.json` in the monorepo and `./release.json` in the Docker image; `null` fallback → footer shows `dev`). Consume only via `~utils/buildInfo`; typed in `src/types/buildInfo.d.ts` (no `vite-env.d.ts` by convention).
- There is **no `vite-env.d.ts` / `ImportMetaEnv` typing** — env reads are untyped casts (`import.meta.env.VITE_*`).
- There is **no Vite dev proxy** — all API traffic goes cross-origin to the server via `basePath`. Any server-emitted relative URL (images, or future assets) must be prefixed with the API base for dev rendering via `resolveApiUrl()`.

## Coding Rules

Standard conventions from `frontend-react` skill apply. Project-specific additions:

- Import order: `@trivago/prettier-plugin-sort-imports` handles sort order via Prettier. Third-party imports first, then `~` aliases, then relative imports.
- **Never hardcode colors** — raw hex/rgb literals live only in `src/theme/tokens.ts`; use `~theme/tokens` imports or `theme.palette.*`/MUI color strings. Enforced by `no-restricted-syntax` (error) + `tokens.test.ts`. Exemptions: `tokens.ts` (source), `ColorSwatchPicker` FACE_COLORS (data palette), SVG assets (static art).
- Loading states: Prefer shape-matched MUI `<Skeleton>` components over the generic `<Loading />` spinner for data pages. See the `frontend-react` skill for the full pattern (hierarchy, gating on `isLoading`, page shell structure). Reusable skeletons live in atoms/molecules; page-scoped skeleton compositions live in `pages/<Page>/components/`.
- **No dead props**: The ESLint config treats unused props/imports as errors (`@typescript-eslint/no-unused-vars`). Don't add props to an interface that the component body never uses — the build will fail. If a prop seems theoretically useful but has no consumer, drop it.
- **Page-scoped presentational components**: A presentational (stateless) component used by only one page stays co-located in `pages/<Page>/components/`, not under `components/ui/atoms/`. The shared `atoms/` directory is for components reused across 2+ pages. If a page-scoped component later gains a second consumer, promote it to `components/ui/atoms/` at that time.
- **No cross-page imports**: Never import from another page's folder via `~pages/<OtherPage>/...`. If a component, dialog, or utility is needed by 2+ pages, promote it to `~components`. Conversely, if you find an existing `~pages/<X>/...` import in a different page's file, report it — it's a code smell that needs a promotion PR.
- **Error boundaries are the sole exception to functional components**: React's error boundary lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`) only exist on class components — there is no functional hook equivalent. The `ErrorBoundary` component in `molecules/` is intentionally a class component. Wrap it around `<Routes>` only (not the app shell) so the sidebar and `ServerDownBanner` survive page crashes.

Context-`useMemo` mutation-identity + CSV-download toast rules: REFERENCE.md §Component & Mutation Gotchas.
