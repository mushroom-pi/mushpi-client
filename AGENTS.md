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
- **One-shot server actions** (e.g. `/reboot`, `/poll` returning 202) use plain `useMutation` with `onSuccess` invalidation — NOT `createOptimisticMutation`. There is no optimistic client state to project (the Pico goes offline briefly, an immediate follow-up poll would fail), unlike control mutations (`/setpoints`, `/outputs`, `/control/loop`, `/setup`) which do use `createOptimisticMutation` + poll-on-settle
- **On-demand hardware polling**: `usePollPicoUnit` mutation calls `POST /v1/pico-units/:id/poll` to trigger an immediate Pico poll (stores a new reading, returns updated `PicoUnit` with `latest_reading`). Exposed via `pollPico` on `PicoUnitCtx`. Used on page mount, after control mutations, and for periodic 60 s background refresh on the unit detail, readings, and batch pages.
- Long-lived readings views (unit detail, readings board, batch detail) auto-refresh every 60 s via hardware poll on the unit detail page and `refetchInterval` on the readings/batch readings queries.
- **Background polling**: React Query v5 defaults `refetchIntervalInBackground` to `false`. Combined with the global `refetchOnWindowFocus: false`, polling silently pauses when the tab is hidden and never resumes on focus return. Every query with `refetchInterval` that needs to stay live regardless of tab visibility must also set `refetchIntervalInBackground: true`. The readings, batch readings, and unit-list queries all do this.
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
│   │   └── ImageManager/  # Shared image gallery/upload/remove (used by Recipe + Batch)
│   └── index.ts
├── contexts/             # Context + hooks + mutations per entity
│   ├── PicoUnit/mutations/: changeSetup, controlLoop, delete, outputs, setPoints, update
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
    ├── pico.ts           # Pico: provisioning constants, LED_STATES, chip color helpers
    └── charts.ts         # (removed — server handles aggregation)
