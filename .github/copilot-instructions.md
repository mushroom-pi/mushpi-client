# mushpi-client — React Dashboard Agent

React 19 + Vite web dashboard served from Raspberry Pi 3 B+. Talks only to `mushpi-server`; never directly to Pico units.

## Stack

React 19 · TypeScript ~5.9 · Vite 7 · MUI v7 · TanStack React Query v5 · axios · React Router DOM v7 · Recharts v3 · dayjs · Yarn 1

## Directory Structure

```
src/
├── api/
│   ├── client.ts           # axios instance (baseURL from VITE_API_BASE_URL)
│   ├── adapter.ts          # instantiates generated API classes with the axios client
│   ├── queryKeys.ts        # React Query key factories (recipeKeys, batchKeys included)
│   └── generated/api.ts    # AUTO-GENERATED — never edit manually
├── components/ui/
│   ├── atoms/              # Stateless presentational (Card, InfoField, OnOffInfo, etc.)
│   ├── molecules/          # Composed components (InfoCard, EditableInfoCard, PicoUnitForm, etc.)
│   └── index.ts            # Barrel export
├── contexts/
│   ├── PicoUnit/           # Context + hooks + mutations for a single unit
│   │   └── mutations/      # controlLoop, delete, outputs, setPoints, update (one file each)
│   ├── PicoUnits/          # Context + hooks for the units list
│   ├── Recipe/             # Context + hooks + mutations for a single recipe
│   │   └── mutations/      # create, delete, update (one file each)
│   ├── Recipes/            # Context + hooks for the recipes list
│   ├── Batch/              # Context + hooks + mutations for a single batch
│   │   └── mutations/      # create, delete, update, createRecipeFromBatch (one file each)
│   ├── Batches/            # Context + hooks for the batches list
│   └── Charts/             # Shared chart query state (unit, date range, limit)
│       ├── provider.tsx    # ChartsProvider for unit readings
│       └── batchProvider.tsx  # BatchChartsProvider — sources data from a specific batch
├── hooks/
│   ├── useReadings.ts      # Fetch + transform readings for charts
│   ├── useBatchReadings.ts # Fetch + transform readings for a specific batch
│   ├── useServerHealth.ts  # Server monitoring/health
│   └── useAsyncWithToast.ts
├── layout/
│   ├── Page.tsx            # Page wrapper with padding/scroll
│   └── Sidebar/            # Navigation sidebar
├── pages/
│   ├── Dashboard.tsx       # Overview of all units
│   ├── PicoUnits/          # Units list page
│   ├── PicoUnit/           # Detail page: meta, controls, setpoints, outputs, readings, devices, batches
│   │   └── components/     # PicoUnitMeta, PicoUnitControls, PicoUnitDevices, PicoUnitBatches, …
│   ├── Readings/           # Chart page: query builder + TempHum / Devices / ControlLoop charts
│   ├── Recipes/            # Recipes list page (sortable table + create dialog)
│   ├── Recipe/             # Recipe detail page (meta + batches started from this recipe)
│   ├── Batches/            # Batches list page (status filter + create dialog)
│   ├── Batch/              # Batch detail page (meta + chart tabs via BatchChartsProvider)
│   └── Server/             # Server health page
├── theme/mushroomTheme.ts  # Custom MUI theme
├── types/charts.ts
└── utils/methods.ts        # Shared pure helpers (toDateTimeLocal, downsampleChartPoints, …)
```

Path aliases (`vite.config.ts` + `tsconfig.app.json`): `~api`, `~ctx`, `~hook`, `~type`, `~comp`, `~components`, `~layout`, `~utils`.

## API Client

`src/api/generated/api.ts` is generated from `mushpi-server`'s OpenAPI spec. **Do not edit it.**

```bash
yarn gen:client:remote   # regenerate from running server (port 3000, DOCS_ENDPOINT set)
yarn gen:client          # regenerate from local openapi.json
```

Always regenerate after any `mushpi-server` endpoint change.

## State Management

- Use **React Query** for all server state — no `useEffect` + `useState` for fetched data.
- Query keys live in `src/api/queryKeys.ts` (`picoUnitKeys`, `recipeKeys`, `batchKeys`).
- Consume context hooks (`usePicoUnit()`, `usePicoUnits()`, `useRecipe()`, `useRecipes()`, `useBatch()`, `useBatches()`, `useCharts()`) — avoid prop-drilling.
- Mutations live in the entity's `mutations/` folder (one file per concern).

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

