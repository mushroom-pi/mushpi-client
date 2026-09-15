# mushpi-client — Project Context

React 19 + Vite web dashboard served from Raspberry Pi 3 B+. Talks only to `mushpi-server`; never directly to Pico units. EXCEPTION: provisioning wizards reference `http://192.168.4.1:5000` (Pico Soft-AP) in user-facing instructions only — no direct API calls to Pico units from the frontend.

> **Skill**: For general React frontend patterns (atomic design, React Query conventions, Zod form validation, ModalForm/DataTable usage), load the `frontend-react` skill. This file documents **only** what is specific to this project or deviates from standard frontend conventions.
>
> **Reference**: long-tail details (image handling, `useAsyncWithToast`, Recharts chart conventions, known quirks, feature palettes, Husky fragility) live in [`REFERENCE.md`](./REFERENCE.md). Load it **only when the task touches those areas** — do not read it on every spawn.

## Stack

React 19 · TypeScript ~5.9 · Vite 7 · MUI v7 · TanStack React Query v5 · axios · React Router DOM v7 · Recharts v3 · dayjs · Yarn Berry 4

## Path Aliases

`vite.config.ts` + `tsconfig.app.json`: `~api`, `~ctx`, `~hook`, `~int`, `~type`, `~theme`, `~comp`, `~components`, `~layout`, `~utils`, `~pages`, `~assets`, `src`, `@`. (`src` and `@` both map to `src/`; `~components` maps to the `src/components/index.ts` barrel, while `~comp` maps to the `src/components/` directory.)

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

**Tab titles**: every route page calls `useDocumentTitle('<Page>')` from `~hook/useDocumentTitle` (renders `"<Page> — Mushroom Pi"`). Detail pages call it inside the `*Inner` component with ``entity?.name ?? `Entity #${useParams id}` `` — exactly one call-site per route, never in the outer page wrapper. `index.html` holds the bare-brand fallback `Mushroom Pi`.

Page h1 titles mirror `navItems` labels (`<PageTitle>` for lists, `<ItemPage title>` for details).

Dialog-auto-open: `navigate('/path', { state: { openEditDialog: true } })`, read in mount-only `useEffect`, clear with `window.history.replaceState`.

## Directory Structure

