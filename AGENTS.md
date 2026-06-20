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
│   └── index.ts
├── contexts/             # Context + hooks + mutations per entity
│   ├── PicoUnit/mutations/: controlLoop, delete, outputs, setPoints, update
│   ├── Recipe/mutations/: create, delete, update
│   ├── Batch/mutations/: create, delete, update, createRecipeFromBatch
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