```

## Charts (Recharts)

Three chart tabs in `/readings` and `/batches/:id`:

- `TempHumTab` — temperature + humidity with avg line, min-max range band (`Area`), and target setpoint (`Line` with dashed stroke)
- `DevicesTab` — binary step-area on/off for fan, humidifier, heater (majority vote per bucket)
- `ControlLoopTab` — binary step-area on/off for control loop enabled (majority vote per bucket)

Unit readings (`/readings`): shared query params from `ChartsProvider` (`useCharts()`).
Batch readings (`/batches/:id`): `BatchChartsProvider` sources data from `useBatchReadings`, provides same context shape — chart tabs work unchanged for both.

Server-side aggregation via `points` parameter (default 200, min 10, max 2000). `AggregatedChartPoint` carries per-bucket stats: avg, min, max, relay majority votes, setpoints, and `readingCount`. The `DisplayPointsSelect` drives the server `points` value; "Auto" derives it from container width via `useChartContainerWidth`. Client-side smoothing utilities removed — server handles all aggregation.

**Derived numeric query params must be quantized** before joining the query key. `useChartContainerWidth()` derives `points` from container width — without quantization, 1 px ResizeObserver jitter creates a brand-new query observer that resets `refetchInterval` to zero. Round to the nearest 10 and guard against no-op updates.

**Time-relative query bounds store intent, not resolved timestamps.** When a user selects "Last 1h", store the preset descriptor (`{ kind:'preset', preset:'1h' }`) in the query key and resolve it to absolute timestamps (`start=now()-1h, end=now()`) inside `queryFn` at execution time. If absolute timestamps are frozen into provider state at apply time, every `refetchInterval` tick refetches the same stale window with no new data. Custom absolute ranges store their frozen bounds — that behavior is correct. See `~utils/timeWindow.ts` for the `TimeWindow` discriminated union and `resolveTimeBounds()`.

### Chart Layout Conventions

- **Two chart components** serve all three tabs: `ReadingsTargetChart` (temp/humidity with target lines) and `OnOffChart` (binary step lines). Both wrap in `<ResponsiveContainer>` with `syncId="anyId"` for cross-chart tooltip linking.
- **Stacked layout**: only the bottom chart per tab shows `showXAxis`. Top charts use `hide={!showXAxis}`. `axisCompensation` (calculated as `showXAxis ? 60 : 0`) is added to the chart height so all plot areas remain equal regardless of axis visibility.
- **Data sort order**: chart providers default to `order: 'DESC'` for queries (newest first). Items are reversed to ASC before charting so Recharts renders left-to-right chronologically.
- **XAxis**: uses numeric `dataKey="ts"` (epoch ms) with `type="number" scale="time"`. The Brush has been removed — it was decorative only (no controlled state). Time-range filtering is done via `BuildQueryForm`.
- **Label formatting**: shared in `~utils/chartLabels` (`isLongSpan()`, `createTickFormatter()`). All spans show rotated (-30°) `"MMM DD HH:mm"` labels unconditionally. Axis compensation is always 60px for bottom charts.
- **Tooltip**: uses `labelFormatter={(ts) => dayjs(ts).format('MMM DD HH:mm')}` to render human-readable timestamps instead of raw epoch ms.
- **Legend**: positioned at `verticalAlign="top"` on `ReadingsTargetChart` to avoid competing with XAxis labels. `OnOffChart` has no legend (single-line charts).
- **Skeleton**: `ChartsTabsSkeleton` renders a single 360px rectangle — does not mirror the stacked layout. This is a known gap.

## Build & Development

- `yarn dev` — http://localhost:5173/
- `yarn build` — `tsc -b && vite build` (may fail if generated schemas.ts has TS errors; regenerate)
- `npx vite build` — builds without typecheck
- `yarn lint` / `yarn lint:fix` — ESLint
- `yarn format` / `yarn format:check` — Prettier
- `yarn test` / `yarn test:watch` / `yarn test:coverage` — Vitest
- Husky pre-commit: lint-staged (eslint --fix + prettier)

## Testing

- **Test runner**: Vitest 3.x with jsdom environment. Config lives in `vitest.config.ts` (separate file — merging into `vite.config.ts` causes type conflicts between Vitest's bundled vite and the project's `@vitejs/plugin-react`).
- **Global setup**: `src/test/setup.ts` auto-applies `@testing-library/jest-dom` matchers and runs `cleanup()` after each test via `afterEach`.
- **Shared fixtures**: `src/test/fixtures.tsx` exports `makePicoUnit()` (factory), `renderWithProviders()` (QueryClientProvider wrapper), and other shared test helpers.
- **What to test**: Pure utilities (`methods.ts`), custom hooks with logic (`useAsyncWithToast`), mutation factories (`createOptimisticMutation`), ErrorBoundary, and dialogs that send hardware commands (`DevicesDialog`). Skip pass-through React Query wrappers, generated API code, and presentational-only components.
- **Globals**: `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` are available without imports (in `.test.*` files). Import `render`, `screen`, `waitFor` from `@testing-library/react` and `userEvent` from `@testing-library/user-event`.
- **Never test generated code** in `src/api/generated/`.

## Known Quirks

- `picoUnitIdBatchesControllerGetCurrentV1` requires `batchId: 0` (generator bug — param not in URL, ignored)
- Vite chunk size warning (~1.35 MB) is informational
- **V1 naming**: all generated API methods carry a `V1` suffix (e.g. `batchesControllerListV1`, `picoUnitIdControllerGetOneV1`). This comes from the server's URI versioning (`/v1/` prefix) and is not a bug. Method names will change again when `/v2/` endpoints are introduced — plan client code accordingly.
- `schemas.ts` sometimes uses bare `Array` without type param — regenerate from fixed server spec
- `schemas.ts` sometimes uses `Array<z>` instead of `Array<string>` — fixed by `Fix 1b` in `scripts/fix-array-types.mjs` (generator bug in `openapi-zod-client` v1.18.3)
- **`RefreshButton` atom** (`src/components/ui/atoms/RefreshButton.tsx`): reusable Tooltip+IconButton+RefreshIcon component. Props: `onClick`, `isLoading?`, `tooltip?`, `ariaLabel?`, `size?`. The `<span>` wrapper is required for Tooltip to work when IconButton is disabled (MUI quirk). Use this instead of inline `RefreshIcon`+`Tooltip`+`IconButton` patterns.
- `PicoUnitCard.tsx` `friendlyDate` uses `new Date().toLocaleString()` instead of `dayjs` — pre-existing deviation from the "Use dayjs for dates" rule
- Grep tool skips `src/api/generated/` (gitignored) — always use `read` or bash `grep`/`rg` directly to discover generated method signatures
- **PicoUnit.status is the canonical health signal** — server provides `'unmonitored'|'healthy'|'degraded'|'offline'`. Client-side health helpers (`isUnitOffline`, `isUnitHealthy`, `shouldShowRebootHint`) removed. Use `pico.status` directly.
- **PicoUnit TS interface is incomplete** — many fields (`id`, `name`, `handle`, `monitored`, `last_seen`, etc.) are passthrough from zod. Access via `pico.<field>` works at runtime but lacks strict typing.
- **`useListPicoUnits` conflation fix**: The first argument is the API filter params (e.g. `{ monitored: true }`); the second argument is React Query options (e.g. `{ enabled: open }`). The RQ run-flag (`enabled`) must come from `queryOptions`, not entity filter params. The hook no longer defaults to filtering by `monitored: true` — callers must pass it explicitly if they want only monitored units.
- Health icon: `UnitHealthIcon` (import from `~components`) renders a status icon (✓/⚠/✗/⏸) with a tooltip. Accepts `{ status: 'unmonitored'|'healthy'|'degraded'|'offline' }`. Used in `PicoUnitCard` (list page) and as `titleAdornment` on the unit detail page.
- `PicoUnit.mac` (nullable string) stores the Pico's Wi‑Fi MAC address. Used client-side to derive the AP provisioning SSID (`mushpi-provision-XXXX` from last 4 hex chars). Set once by the server during the first successful cron poll; never updated.
- Soft-AP provisioning wizards reference `http://192.168.4.1:5000` (Pico AP mode) in user instructions only — no direct API calls to Pico units from the frontend. All communication goes through `mushpi-server`.
- Server-down detection: `ServerDownBanner` (import from `~components`) renders a warning `Alert` at the top of the app when `GET /ping` fails. Uses `useIsServerReachable` hook (30s polling, `retry: false`). Fast-path: any successful server response from another query immediately clears the banner via `QueryCache.subscribe()` — no waiting for the next ping tick.
- `/ping` vs `/health`: `/ping` returns bare `"pong"` — use for liveness polling (`retry: false`, low overhead). `/health` returns full `HealthCheckResponseDto` with server/database/service status — use for the Server page. The `monitoringControllerPing()` method exists on both `MonitoringApi` and `NoValidationApi` in the generated client; use `MonitoringApi` (consistent with `useServerHealth`).
- **Sidebar icon for Server page**: `DnsIcon` (`@mui/icons-material/Dns`), not `SettingsIcon`. The gear icon belongs to Settings. Server originally used `SettingsIcon` — reassigned during Feature #15.
- **Settings page**: Uses `SettingsApi` (manually wired in `src/api/client.ts`). `useSettings()` query + `useUpdateSettings()` mutation co-located in `src/hooks/useSettings.ts` (singleton resource pattern, not in entity mutations folder). Zod validation uses the generated `UpdateSettingsDto` schema.
- **`PicoUnit.devices` field**: `POST /v1/pico-units/:id/poll` now returns `PollPicoUnitResponseDto` which extends `PicoUnit` with an optional `devices?: DevicesDto` field containing live pin mapping from the Pico (`active_high`, `pins.dht/humidifier/fan/heater`). This field is only available on poll responses — it is not persisted server-side. The client accesses it via `pico.devices` from `pollPico()` results.
- **`MappingInfo` card — content without `latest_reading`**: The pin mapping info card (`PicoUnitMapping/MappingInfo.tsx`) gates on `pico` only (not `latest_reading`), since pin mapping is independent of sensor readings. This is a separate pattern from Controls/Devices cards which require sensor data. Document as a distinct card category.
- **Generated DTO naming collision**: Both the TypeScript interface and the Zod schema for DTOs like `ChangeSetupDto` share the same exported name. When importing both from `src/api/generated/`, rename one to avoid conflicts — e.g. `import { ChangeSetupDto, ChangeSetupDtoSchema } from '~api/generated/schemas'`. The schema rename convention appends `Schema` to the DTO name.
- **`active_high` excluded from UI**: The `active_high` field (relay polarity) is deliberately excluded from the pin mapping dialog — it is relay configuration, not Pico pin mapping. It passes through in `devices` but the UI only exposes the 4 GPIO pin numbers.
- **Dialog props beyond `DialogProps`**: The shared `DialogProps` interface (`open`/`onClose`/`closeOnSave?`) is a minimal convenience for `ModalForm`/`EditMetaDialog`-style dialogs. Dialogs needing extra typed props (e.g. target IDs, entity data, boolean flags) define a local interface alongside `open`/`onClose` — do not contort the shared interface to fit.
- **Do NOT use MUI `<Popper>` for persistent panels with mutable content.** `<Popper>` uses floating-ui under the hood, which recalculates position via JS on every content re-render. When the panel stays open while the user interacts with form fields inside it (e.g. date pickers, text inputs), each value change triggers a reposition — causing the panel to drift or teleport to wrong corners of the screen. Instead, use a conditional render with CSS `position: absolute` on the child and `position: relative` on the immediate parent. This pins the panel in place with zero JS recalculation. See `PeriodSelect.tsx` for the pattern.

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
- **No dead props**: The ESLint config treats unused props/imports as errors (`@typescript-eslint/no-unused-vars`). Don't add props to an interface that the component body never uses — the build will fail. If a prop seems theoretically useful but has no consumer, drop it.
- **Page-scoped presentational components**: A presentational (stateless) component used by only one page stays co-located in `pages/<Page>/components/`, not under `components/ui/atoms/`. The shared `atoms/` directory is for components reused across 2+ pages. If a page-scoped component later gains a second consumer, promote it to `components/ui/atoms/` at that time.
- **Error boundaries are the sole exception to functional components**: React's error boundary lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`) only exist on class components — there is no functional hook equivalent. The `ErrorBoundary` component in `molecules/` is intentionally a class component. Wrap it around `<Routes>` only (not the app shell) so the sidebar and `ServerDownBanner` survive page crashes.
- **Mutation identity in context `useMemo` deps**: React Query v5's `useMutation` returns a wrapper object that changes identity every render, but `mutate`/`mutateAsync` are referentially stable. In context-provider `useMemo` dependency arrays, **destructure** `mutate`, `mutateAsync`, and `isPending` from the mutation result and depend on those stable primitives — never the whole mutation wrapper object. Rebuilding the wrapper from stable parts keeps the memo honest and prevents cascading consumer re-renders.
- **CSV download failures must surface via toast**: `useAsyncWithToast().run()` with `fallbackErrorMessage: 'Failed to download CSV'` and `rethrow: true`. Wrap the export+download logic inside `run()`. Server HTTP errors auto-surface; `fallbackErrorMessage` covers network/non-HTTP failures. Remove `console.error` calls from download catch blocks.