```
src/
├── assets/                  # Static SVGs (~assets alias)
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
│   ├── PicoUnit/mutations/: setup, controlLoop, delete, outputs, reboot, setPoints, update
│   ├── PicoUnits/           # List-page context (usePicoUnits)
│   ├── Recipe/mutations/: create, delete, image, update
│   ├── Recipes/             # List-page context (useRecipes)
│   ├── Batch/mutations/: create, delete, image, update, createRecipeFromBatch
│   ├── Batches/             # List-page context (useBatches)
│   ├── Charts/: provider.tsx, batchProvider.tsx
│   └── Toast.tsx
├── hooks/                   # useDashboard, useReadings, useBatchReadings, useServerHealth, useIsServerReachable, useAsyncWithToast, useSettings, useChartContainerWidth, useDocumentTitle, picoUnitsHelpers
│   ├── BatchForm/           # Batch form state
│   └── RecipeForm/          # Recipe form state
├── interfaces/              # Shared TS interfaces (dialogProps.ts, optionalPicoUnit.ts)
├── layout/                  # Page wrapper, Sidebar
├── pages/                   # Route pages (default exports)
│   │                       # ⚠️ Page components MUST live in <PageName>/index.tsx,
│   │                       #   never as a bare <PageName>.tsx at the pages root.
│   ├── Dashboard/           # Dashboard page at /
│   │   └── components/      # WarningsBanner, StatsRow, UnitCards, etc.
│   ├── PicoUnits/           # Units list page at /pico-units
│   │   └── components/
│   │       ├── ConnectPicoWizard/      # Multi-step wizard for new Pico provisioning
│   │       └── ManualRegisterDialog/   # Manual PicoUnit registration (mDNS-based)
│   ├── PicoUnit/            # Unit detail page at /pico-units/:id
│   │   └── components/      # PicoUnitStatCards, PicoUnitDetailGrid, PicoUnitDevices, etc.
│   ├── Readings/            # Charts page at /readings
│   ├── Recipes/             # Recipes list page at /recipes
│   ├── Recipe/              # Recipe detail page at /recipes/:id
│   ├── Batches/             # Batches list page at /batches
│   ├── Batch/               # Batch detail page at /batches/:id
│   ├── Server/              # Server health page at /server
│   └── Settings/            # Settings page at /settings
│       └── components/      # SettingsSkeleton (card skeleton)
├── styles/                  # global.css; variables.css (3-var pre-mount mirror of tokens.ts — --bg/--bg-deep/--text — guarded 1:1 by theme/tokens.test.ts)
├── test/                    # setup.ts, fixtures.tsx
├── theme/
│   ├── mushroomTheme.ts     # sole createTheme; built from tokens.ts, augments typed palette.custom.{veil,scrim}
│   ├── tokens.ts            # SINGLE SOURCE OF TRUTH for colors — raw hex/rgb literals allowed ONLY here
│   └── tokens.test.ts       # guards: variables.css mirror + src-wide stray-color scan
├── types/charts.ts
└── utils/
    ├── apiUrl.ts            # Normalized API base (`API_BASE`, trailing slashes stripped) + resolveApiUrl()
    ├── apiUrl.test.ts       # Vitest: base normalization + image-URL resolution
    ├── chartLabels.ts       # Chart tick-label helpers (isLongSpan, createTickFormatter)
    ├── methods.ts           # Generic: date formatting, bytes, percentages
    ├── methods.test.ts      # Vitest: pure formatting helpers
    ├── pico.ts              # Pico: provisioning constants, LED_STATES, chip color helpers, firmwareStatus()/firmwareCaption() display helpers
    ├── pico.test.ts         # Vitest: firmware-status null/unknown branching + caption composition
    ├── timeWindow.ts        # TimeWindow union + resolveTimeBounds() (store intent, resolve per fetch)
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
- **Poll results must propagate to BOTH caches**: the list query (`picoUnitsKeys.*`) and the detail query (`picoUnitKeys.detail(id)`) are disjoint — writing to one does not touch the other. Any code path consuming a Pico poll result must write it to both, or the list page will show stale `status`/`last_seen` when navigating back from a detail page. Use `applyPollResult(qc, id, data)` from `~ctx/PicoUnit/helpers` (writes the detail cache + patches every list page via `updateItemInAllPages`). `usePollPicoUnit.onSuccess` and `useGetPicoUnit`'s 60 s background poll both already do this — a new poll path that forgets it re-introduces the staleness bug.
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
  - **Severity policy**: most rules are `warn`; `import/no-unresolved` and the raw-color `no-restricted-syntax` rules (hex/rgb/hsl literals outside `src/theme/tokens.ts`) are `error`. Pre-commit runs `eslint --fix` (no `--max-warnings=0`), so **errors block commits, warnings do not**. Enforce zero-warnings as a CI gate (`eslint --max-warnings=0`) rather than at pre-commit.

## Versioning

- Commit messages follow Conventional Commits, enforced by commitlint (`commitlint.config.cjs` + `.husky/commit-msg` hook).
- The `package.json` version is bumped only when releasing (on the `main` branch) — never during day-to-day `dev` work.
- Never edit the root `release.json` or git tags.

## Testing

- **Test runner**: Vitest 3.x with jsdom environment. Config lives in `vitest.config.ts` (separate file — merging into `vite.config.ts` causes type conflicts between Vitest's bundled vite and the project's `@vitejs/plugin-react`).
- **Global setup**: `src/test/setup.ts` auto-applies `@testing-library/jest-dom` matchers and runs `cleanup()` after each test via `afterEach`.
- **Shared fixtures**: `src/test/fixtures.tsx` exports `makePicoUnit()` (factory), `renderWithProviders()` (QueryClientProvider wrapper), and other shared test helpers.
- **What to test**: Pure utilities (`methods.ts`), custom hooks with logic (`useAsyncWithToast`), mutation factories (`createOptimisticMutation`), ErrorBoundary, and dialogs that send hardware commands (`DevicesDialog`). Skip pass-through React Query wrappers, generated API code, and presentational-only components.
- **Globals**: `vitest.config.ts` sets `globals: true`, so `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` work at _runtime_ without imports. **But you must still import them from `vitest`** — `tsc -b` type-checks test files and `vitest/globals` is not in tsconfig `types`, so relying on globals breaks `yarn build`. Import `render`, `screen`, `waitFor` from `@testing-library/react` and `userEvent` from `@testing-library/user-event`.
- **Never test generated code** in `src/api/generated/`.

## Environment

- `VITE_API_BASE_URL` — API origin for the generated client (read in `src/api/client.ts`, fallback `http://localhost:3000`) and for `resolveApiUrl()`. Both consume the shared `API_BASE` constant from `src/utils/apiUrl.ts`, which **normalizes the value by stripping trailing slashes** (same-origin `/` → empty basePath, so the generated client's naive `basePath + url` join yields relative `/ping`, not protocol-relative `//ping`) — do not remove the normalization thinking it's redundant. Dev sets it to `http://localhost:3000` via a **local, gitignored `.env`**; prod bakes it as `/` at Docker build time (same-origin).
- `VITE_DOCS_PATH` — drives the Server page "API Docs" button link (default `contract` in local `.env`); read in `src/pages/Server/index.tsx`.
- There is **no `vite-env.d.ts` / `ImportMetaEnv` typing** — env reads are untyped casts (`import.meta.env.VITE_*`).
- There is **no Vite dev proxy** — all API traffic goes cross-origin to the server via `basePath`. Any server-emitted relative URL (images, or future assets) must be prefixed with the API base for dev rendering via `resolveApiUrl()`.

