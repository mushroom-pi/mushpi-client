# mushpi-client — Project Context

React 19 + Vite web dashboard served from Raspberry Pi 3 B+. Talks only to `mushpi-server`; never directly to Pico units. EXCEPTION: provisioning wizards reference `http://192.168.4.1:5000` (Pico Soft-AP) in user-facing instructions only — no direct API calls to Pico units from the frontend.

> **Skill**: For general React frontend patterns (atomic design, React Query conventions, Zod form validation, ModalForm/DataTable usage), load the `frontend-react` skill. This file documents **only** what is specific to this project or deviates from standard frontend conventions.
>
> **Reference**: long-tail details (image handling, `useAsyncWithToast`, Recharts chart conventions, known quirks, feature palettes, Husky fragility) live in [`REFERENCE.md`](./REFERENCE.md). Load it **only when the task touches those areas** — do not read it on every spawn.

## Stack

React 19 · TypeScript ~5.9 · Vite 7 · MUI v7 · TanStack React Query v5 · axios · React Router DOM v7 · Recharts v3 · dayjs · Yarn Berry 4

## Path Aliases

`vite.config.ts` + `tsconfig.app.json`: `~api`, `~ctx`, `~hook`, `~int`, `~type`, `~comp`, `~components`, `~layout`, `~utils`, `~pages`, `~assets`

## API Client

`src/api/generated/api.ts` and `src/api/generated/schemas.ts` are auto-generated from `mushpi-server`'s OpenAPI spec. **Never edit manually.**

```bash
yarn gen:client:remote   # regenerate API client from running server (port 3000)
yarn gen:client          # regenerate from local openapi.json
yarn gen:schemas:remote  # regenerate Zod schemas from running server
yarn gen:schemas         # regenerate from local openapi.json
yarn gen:all:remote      # regenerate both
```

Both files are gitignored. Always regenerate after any `mushpi-server` endpoint change.

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

Dialog-auto-open: `navigate('/path', { state: { openEditDialog: true } })`, read in mount-only `useEffect`, clear with `window.history.replaceState`.

## Directory Structure

```
src/
├── api/                     # Client, generated code, query keys
├── components/
│   ├── BatchForm.tsx        # Shared batch form (consumed by Create + Edit dialogs)
│   ├── PicoUnitForm.tsx     # Shared PicoUnit form
│   ├── RecipeForm.tsx       # Shared recipe form
│   ├── provisioning/        # Reconnect wizard, LED reference, provisioning illustrations
│   │   ├── LedStateReference.tsx
│   │   ├── ProvisioningIllustrations.tsx
│   │   └── ReconnectPicoDialog/
│   ├── ui/
│   │   ├── atoms/           # Stateless presentational
│   │   ├── molecules/       # Composed (may use context/hooks)
│   │   │   ├── BatchesTable.tsx       # Shared batch table (consumed by Batches, PicoUnit, Recipe pages)
│   │   │   ├── ChartsTabs/            # Shared chart tab suite (consumed by Readings + Batch pages)
│   │   │   ├── CreateBatchDialog/     # Folder molecule (consumed by Batches, PicoUnit, Recipe pages)
│   │   │   └── ImageManager/          # Shared image gallery/upload/remove (used by Recipe + Batch)
│   │   └── index.ts
│   └── index.ts
├── contexts/                # Context + hooks + mutations per entity
│   ├── PicoUnit/mutations/: changeSetup, controlLoop, delete, outputs, setPoints, update
│   ├── Recipe/mutations/: create, delete, image, update
│   ├── Batch/mutations/: create, delete, image, update, createRecipeFromBatch
│   ├── Charts/: provider.tsx, batchProvider.tsx
│   └── Toast.tsx
├── hooks/                   # useDashboard, useReadings, useBatchReadings, useServerHealth, useIsServerReachable, useAsyncWithToast, useSettings
├── layout/                  # Page wrapper, Sidebar
├── pages/                   # Route pages (default exports)
│   │                       # ⚠️ Page components MUST live in <PageName>/index.tsx,
│   │                       #   never as a bare <PageName>.tsx at the pages root.
│   ├── Dashboard/           # Dashboard page at /
│   │   └── components/      # WarningsBanner, StatsRow, UnitCards, etc.
│   ├── PicoUnit/            # Unit detail page at /pico-units/:id
│   │   └── components/      # PicoUnitStatCards, PicoUnitDetailGrid, PicoUnitDevices, etc.
│   ├── Settings/            # Settings page at /settings
│   │   └── components/      # SettingsSkeleton (card skeleton)
│   ├── PicoUnits/           # Units list page at /pico-units
│   │   └── components/
│   │       ├── ConnectPicoWizard/      # Multi-step wizard for new Pico provisioning
│   │       └── ManualRegisterDialog/   # Manual PicoUnit registration (mDNS-based)
├── theme/mushroomTheme.ts
├── types/charts.ts
└── utils/
    ├── methods.ts           # Generic: date formatting, bytes, percentages
    ├── pico.ts              # Pico: provisioning constants, LED_STATES, chip color helpers
    └── charts.ts            # (removed — server handles aggregation)
```