## Component Conventions

- **Atoms**: stateless, props only.
- **Molecules**: may connect to context/hooks.
- Use **MUI components** over raw HTML; use `sx` prop for one-off styles.
- Use `PicoUnitForm` for dialogs **only within PicoUnit pages** — it is coupled to `usePicoUnitContext()`. All other pages (Recipes, Batches) use MUI `Dialog` directly.
- Use `OnOffInfo` / `OnOffInput` for boolean device states.
- Use `EditableInfoCard` for display + inline edit. The `headerActions` prop renders extra icon buttons (e.g., delete) to the left of the edit button in the card header.
- `mushroomTheme.ts` for global theme overrides.

## Complex Component Folders

When a component grows beyond a simple render — especially dialogs and forms with significant state, effects, handlers, or mutations — convert it from a single `.tsx` file into a **folder** of the same name. The folder structure is:

```
ComponentName/
├── index.tsx         # Pure JSX only — no logic, no state. Destructures from the hook and renders.
├── useComponentForm.ts  # Custom hook: all useState, useEffect, useMemo, useMutation, handlers.
├── interfaces.ts     # TypeScript interfaces/types specific to this component.
└── methods.ts        # Pure helper functions specific to this component (not generic enough for ~utils/methods).
```

**Rules:**
- `index.tsx` is declarative only — it calls the hook, destructures everything it needs, and returns JSX.
- `useXxxForm.ts` owns the entire "brain": field state, derived state (`useMemo`), effects, event handlers, the mutation, and the submit function. It returns a flat object grouped by category (field state / setters / data / validation / handlers / mutation).
- `interfaces.ts` holds the props interface and any other types used across files in the folder.
- `methods.ts` holds pure, component-scoped helpers (e.g., date formatting specific to this form). Functions that are reused across multiple components belong in `~utils/methods` instead.
- The folder resolves transparently to consumers — `import { X } from './components/ComponentName'` continues to work unchanged.

**Example** — `CreateBatchDialog/`:
- `index.tsx`: renders the MUI `<Dialog>` and its fields; no `useState` or logic.
- `useCreateBatchForm.ts`: all state, active-batch conflict detection, auto-adjust effects, recipe-change handler, mutation.
- `interfaces.ts`: `CreateBatchDialogProps`.
- `methods.ts`: `computeFinishAt`, `nowDateTimeLocal`.

## Charts

Three Recharts tabs in `/readings` and `/batches/:id`:

- `TempHumTab` — temperature + humidity line chart.
- `DevicesTab` — binary on/off for fan, humidifier, heater.
- `ControlLoopTab` — binary on/off for control loop.

For unit readings (`/readings`), shared query params come from `ChartsProvider` (`useCharts()`).
For batch readings (`/batches/:id`), `BatchChartsProvider` sources data from `useBatchReadings` and provides the same `ChartsContextValue` shape — the chart tabs work unchanged for both contexts.

## Recipes

The Recipes section (`/recipes`, `/recipes/:id`) manages reusable grow condition templates.

- **List page** (`src/pages/Recipes/`): sortable table (name, species, temperature, duration, created date), default sort alphabetically by name, create-recipe dialog.
- **Detail page** (`src/pages/Recipe/`): `RecipeMeta` card (view + inline edit + delete via `headerActions`), `RecipeBatches` table listing all batches that used this recipe.
- **Context**: `RecipeProvider` / `useRecipeContext()` from `~ctx/Recipe`; list hooks from `~ctx/Recipes`.
- **Validation pattern**: blur-based field validation with `touched` state; hint text in `helperText` when no error (e.g., "0–50 °C"); on submit all fields are force-touched.

## Batches

The Batches section (`/batches`, `/batches/:id`) represents fixed-period growing runs tied to a Pico unit.

- **List page** (`src/pages/Batches/`): table with status filter (in-progress / finished / all), create-batch dialog.
- **Detail page** (`src/pages/Batch/`): `BatchMeta` card (view + edit + delete; "Save as Recipe" shown only when batch is finished), chart tabs (`TempHumTab`, `DevicesTab`, `ControlLoopTab`) driven by `BatchChartsProvider`.
- **Unit detail page** (`/pico-units/:id`): `PicoUnitBatches` section shows the unit's batches with the current in-progress batch highlighted; "New Batch" button inline.
- **Context**: `BatchProvider` / `useBatchContext()` from `~ctx/Batch`; list hooks from `~ctx/Batches`.
- **`finish_at` semantics**: `null` → in-progress; set → finished. "Save as Recipe" only shown when finished.
- **Known quirk**: `picoUnitIdBatchesControllerGetCurrent` requires a `batchId` param (generator bug — not in the URL). Pass `batchId: 0`; it is ignored.

