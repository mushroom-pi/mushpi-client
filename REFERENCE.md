# mushpi-client — Reference (On-Demand)

Long-tail details and gotchas. **Load only when the task touches these areas** — do not read on every spawn. The always-loaded [`AGENTS.md`](./AGENTS.md) holds the stack, API client, routing, directory index, build/dev/testing commands, state-management inventory, coding rules, and env vars.

Topics covered here: path aliases · image handling · `useAsyncWithToast` · polling gotchas · Recharts chart conventions · directory & file detail · client regeneration · testing (Vitest) detail · component & mutation gotchas · known quirks · feature palettes · Knip · Husky fragility.

---

## Path Aliases

Defined in `vite.config.ts` + `tsconfig.app.json` (keep in sync) — 14 aliases, one per row:

- `~api/*` → `src/api/*`
- `~assets/*` → `src/assets/*`
- `~comp/*` → `src/components/` (directory)
- `~components` → `src/components/index.ts` (barrel)
- `~ctx/*` → `src/contexts/*`
- `~hook/*` → `src/hooks/*`
- `~int/*` → `src/interfaces/*`
- `~layout/*` → `src/layout/*`
- `~pages/*` → `src/pages/*`
- `~theme/*` → `src/theme/*`
- `~type/*` → `src/types/*`
- `~utils/*` → `src/utils/*`
- `src/*` → `src/*`
- `@/*` → `src/*`

## Images

- `Recipe.image` / `Batch.images` contain **filenames only** (e.g. `"abc123.jpg"`)
- `Recipe.image_url` / `Batch.images_url` contain **root-relative URLs** (e.g. `/images/recipes/1.jpg`) for uploaded files, or an absolute external hotlink URL as-is (Recipe only)
- Resolve these before rendering with `resolveApiUrl()` from `~utils/apiUrl` — it prefixes relative paths with `VITE_API_BASE_URL` (so dev on Vite :5173 loads from the server origin) and passes absolute URLs (`http(s)://`, `//`, `data:`, `blob:`) through untouched. Apply it in the page components that map DTO → `ImageManagerImage` (e.g. `RecipeImage.tsx`, `BatchImages.tsx`), **never** inside the presentational `ImageManager` molecule.
- Images are managed via `ImagesApi` (upload, delete) — endpoints live in `src/api/generated/api.ts`
- Shared UI: `ImageManager` molecule (`src/components/ui/molecules/ImageManager/`) handles both single-image (Recipe, `maxImages=1`, `allowHotlink=true`) and gallery (Batch, `maxImages=5`, `allowHotlink=false`) modes
- Upload dialog supports drag-and-drop + file picker; optional URL tab for hotlinking (Recipe only)

## useAsyncWithToast (imperative async with toast)

For one-shot actions that don't benefit from mutation caching (e.g., add-pico-unit form), use the imperative `useAsyncWithToast` hook instead of TanStack `useMutation`:

```ts
const { run } = useAsyncWithToast();

await run(
  async () => {
    /* execute async work */
  },
  {
    successMessage: 'Done', // shown as success toast
    fallbackErrorMessage: 'Failed', // shown if error is not an HttpException
    rethrow: true, // re-throws after toast so outer catch can handle
    skipErrorToast: false, // set true to suppress error toast (caller handles)
    onSuccess: () => {
      /* callback */
    },
    onError: (err) => {
      /* callback */
    },
  },
);
```

- `run()` returns the async function's result on success, or throws on error (when `rethrow: true`)
- Server HTTP error responses (409, 424, etc.) automatically surface as error toasts with the server's descriptive message
- Use `useMutation` for entity mutations that participate in React Query caching; use `useAsyncWithToast` for imperative flows like the Add dialog or delete confirmations that navigate away on success
- When pairing `useAsyncWithToast` with `ModalForm` (which needs `isPending` for the submit button), manage a local `useState(false)` `isPending` boolean — set `true` before `run()`, `false` in the `finally` block. The `ModalForm`'s `canSubmit` and `isPending` props use this local state, not a React Query mutation's `isPending`

## Polling Gotchas