## Form Validation

All Create/Edit dialogs validate against generated Zod schemas (see `frontend-react` skill for general pattern). Project-specific rules:

- **Never hardcode validation bounds** — use the generated Zod schemas as the single source of truth.
- Many server DTOs are `.partial()` — only validate constraints when a value is present.

## State Management

Standard React Query patterns apply (see `frontend-react` skill). Project-specific:

- Query key factories in `src/api/queryKeys.ts` (picoUnitKeys, recipeKeys, batchKeys, serverHealthKeys, serverPingKeys, settingsKeys, etc.)
- Context hooks: usePicoUnit (detail page via `PicoUnitProvider` + `usePicoUnitContext`), usePicoUnits (list page), useRecipe, useRecipes, useBatch, useBatches, useCharts
- Mutations in entity's `mutations/` folder (one file per concern)
- Optimistic updates via `createOptimisticMutation` factory in `src/contexts/PicoUnit/helpers.ts`
- **One-shot server actions** (e.g. `/reboot`, `/poll` returning 202) use plain `useMutation` with `onSuccess` invalidation — NOT `createOptimisticMutation`. There is no optimistic client state to project (the Pico goes offline briefly, an immediate follow-up poll would fail), unlike control mutations (`/setpoints`, `/outputs`, `/control/loop`, `/setup`) which do use `createOptimisticMutation` + poll-on-settle
- **On-demand hardware polling**: `usePollPicoUnit` mutation calls `POST /v1/pico-units/:id/poll` to trigger an immediate Pico poll (stores a new reading, returns updated `PicoUnit` with `latest_reading`). Exposed via `pollPico` on `PicoUnitCtx`. Used on page mount, after control mutations, and for periodic 60 s background refresh on the unit detail, readings, and batch pages.
- Long-lived readings views (unit detail, readings board, batch detail) auto-refresh every 60 s via hardware poll on the unit detail page and `refetchInterval` on the readings/batch readings queries.
- Dashboard uses `useDashboard` hook with `refetchInterval: 60_000` — single `GET /v1/dashboard/summary` call returns all aggregated data.
- **Settings**: `useSettings()` fetches current timezone from `GET /v1/settings`. `useUpdateSettings()` mutation calls `PATCH /v1/settings` with `onSuccess` cache update + snackbar. Co-located in `src/hooks/useSettings.ts` (singleton resource pattern — not in entity mutations folder).

## Build & Development

- `yarn dev` — http://localhost:5173/
- `yarn build` — `tsc -b && vite build` (may fail if generated schemas.ts has TS errors; regenerate)
- `npx vite build` — builds without typecheck
- `yarn lint` / `yarn lint:fix` — ESLint
- `yarn format` / `yarn format:check` — Prettier
- `yarn test` / `yarn test:watch` / `yarn test:coverage` — Vitest
- Husky pre-commit (v9): `.husky/pre-commit` runs `npx --no-install lint-staged`; wiring via `"prepare": "husky"` and `git config core.hooksPath=.husky/_`. lint-staged runs `eslint --fix` + `prettier --write` on staged files.
  - **Severity policy**: most rules are `warn`; only `import/no-unresolved` is `error`. Pre-commit runs `eslint --fix` (no `--max-warnings=0`), so **errors block commits, warnings do not**. Enforce zero-warnings as a CI gate (`eslint --max-warnings=0`) rather than at pre-commit.

## Testing

