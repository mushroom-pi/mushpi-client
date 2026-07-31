# mushpi-client — Project Context

React 19 + Vite web dashboard served from Raspberry Pi 3 B+. Talks only to `mushpi-server`; never directly to Pico units. EXCEPTION: provisioning wizards reference `http://192.168.4.1:5000` (Pico Soft-AP) in user-facing instructions only — no direct API calls to Pico units from the frontend.

> **Skill**: For general React frontend patterns (atomic design, React Query conventions, Zod form validation, ModalForm/DataTable usage), load the `frontend-react` skill. This file documents **only** what is specific to this project or deviates from standard frontend conventions.

## Stack

React 19 · TypeScript ~5.9 · Vite 7 · MUI v7 · TanStack React Query v5 · axios · React Router DOM v7 · Recharts v3 · dayjs · Yarn 1

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

## Images

- `Recipe.image` / `Batch.images` contain **filenames only** (e.g. `"abc123.jpg"`)
- `Recipe.image_url` / `Batch.images_url` contain **absolute URLs** for display
- Images are managed via `ImagesApi` (upload, delete) — endpoints live in `src/api/generated/api.ts`
- Shared UI: `ImageManager` molecule (`src/components/ui/molecules/ImageManager/`) handles both single-image (Recipe, `maxImages=1`, `allowHotlink=true`) and gallery (Batch, `maxImages=5`, `allowHotlink=false`) modes
- Upload dialog supports drag-and-drop + file picker; optional URL tab for hotlinking (Recipe only)

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
- **On-demand hardware polling**: `usePollPicoUnit` mutation calls `POST /v1/pico-units/:id/poll` to trigger an immediate Pico poll (stores a new reading, returns updated `PicoUnit` with `latest_reading`). Exposed via `pollPico` on `PicoUnitCtx`. Used on page mount, after control mutations, and for periodic 60 s background refresh on the unit detail, readings, and batch pages.
- Long-lived readings views (unit detail, readings board, batch detail) auto-refresh every 60 s via hardware poll on the unit detail page and `refetchInterval` on the readings/batch readings queries.
- Dashboard uses `useDashboard` hook with `refetchInterval: 60_000` — single `GET /v1/dashboard/summary` call returns all aggregated data.
- **Settings**: `useSettings()` fetches current timezone from `GET /v1/settings`. `useUpdateSettings()` mutation calls `PATCH /v1/settings` with `onSuccess` cache update + snackbar. Co-located in `src/hooks/useSettings.ts` (singleton resource pattern — not in entity mutations folder).
- **dayjs relative time**: The `relativeTime` plugin is NOT registered globally. Use `dayjs().diff()` + manual formatting for "X ago" strings. See `src/pages/Dashboard/methods.ts` for the pattern (`formatRelativeFromNow`, `formatLastSeen`).

### useAsyncWithToast (imperative async with toast)

For one-shot actions that don't benefit from mutation caching (e.g., add-pico-unit form), use the imperative `useAsyncWithToast` hook instead of TanStack `useMutation`:

```ts
const { run } = useAsyncWithToast();

await run(
  async () => { /* execute async work */ },
  {
    successMessage: 'Done',           // shown as success toast
    fallbackErrorMessage: 'Failed',   // shown if error is not an HttpException
    rethrow: true,                    // re-throws after toast so outer catch can handle
    skipErrorToast: false,            // set true to suppress error toast (caller handles)
    onSuccess: () => { /* callback */ },
    onError: (err) => { /* callback */ },
  },
);
```