- **Background polling**: React Query v5 defaults `refetchIntervalInBackground` to `false`. Combined with the global `refetchOnWindowFocus: false`, polling silently pauses when the tab is hidden and never resumes on focus return. Every query with `refetchInterval` that needs to stay live regardless of tab visibility must also set `refetchIntervalInBackground: true`. The readings and batch-readings queries (`useReadings.ts`, `useBatchReadings.ts`) do this; the unit-list query (`src/contexts/PicoUnits/hooks.ts`) does **not** — its 60 s `refetchInterval` pauses while the tab is hidden (the list still refreshes on remount and via poll propagation through `applyPollResult`).
- **`unwrap<T>` mis-infers the generated API return type**: `unwrap()` (from `~api/adapter`) types its result as the full `AxiosResponse<T>` rather than the actual `data` payload for generated API calls, even though it returns the unwrapped data object at runtime. Any new **strongly-typed** consumer of an `unwrap()` result therefore needs an `as unknown as <Type>` cast (the codebase's existing convention) — it only "works" silently when passed to permissive APIs like `setQueryData`, whose generic defaults to `unknown`. See `src/contexts/PicoUnit/hooks.ts` (`mutationFn`/`queryFn` and the `applyPollResult` call sites) for the established cast pattern.
- **dayjs relative time**: The `relativeTime` plugin is NOT registered globally. Use `dayjs().diff()` + manual formatting for "X ago" strings. See `src/pages/Dashboard/methods.ts` for the pattern (`formatRelativeFromNow`, `formatLastSeen`).

### Pico Poll & Mutation Patterns

- Mutations live in the entity's `mutations/` folder (one file per concern)
- Optimistic updates via `createOptimisticMutation` factory in `src/contexts/PicoUnit/helpers.ts`
- **One-shot server actions** (e.g. `/reboot`, `/poll` returning 202) use plain `useMutation` with `onSuccess` invalidation — NOT `createOptimisticMutation`. There is no optimistic client state to project (the Pico goes offline briefly, an immediate follow-up poll would fail), unlike control mutations (`/setpoints`, `/outputs`, `/control/loop`, `/setup`) which do use `createOptimisticMutation` + poll-on-settle
- **On-demand hardware polling**: `usePollPicoUnit` mutation calls `POST /v1/pico-units/:id/poll` to trigger an immediate Pico poll (stores a new reading, returns updated `PicoUnit` with `latest_reading`). Exposed via `pollPico` on `PicoUnitCtx`. Used on page mount, after control mutations, and for periodic 60 s background refresh on the unit detail, readings, and batch pages.
- **Poll results must propagate to BOTH caches**: the list query (`picoUnitsKeys.*`) and the detail query (`picoUnitKeys.detail(id)`) are disjoint — writing to one does not touch the other. Any code path consuming a Pico poll result must write it to both, or the list page will show stale `status`/`last_seen` when navigating back from a detail page. Use `applyPollResult(qc, id, data)` from `~ctx/PicoUnit/helpers` (writes the detail cache + patches every list page via `updateItemInAllPages`). `usePollPicoUnit.onSuccess` and `useGetPicoUnit`'s 60 s background poll both already do this — a new poll path that forgets it re-introduces the staleness bug.
- **60 s background refresh**: long-lived readings views (unit detail, readings board, batch detail) auto-refresh every 60 s via hardware poll on the unit detail page and `refetchInterval` on the readings/batch readings queries. Dashboard uses `useDashboard` hook with `refetchInterval: 60_000` — single `GET /v1/dashboard/summary` call returns all aggregated data.

## Charts (Recharts)

Chart components live in `src/components/ui/molecules/ChartsTabs/`. Providers and the `useChartsContext()` hook live in `src/contexts/Charts/`.

Three chart tabs in `/readings` and `/batches/:id`:

- `TempHumTab` — temperature + humidity with avg line, min-max range band (`Area`), and target setpoint (`Line` with dashed stroke)
- `DevicesTab` — binary step-area on/off for fan, humidifier, heater (majority vote per bucket)
- `ControlLoopTab` — binary step-area on/off for control loop enabled (majority vote per bucket)

Unit readings (`/readings`): shared query params from `ChartsProvider` (`useCharts()`).
Batch readings (`/batches/:id`): `BatchChartsProvider` sources data from `useBatchReadings`, provides same context shape — chart tabs work unchanged for both.

Server-side aggregation via `points` parameter (default 200, min 10, max 2000). `AggregatedChartPoint` carries per-bucket stats: avg, min, max, relay majority votes, setpoints, and `readingCount`. The `DisplayPointsSelect` drives the server `points` value; "Auto" derives it from container width via `useChartContainerWidth`. Client-side smoothing utilities removed — server handles all aggregation.

**Derived numeric query params must be quantized** before joining the query key. `useChartContainerWidth()` derives `points` from container width — without quantization, 1 px ResizeObserver jitter creates a brand-new query observer that resets `refetchInterval` to zero. Round to the nearest 10 and guard against no-op updates.

**Time-relative query bounds store intent, not resolved timestamps.** When a user selects "Last 1h", store the preset descriptor (`{ kind:'preset', preset:'1h' }`) in the query key and resolve it to absolute timestamps (`start=now()-1h, end=now()`) inside `queryFn` at execution time. If absolute timestamps are frozen into provider state at apply time, every `refetchInterval` tick refetches the same stale window with no new data. Custom absolute ranges store their frozen bounds — that behavior is correct. See `~utils/timeWindow.ts` for the `TimeWindow` discriminated union and `resolveTimeBounds()`.

**Unit selection on the Readings page has three layered state sources** — `PicoUnits.selectedUnitId` (app context) → `ChartsProvider.initialParams`/`params` (Charts context) → `BuildQueryForm.localParams` (form draft). `src/contexts/Charts/provider.tsx` runs a one-directional sync effect that reverts `params.picoUnitId` back to `initialParams.picoUnitId`, and `initialParams` derives from `selectedUnitId` in `src/pages/Readings/index.tsx` (`selectedId`, passed to `<ChartsProvider initialParams={{ picoUnitId: selectedId, points: 200 }}>`). **Rule: any code that changes the selected unit must go through `setSelectedUnitId` from `usePicoUnitsContext()`** — writing only to the Charts `params` is silently reverted on the next commit, so the dropdown would display the new unit while charts/CSV/Refresh still read the old unit's data (the readings query is keyed on `params.picoUnitId`). This also gates the page-level poll effect in `src/pages/Readings/index.tsx` (effect with `[selectedId]` deps), which only fires when `selectedUnitId` actually changes. Reference impl: `onPicoUnitChange` in `src/pages/Readings/components/BuildQueryForm/useBuildQueryForm.ts`.

### Chart Layout Conventions

- **Two chart components** serve all three tabs: `ReadingsTargetChart` (temp/humidity with target lines) and `OnOffChart` (binary step lines). Both wrap in `<ResponsiveContainer>` with `syncId="anyId"` for cross-chart tooltip linking.
- **Stacked layout**: only the bottom chart per tab shows `showXAxis`. Top charts use `hide={!showXAxis}`. `axisCompensation` (calculated as `showXAxis ? 60 : 0`) is added to the chart height so all plot areas remain equal regardless of axis visibility.
- **Data sort order**: chart providers default to `order: 'DESC'` for queries (newest first). Items are reversed to ASC before charting so Recharts renders left-to-right chronologically.
- **XAxis**: uses numeric `dataKey="ts"` (epoch ms) with `type="number" scale="time"`. The Brush has been removed — it was decorative only (no controlled state). Time-range filtering is done via `BuildQueryForm`.
- **Label formatting**: shared in `~utils/chartLabels` (`isLongSpan()`, `createTickFormatter()`). All spans show rotated (-30°) `"MMM DD HH:mm"` labels unconditionally. Axis compensation is always 60px for bottom charts.
- **Tooltip**: uses `labelFormatter={(ts) => dayjs(ts).format('MMM DD HH:mm')}` to render human-readable timestamps instead of raw epoch ms.
- **Legend**: positioned at `verticalAlign="top"` on `ReadingsTargetChart` to avoid competing with XAxis labels. `OnOffChart` has no legend (single-line charts).
- **Skeleton**: `ChartsTabsSkeleton` renders a single 360px rectangle — does not mirror the stacked layout. This is a known gap.

## Directory & File Detail

Per-file commentary for the directory-level index in [`AGENTS.md`](./AGENTS.md) §Directory Structure.

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
├── hooks/                   # useDashboard, useReadings, useBatchReadings, useServerHealth, useIsServerReachable, useAsyncWithToast, useSettings, useChartContainerWidth, useDocumentTitle
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
│   │   └── components/
│   │       └── BuildQueryForm/         # useBuildQueryForm.test.tsx — Charts-context unit-switch test (see §Charts (Recharts))
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
├── types/                   # charts.ts; buildInfo.d.ts (ambient Vite `define` version globals)
└── utils/
    ├── apiUrl.ts            # Normalized API base (`API_BASE`, trailing slashes stripped) + resolveApiUrl()
    ├── apiUrl.test.ts       # Vitest: base normalization + image-URL resolution
    ├── buildInfo.ts         # Build-time version globals (define-injected) — CLIENT_BUILD_VERSION, RELEASE_VERSION/LABEL
    ├── chartLabels.ts       # Chart tick-label helpers (isLongSpan, createTickFormatter)
    ├── methods.ts           # Generic: date formatting, bytes, percentages
    ├── methods.test.ts      # Vitest: pure formatting helpers
    ├── pico.ts              # Pico: provisioning constants, LED_STATES, chip color helpers, firmwareStatus()/firmwareCaption() display helpers, compatibilityStatus() (maps server-owned api_compatibility verdict)
    ├── pico.test.ts         # Vitest: firmware-status null/unknown branching + caption composition + compatibilityStatus verdict/defensive-unknown branching + compile-time contract guards (CompatibilityStatus ↔ PicoUnitApiCompatibilityEnum, UnitStatus ↔ PicoUnitStatusEnum)
    └── timeWindow.ts        # TimeWindow union + resolveTimeBounds() (store intent, resolve per fetch)
```

> **Removed path note**: `src/utils/charts.ts` was deleted — the server handles all chart aggregation (see §Charts (Recharts)). It is not structure and does not appear in the tree above.

## Regenerating the Client

**Offline regeneration (preferred when no server is running).** The bare `gen:client`/`gen:schemas` default to the client's own `./openapi.json`, which can be **stale** relative to the server's committed spec. Point `OPENAPI_SPEC` at the server's canonical spec instead — no server boot, no risk of touching a live database:

```bash
OPENAPI_SPEC=../mushpi-server/spec/openapi.json yarn gen:client && \
OPENAPI_SPEC=../mushpi-server/spec/openapi.json yarn gen:schemas
```

## Testing (Vitest) Detail

- **Globals**: `vitest.config.ts` sets `globals: true`, so `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` work at _runtime_ without imports. **But you must still import them from `vitest`** — `tsc -b` type-checks test files and `vitest/globals` is not in tsconfig `types`, so relying on globals breaks `yarn build`. Import `render`, `screen`, `waitFor` from `@testing-library/react` and `userEvent` from `@testing-library/user-event`.
- **Charts-context unit switching**: first test covering the Readings page / Charts-context unit switching is `src/pages/Readings/components/BuildQueryForm/useBuildQueryForm.test.tsx`. To faithfully reproduce the `ChartsProvider` sync effect in a test harness, `initialParams` must be **derived from the same upstream source the real page uses** (`selectedUnitId`), typically via a small bridge component — a hardcoded/static `initialParams` makes the revert unavoidable and yields an unfaithful test (see §Charts (Recharts) for the contract).
- **No `import/order` warning allowance in test files**: the former `../../test/fixtures`-vs-`./helpers` warnings were a comparator artifact (Prettier natural-sort vs `import/order` alphabetize), removed by dropping `alphabetize` — see §Husky Exec-Bit Fragility. `lint:ci` rejects warnings in test files too.

## Component & Mutation Gotchas

- **Mutation identity in context `useMemo` deps**: React Query v5's `useMutation` returns a wrapper object that changes identity every render, but `mutate`/`mutateAsync` are referentially stable. In context-provider `useMemo` dependency arrays, **destructure** `mutate`, `mutateAsync`, and `isPending` from the mutation result and depend on those stable primitives — never the whole mutation wrapper object. Rebuilding the wrapper from stable parts keeps the memo honest and prevents cascading consumer re-renders.
- **CSV download failures must surface via toast**: `useAsyncWithToast().run()` with `fallbackErrorMessage: 'Failed to download CSV'` and `rethrow: true`. Wrap the export+download logic inside `run()`. Server HTTP errors auto-surface; `fallbackErrorMessage` covers network/non-HTTP failures. Remove `console.error` calls from download catch blocks.

## Known Quirks

- `picoUnitIdBatchesControllerGetCurrentV1` requires `batchId: 0` (generator bug — param not in URL, ignored)
- Vite chunk size warning (~1.35 MB) is informational
- **V1 naming**: all generated API methods carry a `V1` suffix (e.g. `batchesControllerListV1`, `picoUnitIdControllerGetOneV1`). This comes from the server's URI versioning (`/v1/` prefix) and is not a bug. Method names will change again when `/v2/` endpoints are introduced — plan client code accordingly.
- `schemas.ts` sometimes uses bare `Array` without type param — regenerate from fixed server spec
- `schemas.ts` sometimes uses `Array<z>` instead of `Array<string>` — fixed by `Fix 1b` in `scripts/fix-array-types.mjs` (generator bug in `openapi-zod-client` v1.18.3)
- **`RefreshButton` atom** (`src/components/ui/atoms/RefreshButton.tsx`): reusable Tooltip+IconButton+RefreshIcon component. Props: `onClick`, `isLoading?`, `tooltip?`, `ariaLabel?`, `size?`. The `<span>` wrapper is required for Tooltip to work when IconButton is disabled (MUI quirk). Use this instead of inline `RefreshIcon`+`Tooltip`+`IconButton` patterns.
- `PicoUnitCard.tsx` `friendlyDate` uses `new Date().toLocaleString()` instead of `dayjs` — pre-existing deviation from the "Use dayjs for dates" rule
- Grep tool skips `src/api/generated/` (gitignored) — always use `read` or bash `grep`/`rg` directly to discover generated method signatures
- **Yarn artifacts in git**: `.yarn/install-state.gz` is a regenerable build artifact and is untracked — never re-add it. The `.gitignore` allowlist (`.yarn/*` + negations for `patches`, `plugins`, `releases`, `sdks`, `versions`) is deliberate tracked-config policy — do not "clean up" the negations. Note: `.gitignore` has no effect on already-tracked files, so removal required `git rm --cached`.
- **PicoUnit.status is the canonical health signal** — server provides `'unmonitored'|'healthy'|'degraded'|'offline'`. Client-side health helpers (`isUnitOffline`, `isUnitHealthy`, `shouldShowRebootHint`) removed. Use `pico.status` directly.
- **Generated `PicoUnit` is complete** — every entity field (`id`, `name`, `handle`, `monitored`, `last_seen`, etc.) is declared on the generated interface (the server's `@ApiProperty` sweep made it so). Access via `pico.<field>` is strictly typed; no local hand-written `PicoUnit` interface or `as any` casts are needed.
- **`useListPicoUnits` conflation fix**: The first argument is the API filter params (e.g. `{ monitored: true }`); the second argument is React Query options (e.g. `{ enabled: open }`). The RQ run-flag (`enabled`) must come from `queryOptions`, not entity filter params. The hook no longer defaults to filtering by `monitored: true` — callers must pass it explicitly if they want only monitored units.
- Health icon: `UnitHealthIcon` (import from `~components`) renders a status icon (✓/⚠/✗/⏸) with a tooltip. Accepts `{ status: UnitStatus }`, where `UnitStatus` is **derived** from the generated `PicoUnitStatusEnum` (re-exported from `~components` — never re-hand-copy the literal union) and guarded at compile time in `src/utils/pico.test.ts`. Used in `PicoUnitCard` (list page), as `titleAdornment` on the unit detail page, and in dashboard `UnitCards` (single icon mapping — do not re-implement it).
- **Server-owned value enums need an exhaustive `Record` + runtime catch-all**: when consuming a generated enum (e.g. `DashboardWarningDtoTypeEnum`), classify members through an exhaustiveness-checked `Record<Enum, …>` so a new server member is a `tsc` failure, not a silently dropped item — and keep a runtime catch-all bucket so an unknown value from a newer server still renders. Reference impl: `WARNING_GROUPS` in `src/pages/Dashboard/components/WarningsBanner.tsx`.
- `PicoUnit.mac` (nullable string) stores the Pico's Wi‑Fi MAC address. Used client-side to derive the AP provisioning SSID (`mushpi-provision-XXXX` from last 4 hex chars). Set once by the server during the first successful cron poll; never updated.
- Soft-AP provisioning wizards reference `http://192.168.4.1:5000` (Pico AP mode) in user instructions only — no direct API calls to Pico units from the frontend. All communication goes through `mushpi-server`.
- Server-down detection: `ServerDownBanner` (import from `~components`) renders a warning `Alert` at the top of the app when `GET /ping` fails. Uses `useIsServerReachable` hook (30s polling, `retry: false`). Fast-path: any successful server response from another query immediately clears the banner via `QueryCache.subscribe()` — no waiting for the next ping tick.
- `/ping` vs `/health`: `/ping` returns bare `"pong"` — use for liveness polling (`retry: false`, low overhead). `/health` returns full `HealthCheckResponseDto` with server/database/service status — use for the Server page. The `monitoringControllerPing()` method exists on both `MonitoringApi` and `NoValidationApi` in the generated client; use `MonitoringApi` (consistent with `useServerHealth`).
- **Sidebar icon for Server page**: `DnsIcon` (`@mui/icons-material/Dns`), not `SettingsIcon`. The gear icon belongs to Settings. Server originally used `SettingsIcon` — reassigned when the gear was reserved for the Settings page.
- **Settings page (singleton resource pattern)**: Uses `SettingsApi` (manually wired in `src/api/client.ts`). `useSettings()` fetches the current timezone from `GET /v1/settings`; `useUpdateSettings()` mutation calls `PATCH /v1/settings` with `onSuccess` cache update + snackbar. Query and mutation are co-located in `src/hooks/useSettings.ts` — not in an entity mutations folder. Zod validation uses the generated `UpdateSettingsDto` schema.
- **`PicoUnit.devices` field**: `POST /v1/pico-units/:id/poll` now returns `PollPicoUnitResponseDto` which extends `PicoUnit` with an optional `devices?: DevicesDto` field containing live pin mapping from the Pico (`active_high`, `pins.dht/humidifier/fan/heater`). This field is only available on poll responses — it is not persisted server-side. The client accesses it via `pico.devices` from `pollPico()` results.
- **`MappingInfo` card — content without `latest_reading`**: The pin mapping info card (`PicoUnitMapping/MappingInfo.tsx`) gates on `pico` only (not `latest_reading`), since pin mapping is independent of sensor readings. This is a separate pattern from Controls/Devices cards which require sensor data. Document as a distinct card category.
- **Generated DTO naming collision**: Both the TypeScript interface and the Zod schema for DTOs like `ChangeSetupDto` share the same exported name. When importing both from `src/api/generated/`, rename one to avoid conflicts — e.g. `import { ChangeSetupDto, ChangeSetupDtoSchema } from '~api/generated/schemas'`. The schema rename convention appends `Schema` to the DTO name.
- **`active_high` excluded from UI**: The `active_high` field (relay polarity) is deliberately excluded from the pin mapping dialog — it is relay configuration, not Pico pin mapping. It passes through in `devices` but the UI only exposes the 4 GPIO pin numbers.
- **Dialog props beyond `DialogProps`**: The shared `DialogProps` interface (`open`/`onClose`/`closeOnSave?`) is a minimal convenience for `ModalForm`/`EditMetaDialog`-style dialogs. Dialogs needing extra typed props (e.g. target IDs, entity data, boolean flags) define a local interface alongside `open`/`onClose` — do not contort the shared interface to fit.
- **Do NOT use MUI `<Popper>` for persistent panels with mutable content.** `<Popper>` uses floating-ui under the hood, which recalculates position via JS on every content re-render. When the panel stays open while the user interacts with form fields inside it (e.g. date pickers, text inputs), each value change triggers a reposition — causing the panel to drift or teleport to wrong corners of the screen. Instead, use a conditional render with CSS `position: absolute` on the child and `position: relative` on the immediate parent. This pins the panel in place with zero JS recalculation. See `PeriodSelect.tsx` for the pattern.
- **Protocol-relative URL corruption from trailing-slash base paths.** The generated client's `createRequestFunction` (`src/api/generated/common.ts`) naive-concatenates `basePath + url`, and `url` is always path-absolute (`/ping`, `/v1/...`). A `basePath` ending in `/` therefore yields protocol-relative URLs (`'/' + '/ping'` = `//ping` → browser requests `http://ping`). Never pass a trailing-slash basePath — always normalize with `.replace(/\/+$/, '')` via the shared `API_BASE` constant in `src/utils/apiUrl.ts`. Both the generated client's base (read in `src/api/client.ts`, fallback `http://localhost:3000`) and `resolveApiUrl()` consume `API_BASE`; same-origin `/` normalizes to an empty basePath, so the naive `basePath + url` join yields relative `/ping`, not protocol-relative `//ping` — **do not remove the normalization thinking it's redundant**. Dev sets `VITE_API_BASE_URL` to `http://localhost:3000` via a **local, gitignored `.env`**; prod bakes it as `/` at Docker build time (same-origin). Same join applies to any hand-built URL off the API base (e.g. the Server page docs button). Relevant when touching API base config, `VITE_API_BASE_URL`/`VITE_DOCS_PATH` env vars, or the Docker client build.
- **Context mocks in component tests must return referentially stable objects.** If the component-under-test memoizes derived state off a context value (e.g. `useMemo(() => pico?.latest_reading, [pico])`) or has effects keyed on it (e.g. a reset-on-`[open, lr]` effect), a `vi.mock` factory that constructs a fresh context object per hook call re-triggers those effects on every render and silently wipes user interaction — surfacing as disabled buttons and user-event's cryptic `pointer-events: none` error rather than an obvious assertion failure. Pattern:
  - Build the mock context object lazily once inside the returned hook closure (a `let` cache), **not** at the `vi.mock` factory top-level — this keeps external references (imports like `makePicoUnit`, module-scope consts like `mockMutateAsync`) evaluated at hook-call time and avoids `vi.mock`-hoisting TDZ "Cannot access before initialization" errors.
  - Add `expect(button).toBeEnabled()` before `user.click(...)` as a fail-loud guard, so a future regression of this kind fails with a clear "button is disabled" message.
  - Reference: `src/pages/PicoUnit/components/PicoUnitDevices/DevicesDialog.test.tsx` mocks `~ctx/PicoUnit` and the fix was memoizing the returned context. The real `PicoUnitProvider` memoizes its context value and `pico` is React Query cache data (referentially stable).
- **Per-route tab titles (`useDocumentTitle`)**: every route page calls `useDocumentTitle('<Page>')` from `~hook/useDocumentTitle` (renders `"<Page> — Mushroom Pi"`); detail pages call it inside the `*Inner` component with ``entity?.name ?? `Entity #${useParams id}` `` — exactly one call-site per route, never in the outer page wrapper. `index.html` holds the bare-brand fallback `Mushroom Pi`. Gotchas: (1) exactly one owner per route — a call in both a wrapper and its Inner child duels via effect ordering (child effects run first; parent's last and wins), clobbering the data-refined title when cached data renders in the same commit; (2) no `*` catch-all route exists — unknown URLs render an empty main area and keep the `index.html` title on fresh load; (3) `react-helmet-async` evaluated and rejected (v2 peer-declares React ≤18; repo on React 19; 10-line idempotent hook covers it with no provider); (4) pass a primitive string computed before the call so effect deps compare by value.
- **Dialog auto-open via navigation state**: `navigate('/path', { state: { openEditDialog: true } })`, read in mount-only `useEffect`, clear with `window.history.replaceState`.
- **SVG assets + `public/favicon.svg` intentionally duplicate brand token values** (`accent`, `accent2`, `leaf`, `muted`, `info` — ×54 in the logos). Static art cannot consume CSS vars; if a brand token changes, sync the SVGs manually. The body gradient keeps a static `variables.css` mirror of `brand.bg`/`bgDeep`/`text` to avoid a flash-of-lighter-background on the Pi 3 B+ (pre-React paint; guarded 1:1 by `src/theme/tokens.test.ts`).
- **`firmware_version` / `api_version` are nullable (Pico↔Server version handshake)**: these `PicoUnit` fields (which replaced the removed `software_version` — old references break the build until the client is regenerated) stay `NULL` until a unit first announces with firmware that reports the version handshake, so "Unknown" is the **expected** state for legacy units (firmware predating the handshake) after the server migration, not an error — render an honest disabled-styled unknown line, never a fake default. `api_version` is the Pico↔Server REST contract generation (see `mushpi-docs/versioning.md` §4), distinct from the server's `/v1/` URI prefix — do not conflate the two in UI copy. Display helpers: `firmwareStatus()` / `firmwareCaption()` (raw version display) and `compatibilityStatus()` (maps the server verdict) in `~utils/pico`.
- **Version display / `release.json` resolution**: the sidebar footer (release bundle, axis ②) and the `/server` Overview card (client component, axis ①) read only from `~utils/buildInfo`. `release.json` lives at the monorepo root, NOT in the client repo — `vite.config.ts` tries `../release.json` (monorepo) then `./release.json` (Docker image build: requires `COPY release.json /app/release.json` in the `client-build` stage and `.dockerignore` not excluding the file; if missing the build still succeeds and the footer degrades to `dev` — a missing COPY is a silent display bug, not a build break). Never invent a version string; strict SemVer, no suffixes (`versioning.md` §3.4).
- **Firmware compatibility badge is server-owned**: the server computes `PicoUnit.api_compatibility` (enum `'compatible' | 'incompatible' | 'unknown'`, also on `PollPicoUnitResponseDto` and `DashboardUnitItemDto`) — the range-check judgement lives entirely server-side. The client renders it via `compatibilityStatus()` (`~utils/pico`) → the warning-only `FirmwareCompatBadge` atom (`~components`). **`unknown` (or an absent/legacy field) renders no badge** — an unjudged/legacy unit is expected, not an error, and the client must **never invent a client-side `api_version` range comparison** (no min/max, no hardcoded generation window). The badge copy is deliberately direction-neutral ("Incompatible firmware", never "Firmware update required") because an out-of-range value can equally mean the _server_ is the stale side. Placed in `PicoUnitCard` (list, next to the firmware caption), `PicoUnitTechnicalDetails` (inside the "API version" `InfoField`), the `PicoUnit` meta-row chip, and dashboard `UnitCards` — never in `ItemPage.titleAdornment` (reserved for `UnitHealthIcon`). `DashboardUnitItemDto` carries `api_compatibility` but **no `api_version`**, so there the badge tooltip falls back to generic copy.

## Feature Palettes & Domain Constants

Color palettes or other domain-specific constant arrays that are tightly coupled to a feature should co-locate with the UI component that consumes them. A stateless atom can export both the component and its default dataset (e.g. `ColorSwatchPicker` + `FACE_COLORS` from the same file). **Data** palettes (user-selectable values persisted to the DB, like `FACE_COLORS`) stay co-located with their component and carry a file-scoped `no-restricted-syntax` exemption — recoloring the brand must never re-interpret stored data. But if the palette holds shared **UI colors**, it belongs in `src/theme/tokens.ts` — the single source of truth for every rendered color (`brand`/`veil`/`scrim`/`led` + `cardRadius`/`cardShadow`), mapped into MUI via typed `palette.custom` in `mushroomTheme.ts`. Raw literals there are enforced away by ESLint (error) + `theme/tokens.test.ts`.

## Knip (Dead Code & Unused Dependencies)

- **Config** (`knip.json`): `entry` = non-imported roots (`src/main.tsx`, `index.html`, `src/types/buildInfo.d.ts`, `vite.config.ts`, `vitest.config.ts`, `src/test/setup.ts`, `scripts/*.mjs`); `project` = `src/**/*.{ts,tsx}` + `scripts/**/*.mjs`; `ignore` = `dist/**` + `coverage/**` — currently a no-op (the `project` globs already exclude those trees; knip's "Remove from ignore" configuration hints confirm), kept as a defensive guard so widening `project` later cannot silently pull build artifacts into the scan.
- **Gate scoping — deliberately differs from the server**: `knip:ci` = `knip --include files,dependencies,unlisted --exclude devDependencies --no-gitignore`. The server's `--dependencies` form is **blind to unused files** — the issue class that actually fires in this repo (dead files) — so the frontend gate adds `files`. In knip 5, `--include dependencies` also surfaces devDependencies findings (observed: bare `--include files,dependencies` printed 10 devDep findings), so devDeps are explicitly excluded until they are cleared. `unlisted` (imported-but-undeclared) is in scope: zero findings today, so it catches future regressions without pre-existing red. exports/types/duplicates are deliberately out of scope (~180 findings, mostly permanent generated-client noise).
- **`src/types/buildInfo.d.ts` ambient-typing gotcha**: the Vite `define`-globals typing (`__APP_BUILD_VERSION__`/`__APP_RELEASE_VERSION__`) is consumed by `tsc` via tsconfig and imported by nobody, so knip reports it as an unused file. It is a compiler entry point, not dead code — it lives in `knip.json` `entry`. Never delete the file; never "fix" it via `ignore`.
- **Generated-directory gotcha**: `src/api/generated/*` is gitignored but contains real imported code (`~api/generated/...`). Without `--no-gitignore` knip never sees those files and falsely reports `axios` and `zod` as unused dependencies; with `--no-gitignore` the false positives disappear. This is the *opposite* reason from `mushpi-server`, where `--no-gitignore` is needed because a broad ancestor `.gitignore` hides the whole project. There is no config equivalent of the flag, so it lives in the script.
- **Knip 5 vs 6 flag pin**: `--exclude devDependencies` (in `knip:ci`) is knip 5 syntax; knip 6 changed/removed that form. The `knip: "^5.51.0"` devDependency pin preserves the flag semantics — do not float to 6 without reworking `knip:ci`.

## Husky Exec-Bit Fragility

`.husky/_/` is gitignored + generated, so its executable bits live only on the local filesystem. If a copy/archive/mount/umask strips them, git silently skips the hook (no lint, no error). Repair with `rm -rf .husky/_ && npx husky` (a bare `npx husky` re-run does not restore them). Verify `ls -la .husky/_/` shows `-rwxr-xr-x`.

**ESLint severity policy** (pre-commit, v9): most rules are `warn`; `import/no-unresolved` and the raw-color `no-restricted-syntax` rules (hex/rgb/hsl literals outside `src/theme/tokens.ts`) are `error`. Pre-commit runs `eslint --fix` (no `--max-warnings=0`), so **errors block commits, warnings do not**. The zero-warnings gate is implemented as `yarn lint:ci` (`eslint . --max-warnings=0`, non-mutating) — for CI/hook layers, never for pre-commit.

**ESLint ignores generated code**: `src/api/generated/**` joins `dist/**` in the flat-config global `ignores`, mirroring the `.prettierignore` entry. The generator headers embed file-wide `/* eslint-disable */` banners and ESLint 9 reports their *lack of effect* as "unused directive" warnings; the tree is gitignored tool output, so findings there are neither actionable nor committable and hand-edits die on the next `yarn gen:*`. Hand-editing generated files remains forbidden.

**`import/order` has no `alphabetize` on purpose**: sorting belongs to `@trivago/prettier-plugin-sort-imports` (Prettier), which runs *after* `eslint --fix` in lint-staged and always wins. Its natural-sort comparator ranks `../x` before `./y`; import/order's `alphabetize` (localeCompare) ranks `./y` first — enabling both on the same files is an unfixable ping-pong (`../../test/fixtures` vs `./helpers` in test files). ESLint's `import/order` validates group membership + blank lines only; keep any future sorting authority in the Prettier plugin.