- **Test runner**: Vitest 3.x with jsdom environment. Config lives in `vitest.config.ts` (separate file — merging into `vite.config.ts` causes type conflicts between Vitest's bundled vite and the project's `@vitejs/plugin-react`).
- **Global setup**: `src/test/setup.ts` auto-applies `@testing-library/jest-dom` matchers and runs `cleanup()` after each test via `afterEach`.
- **Shared fixtures**: `src/test/fixtures.tsx` exports `makePicoUnit()` (factory), `renderWithProviders()` (QueryClientProvider wrapper), and other shared test helpers.
- **What to test**: Pure utilities (`methods.ts`), custom hooks with logic (`useAsyncWithToast`), mutation factories (`createOptimisticMutation`), ErrorBoundary, and dialogs that send hardware commands (`DevicesDialog`). Skip pass-through React Query wrappers, generated API code, and presentational-only components.
- **Globals**: `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` are available without imports (in `.test.*` files). Import `render`, `screen`, `waitFor` from `@testing-library/react` and `userEvent` from `@testing-library/user-event`.
- **Never test generated code** in `src/api/generated/`.

## Environment

- `VITE_API_BASE_URL` — API origin for the generated client (read in `src/api/client.ts`, fallback `http://localhost:3000`) and for `resolveApiUrl()`. Dev sets it to `http://localhost:3000` via a **local, gitignored `.env`**; prod bakes it as `/` at Docker build time (same-origin).
- `VITE_DOCS_PATH` — drives the Server page "API Docs" button link (default `contract` in local `.env`); read in `src/pages/Server/index.tsx`.
- There is **no `vite-env.d.ts` / `ImportMetaEnv` typing** — env reads are untyped casts (`import.meta.env.VITE_*`).
- There is **no Vite dev proxy** — all API traffic goes cross-origin to the server via `basePath`. Any server-emitted relative URL (images, or future assets) must be prefixed with the API base for dev rendering via `resolveApiUrl()`.

```
VITE_API_BASE_URL=http://localhost:3000
```

## Coding Rules

Standard conventions from `frontend-react` skill apply. Project-specific additions:

- Import order: `@trivago/prettier-plugin-sort-imports` handles sort order via Prettier. Third-party imports first, then `~` aliases, then relative imports.
- Loading states: Prefer shape-matched MUI `<Skeleton>` components over the generic `<Loading />` spinner for data pages. See the `frontend-react` skill for the full pattern (hierarchy, gating on `isLoading`, page shell structure). Reusable skeletons live in atoms/molecules; page-scoped skeleton compositions live in `pages/<Page>/components/`.
- **No dead props**: The ESLint config treats unused props/imports as errors (`@typescript-eslint/no-unused-vars`). Don't add props to an interface that the component body never uses — the build will fail. If a prop seems theoretically useful but has no consumer, drop it.
- **Page-scoped presentational components**: A presentational (stateless) component used by only one page stays co-located in `pages/<Page>/components/`, not under `components/ui/atoms/`. The shared `atoms/` directory is for components reused across 2+ pages. If a page-scoped component later gains a second consumer, promote it to `components/ui/atoms/` at that time.
- **No cross-page imports**: Never import from another page's folder via `~pages/<OtherPage>/...`. If a component, dialog, or utility is needed by 2+ pages, promote it to `~components`. Conversely, if you find an existing `~pages/<X>/...` import in a different page's file, report it — it's a code smell that needs a promotion PR.
- **Error boundaries are the sole exception to functional components**: React's error boundary lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`) only exist on class components — there is no functional hook equivalent. The `ErrorBoundary` component in `molecules/` is intentionally a class component. Wrap it around `<Routes>` only (not the app shell) so the sidebar and `ServerDownBanner` survive page crashes.
- **Mutation identity in context `useMemo` deps**: React Query v5's `useMutation` returns a wrapper object that changes identity every render, but `mutate`/`mutateAsync` are referentially stable. In context-provider `useMemo` dependency arrays, **destructure** `mutate`, `mutateAsync`, and `isPending` from the mutation result and depend on those stable primitives — never the whole mutation wrapper object. Rebuilding the wrapper from stable parts keeps the memo honest and prevents cascading consumer re-renders.
- **CSV download failures must surface via toast**: `useAsyncWithToast().run()` with `fallbackErrorMessage: 'Failed to download CSV'` and `rethrow: true`. Wrap the export+download logic inside `run()`. Server HTTP errors auto-surface; `fallbackErrorMessage` covers network/non-HTTP failures. Remove `console.error` calls from download catch blocks.