- `run()` returns the async function's result on success, or throws on error (when `rethrow: true`)
- Server HTTP error responses (409, 424, etc.) automatically surface as error toasts with the server's descriptive message
- Use `useMutation` for entity mutations that participate in React Query caching; use `useAsyncWithToast` for imperative flows like the Add dialog or delete confirmations that navigate away on success
- When pairing `useAsyncWithToast` with `ModalForm` (which needs `isPending` for the submit button), manage a local `useState(false)` `isPending` boolean — set `true` before `run()`, `false` in the `finally` block. The `ModalForm`'s `canSubmit` and `isPending` props use this local state, not a React Query mutation's `isPending`

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
├── api/                  # Client, generated code, query keys
├── components/ui/
│   ├── atoms/            # Stateless presentational
│   ├── molecules/        # Composed (may use context/hooks)
│   │   ├── ImageManager/  # Shared image gallery/upload/remove (used by Recipe + Batch)
│   │   └── DeviationAlert # Temp/humidity deviation warning (used by Dashboard + PicoUnit detail)
│   └── index.ts
├── contexts/             # Context + hooks + mutations per entity
│   ├── PicoUnit/mutations/: controlLoop, delete, outputs, setPoints, update
│   ├── Recipe/mutations/: create, delete, image, update
│   ├── Batch/mutations/: create, delete, image, update, createRecipeFromBatch
│   ├── Charts/: provider.tsx, batchProvider.tsx
│   └── Toast.tsx
├── hooks/                # useDashboard, useReadings, useBatchReadings, useServerHealth, useIsServerReachable, useAsyncWithToast, useSettings
├── layout/               # Page wrapper, Sidebar
├── pages/                # Route pages (default exports)
│   │                       # ⚠️ Page components MUST live in <PageName>/index.tsx,
│   │                       #   never as a bare <PageName>.tsx at the pages root.
│   ├── Dashboard/         # Dashboard page at /
│   │   └── components/    # WarningsBanner, StatsRow, UnitCards, etc.
│   ├── PicoUnit/          # Unit detail page at /pico-units/:id
│   │   └── components/    # PicoUnitStatCards, PicoUnitDetailGrid, PicoUnitDevices, etc.
│   ├── Settings/          # Settings page at /settings
│   │   └── components/     # SettingsSkeleton (card skeleton)
│   ├── PicoUnits/         # Units list page at /pico-units
│   │   └── components/
│   │       ├── ProvisioningIllustrations.tsx  # SVG illustrations for provisioning wizards
│   │       ├── LedStateReference.tsx     # Collapsible LED diagnostic accordion
│   │       ├── ConnectPicoWizard/        # Multi-step wizard for new Pico provisioning
│       │   ├── ReconnectPicoDialog/      # Multi-step wizard for offline Pico recovery
│       │   └── ManualRegisterDialog/     # Manual PicoUnit registration (mDNS-based)
│   │   └── components/                   # Page-scoped widgets (NOT shared molecules)
├── theme/mushroomTheme.ts
├── types/charts.ts
└── utils/
    ├── methods.ts        # Generic: date formatting, bytes, percentages
    ├── pico.ts           # Pico: provisioning constants, health helpers, LED_STATES
    └── charts.ts         # Chart: samplers, downsampling, RLE dedup