```
VITE_API_BASE_URL=http://localhost:3000
```

## Coding Rules

Standard conventions from `frontend-react` skill apply. Project-specific additions:

- Import order: `@trivago/prettier-plugin-sort-imports` handles sort order via Prettier. Third-party imports first, then `~` aliases, then relative imports.
- **Never hardcode colors** — raw hex/rgb literals live only in `src/theme/tokens.ts`; use `~theme/tokens` imports or `theme.palette.*`/MUI color strings. Enforced by `no-restricted-syntax` (error) + `tokens.test.ts`. Exemptions: `tokens.ts` (source), `ColorSwatchPicker` FACE_COLORS (data palette), SVG assets (static art).
- Loading states: Prefer shape-matched MUI `<Skeleton>` components over the generic `<Loading />` spinner for data pages. See the `frontend-react` skill for the full pattern (hierarchy, gating on `isLoading`, page shell structure). Reusable skeletons live in atoms/molecules; page-scoped skeleton compositions live in `pages/<Page>/components/`.
- **No dead props**: The ESLint config treats unused props/imports as errors (`@typescript-eslint/no-unused-vars`). Don't add props to an interface that the component body never uses — the build will fail. If a prop seems theoretically useful but has no consumer, drop it.
- **Page-scoped presentational components**: A presentational (stateless) component used by only one page stays co-located in `pages/<Page>/components/`, not under `components/ui/atoms/`. The shared `atoms/` directory is for components reused across 2+ pages. If a page-scoped component later gains a second consumer, promote it to `components/ui/atoms/` at that time.
- **No cross-page imports**: Never import from another page's folder via `~pages/<OtherPage>/...`. If a component, dialog, or utility is needed by 2+ pages, promote it to `~components`. Conversely, if you find an existing `~pages/<X>/...` import in a different page's file, report it — it's a code smell that needs a promotion PR.
- **Error boundaries are the sole exception to functional components**: React's error boundary lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`) only exist on class components — there is no functional hook equivalent. The `ErrorBoundary` component in `molecules/` is intentionally a class component. Wrap it around `<Routes>` only (not the app shell) so the sidebar and `ServerDownBanner` survive page crashes.
- **Mutation identity in context `useMemo` deps**: React Query v5's `useMutation` returns a wrapper object that changes identity every render, but `mutate`/`mutateAsync` are referentially stable. In context-provider `useMemo` dependency arrays, **destructure** `mutate`, `mutateAsync`, and `isPending` from the mutation result and depend on those stable primitives — never the whole mutation wrapper object. Rebuilding the wrapper from stable parts keeps the memo honest and prevents cascading consumer re-renders.
- **CSV download failures must surface via toast**: `useAsyncWithToast().run()` with `fallbackErrorMessage: 'Failed to download CSV'` and `rethrow: true`. Wrap the export+download logic inside `run()`. Server HTTP errors auto-surface; `fallbackErrorMessage` covers network/non-HTTP failures. Remove `console.error` calls from download catch blocks.
