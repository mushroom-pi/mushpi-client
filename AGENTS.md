# mushpi-client — Project Context

React 19 + Vite web dashboard served from Raspberry Pi 3 B+. Talks only to `mushpi-server`; never directly to Pico units.

## Stack

React 19 · TypeScript ~5.9 · Vite 7 · MUI v7 · TanStack React Query v5 · axios · React Router DOM v7 · Recharts v3 · dayjs · Yarn 1

## Path Aliases

`vite.config.ts` + `tsconfig.app.json`: `~api`, `~ctx`, `~hook`, `~int`, `~type`, `~comp`, `~components`, `~layout`, `~utils`, `~pages`

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

## Images

- `Recipe.image` / `Batch.images` contain **filenames only** (e.g. `"abc123.jpg"`)
- `Recipe.image_url` / `Batch.images_url` contain **absolute URLs** for display
- Images are managed via `ImagesApi` (upload, delete) — endpoints live in `src/api/generated/api.ts`
- Shared UI: `ImageManager` molecule (`src/components/ui/molecules/ImageManager/`) handles both single-image (Recipe, `maxImages=1`, `allowHotlink=true`) and gallery (Batch, `maxImages=5`, `allowHotlink=false`) modes
- Upload dialog supports drag-and-drop + file picker; optional URL tab for hotlinking (Recipe only)

## Form Validation

All Create/Edit dialogs validate against generated Zod schemas. **Never hardcode validation bounds.**

- `toDto()` converts string form values to DTO types (empty numeric strings → undefined, non-empty → Number())
- `safeParse()` against the generated schema, map issues to per-field errors
- Use `issue.message` directly — do not rewrite Zod error messages
- `isValid` = `!Object.values(errors).some(Boolean)` (not `Object.keys(errors).length === 0`)
- Disable submit: `canSubmit={hasChanges && isValid}` (edit) or `canSubmit={isValid}` (create)
- Many server DTOs are `.partial()` — only validate constraints when a value is present

## State Management

- React Query for all server state — no `useEffect` + `useState` for fetched data
- Query keys in `src/api/queryKeys.ts` (picoUnitKeys, recipeKeys, batchKeys, etc.)
- Context hooks: usePicoUnit, usePicoUnits, useRecipe, useRecipes, useBatch, useBatches, useCharts
- Mutations in entity's `mutations/` folder (one file per concern)
- Optimistic updates via `createOptimisticMutation` factory in `src/contexts/PicoUnit/helpers.ts`

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

Dialog-auto-open: `navigate('/path', { state: { openEditDialog: true } })`, read in mount-only `useEffect`, clear with `window.history.replaceState`.

## Directory Structure

```
src/
├── api/                  # Client, generated code, query keys
├── components/ui/
│   ├── atoms/            # Stateless presentational
│   ├── molecules/        # Composed (may use context/hooks)
│   │   └── ImageManager/ # Shared image gallery/upload/remove (used by Recipe + Batch)
│   └── index.ts
├── contexts/             # Context + hooks + mutations per entity
│   ├── PicoUnit/mutations/: controlLoop, delete, outputs, setPoints, update
│   ├── Recipe/mutations/: create, delete, image, update
│   ├── Batch/mutations/: create, delete, image, update, createRecipeFromBatch
│   ├── Charts/: provider.tsx, batchProvider.tsx
│   └── Toast.tsx
├── hooks/                # useReadings, useBatchReadings, useServerHealth, useAsyncWithToast
├── layout/               # Page wrapper, Sidebar
├── pages/                # Route pages (default exports)
├── theme/mushroomTheme.ts
├── types/charts.ts
└── utils/methods.ts      # Pure helpers
```

## Charts (Recharts)

Three chart tabs in `/readings` and `/batches/:id`:

- `TempHumTab` — temperature + humidity line chart
- `DevicesTab` — binary on/off for fan, humidifier, heater
- `ControlLoopTab` — binary on/off for control loop

Unit readings (`/readings`): shared query params from `ChartsProvider` (`useCharts()`).
Batch readings (`/batches/:id`): `BatchChartsProvider` sources data from `useBatchReadings`, provides same context shape — chart tabs work unchanged for both.

Chart data utilities in `~utils/methods`: `downsampleChartPoints`, `smartSampleChartPoints`, `rleDeduplicateOnOffPoints`.

## Build & Development

- `yarn dev` — http://localhost:5173/
- `yarn build` — `tsc -b && vite build` (may fail if generated schemas.ts has TS errors; regenerate)
- `npx vite build` — builds without typecheck
- `yarn lint` / `yarn lint:fix` — ESLint
- `yarn format` / `yarn format:check` — Prettier
- Husky pre-commit: lint-staged (eslint --fix + prettier)

## Known Quirks

- `picoUnitIdBatchesControllerGetCurrent` requires `batchId: 0` (generator bug — param not in URL, ignored)
- Vite chunk size warning (~1.35 MB) is informational
- `schemas.ts` sometimes uses bare `Array` without type param — regenerate from fixed server spec
- `schemas.ts` sometimes uses `Array<z>` instead of `Array<string>` — fixed by `Fix 1b` in `scripts/fix-array-types.mjs` (generator bug in `openapi-zod-client` v1.18.3)
- `PicoUnitCard.tsx` `friendlyDate` uses `new Date().toLocaleString()` instead of `dayjs` — pre-existing deviation from the "Use dayjs for dates" rule
- Grep tool skips `src/api/generated/` (gitignored) — always use `read` or bash `grep`/`rg` directly to discover generated method signatures

## Feature Palettes & Domain Constants

Color palettes or other domain-specific constant arrays that are tightly coupled to a feature should co-locate with the UI component that consumes them. A stateless atom can export both the component and its default dataset (e.g. `ColorSwatchPicker` + `FACE_COLORS` from the same file). If a palette is consumed by multiple unrelated features, extract it to a shared constants file under `src/utils/` or `src/theme/`.

## Environment

```
VITE_API_BASE_URL=http://localhost:3000
```

## Coding Rules

- Functional components only
- Named exports for components; default export only for pages
- No `any` — use types from `src/api/generated/`
- Use dayjs for dates, not Date directly
- Import order: @trivago/prettier-plugin-sort-imports