```

## Charts (Recharts)

Three chart tabs in `/readings` and `/batches/:id`:

- `TempHumTab` — temperature + humidity line chart
- `DevicesTab` — binary on/off for fan, humidifier, heater
- `ControlLoopTab` — binary on/off for control loop

Unit readings (`/readings`): shared query params from `ChartsProvider` (`useCharts()`).
Batch readings (`/batches/:id`): `BatchChartsProvider` sources data from `useBatchReadings`, provides same context shape — chart tabs work unchanged for both.

Chart data utilities in `~utils/charts`: `downsampleChartPoints`, `smartSampleChartPoints`, `rleDeduplicateOnOffPoints`.

## Build & Development

- `yarn dev` — http://localhost:5173/
- `yarn build` — `tsc -b && vite build` (may fail if generated schemas.ts has TS errors; regenerate)
- `npx vite build` — builds without typecheck
- `yarn lint` / `yarn lint:fix` — ESLint
- `yarn format` / `yarn format:check` — Prettier
- Husky pre-commit: lint-staged (eslint --fix + prettier)

## Known Quirks

- `picoUnitIdBatchesControllerGetCurrentV1` requires `batchId: 0` (generator bug — param not in URL, ignored)
- Vite chunk size warning (~1.35 MB) is informational
- **V1 naming**: all generated API methods carry a `V1` suffix (e.g. `batchesControllerListV1`, `picoUnitIdControllerGetOneV1`). This comes from the server's URI versioning (`/v1/` prefix) and is not a bug. Method names will change again when `/v2/` endpoints are introduced — plan client code accordingly.
- `schemas.ts` sometimes uses bare `Array` without type param — regenerate from fixed server spec
- `schemas.ts` sometimes uses `Array<z>` instead of `Array<string>` — fixed by `Fix 1b` in `scripts/fix-array-types.mjs` (generator bug in `openapi-zod-client` v1.18.3)
- `PicoUnitCard.tsx` `friendlyDate` uses `new Date().toLocaleString()` instead of `dayjs` — pre-existing deviation from the "Use dayjs for dates" rule
- Grep tool skips `src/api/generated/` (gitignored) — always use `read` or bash `grep`/`rg` directly to discover generated method signatures
- Offline Pico detection: `isUnitOffline(pico)` checks `failed_calls >= 3` (import from `~utils/pico`). This is the canonical health signal — derived from the server's cron polling failures.
- Combined health check: `isUnitHealthy(pico)` checks both `failed_calls >= 3` (unreachable) and `failed_readings >= 5` (sensor fault). Import from `~utils/pico`. Orthogonal to `isUnitOffline` — a unit can be reachable but have a faulty sensor.
- Health icon: `UnitHealthIcon` (import from `~components`) renders a ✓/⚠ icon with a tooltip explaining the specific failure mode. Used in `PicoUnitCard` (list page) and as `titleAdornment` on the unit detail page.
- `PicoUnit.mac` (nullable string) stores the Pico's Wi‑Fi MAC address. Used client-side to derive the AP provisioning SSID (`mushpi-provision-XXXX` from last 4 hex chars). Set once by the server during the first successful cron poll; never updated.
- Soft-AP provisioning wizards reference `http://192.168.4.1:5000` (Pico AP mode) in user instructions only — no direct API calls to Pico units from the frontend. All communication goes through `mushpi-server`.
- Server-down detection: `ServerDownBanner` (import from `~components`) renders a warning `Alert` at the top of the app when `GET /ping` fails. Uses `useIsServerReachable` hook (30s polling, `retry: false`). Fast-path: any successful server response from another query immediately clears the banner via `QueryCache.subscribe()` — no waiting for the next ping tick.
- `/ping` vs `/health`: `/ping` returns bare `"pong"` — use for liveness polling (`retry: false`, low overhead). `/health` returns full `HealthCheckResponseDto` with server/database/service status — use for the Server page. The `monitoringControllerPing()` method exists on both `MonitoringApi` and `NoValidationApi` in the generated client; use `MonitoringApi` (consistent with `useServerHealth`).
- **Sidebar icon for Server page**: `DnsIcon` (`@mui/icons-material/Dns`), not `SettingsIcon`. The gear icon belongs to Settings. Server originally used `SettingsIcon` — reassigned during Feature #15.
- **Settings page**: Uses `SettingsApi` (manually wired in `src/api/client.ts`). `useSettings()` query + `useUpdateSettings()` mutation co-located in `src/hooks/useSettings.ts` (singleton resource pattern, not in entity mutations folder). Zod validation uses the generated `UpdateSettingsDto` schema.

## Feature Palettes & Domain Constants

Color palettes or other domain-specific constant arrays that are tightly coupled to a feature should co-locate with the UI component that consumes them. A stateless atom can export both the component and its default dataset (e.g. `ColorSwatchPicker` + `FACE_COLORS` from the same file). If a palette is consumed by multiple unrelated features, extract it to a shared constants file under `src/utils/` or `src/theme/`.

## Environment

```
VITE_API_BASE_URL=http://localhost:3000
```

## Coding Rules

Standard conventions from `frontend-react` skill apply. Project-specific additions:

- Import order: `@trivago/prettier-plugin-sort-imports` handles sort order via Prettier. Third-party imports first, then `~` aliases, then relative imports.
- Loading states: Prefer shape-matched MUI `<Skeleton>` components over the generic `<Loading />` spinner for data pages. See the `frontend-react` skill for the full pattern (hierarchy, gating on `isLoading`, page shell structure). Reusable skeletons live in atoms/molecules; page-scoped skeleton compositions live in `pages/<Page>/components/`.