## Environment

```bash
VITE_API_BASE_URL=http://localhost:3000   # mushpi-server URL
```

## Build & Development

- **Build Status**: ✅ `yarn build` works properly — builds to `dist/` with Vite
- **Dev Server**: ✅ `yarn dev` works properly — runs on `http://localhost:5173/`
- **Permissions**: Agent has full permission to execute `yarn build` and `yarn dev` scripts
- **Build Config**: Fixed TypeScript config issues (removed `erasableSyntaxOnly` & invalid `ignoreDeprecations`)
- **Known**: Vite chunk size warning (~1.35 MB) is informational; can be addressed with code splitting if needed

## Coding Rules

- Functional components only; no class components.
- Named exports for components; default export only for pages.
- No `any` — use types from `src/api/generated/`.
- Use **dayjs** for dates, not `Date` directly.
- ESLint + Prettier enforced via Husky pre-commit hook.
- Import order managed by `@trivago/prettier-plugin-sort-imports`.

## Readings Page

The Readings page (`/readings`) provides a comprehensive interface for querying and visualizing sensor data from Pico units. It serves as the main charting dashboard, allowing users to explore temperature, humidity, device states, and control loop data over time.

### Overview

- **Purpose**: Query and display historical readings data in interactive charts.
- **Key Features**: Query builder form, tabbed chart views, CSV export, responsive design for mobile devices.
- **Data Source**: Fetches data from `mushpi-server` via React Query, using the `useReadings` hook.
- **Shared State**: Uses `Charts` context for query parameters (unit, date range, limit) across all charts.

### Components Structure

Located in `src/pages/Readings/`:

- `index.tsx`: Main page component, wraps content in `ChartsProvider` and `Page` layout.
- `components/`
  - `BuildQueryForm/`: Form for setting query parameters.
    - `index.tsx`: Main form with unit select, time window, limit, and export button.
    - `TimeWindowSelect.tsx`: Floating selector for date range with centered popup and title.
    - `PicoUnitSelect.tsx`, `LimitSelect.tsx`: Dropdown components for unit and data limit.
  - `ChartsTabs/`: Tabbed interface for chart views.
    - `ChartsTabs.tsx`: Manages tab state and renders panels.
    - `TempHumTab.tsx`: Temperature and humidity line chart.
    - `DevicesTab.tsx`: Binary on/off chart for devices (fan, humidifier, heater).
    - `ControlLoopTab.tsx`: Binary chart for control loop state.

### Query Form

The `BuildQueryForm` allows users to configure data queries:

- **Unit Selection**: Dropdown to choose which Pico unit to query.
- **Time Window**: `TimeWindowSelect` provides preset ranges (e.g., last hour, day) and custom date picker.
- **Data Limit**: Controls the number of data points fetched.
- **CSV Export**: Downloads query results as CSV file.
- **Responsiveness**: Form adapts to mobile screens with adjusted layouts.

### Charts

Three chart types using Recharts:

- **TempHum Chart**: Dual-axis line chart showing temperature (°C) and humidity (%) over time.
- **Devices Chart**: Step chart displaying binary states for fan, humidifier, and heater.
- **Control Loop Chart**: Binary chart for control loop on/off state.

All charts:

- Use `ResponsiveContainer` for adaptive sizing.
- Share query parameters from `Charts` context.
- Include subtitles and responsive elements (e.g., smaller icons on mobile).
- Wrapped in `GraphTab` molecule for consistent styling.

### State Management

- **Charts Context**: Provides `useCharts()` hook for shared query state.
- **React Query**: Handles data fetching, caching, and loading states.
- **Local State**: Form components manage their own state for immediate UI feedback.

### Responsiveness

- **Mobile Optimizations**: Charts adjust height, icon sizes, and column layouts using MUI `useMediaQuery`.
- **Breakpoints**: Uses MUI theme breakpoints for consistent responsive behavior.
- **Touch-Friendly**: Larger touch targets and simplified layouts on small screens.

### Key UI Components

- `PageTitle`: Reusable title component with optional actions.
- `GraphTab`: Molecule for chart panel styling with subtitle support.
- `TimeWindowSelect`: Custom floating selector with improved UX (centered, titled, no extra spacing).
