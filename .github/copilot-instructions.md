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
│   ├── queryKeys.ts        # React Query key factories
│   └── generated/api.ts    # AUTO-GENERATED — never edit manually
├── components/ui/
│   ├── atoms/              # Stateless presentational (Card, InfoField, OnOffInfo, etc.)
│   ├── molecules/          # Composed components (InfoCard, EditableInfoCard, ModalDialog, etc.)
│   └── index.ts            # Barrel export
├── contexts/
│   ├── PicoUnit/           # Context + hooks + mutations for a single unit
│   │   └── mutations/      # controlLoop, delete, outputs, setPoints, update (one file each)
│   ├── PicoUnits/          # Context + hooks for the units list
│   └── Charts/             # Shared chart query state (unit, date range, limit)
├── hooks/
│   ├── useReadings.ts      # Fetch + transform readings for charts
│   ├── useServerHealth.ts  # Server monitoring/health
│   └── useAsyncWithToast.ts
├── layout/
│   ├── Page.tsx            # Page wrapper with padding/scroll
│   └── Sidebar/            # Navigation sidebar
├── pages/
│   ├── Dashboard.tsx       # Overview of all units
│   ├── PicoUnits/          # Units list page
│   ├── PicoUnit/           # Detail page: meta, controls, setpoints, outputs, readings, devices
│   │   └── components/     # PicoUnitMeta, PicoUnitControls, PicoUnitDevices, PicoUnitOverview, …
│   ├── Readings/           # Chart page: query builder + TempHum / Devices / ControlLoop charts
│   └── Server/             # Server health page
├── theme/mushroomTheme.ts  # Custom MUI theme
├── types/charts.ts
└── utils/methods.ts
```

## API Client

`src/api/generated/api.ts` is generated from `mushpi-server`'s OpenAPI spec. **Do not edit it.**

```bash
yarn gen:client:remote   # regenerate from running server (port 3000, DOCS_ENDPOINT set)
yarn gen:client          # regenerate from local openapi.json
```

Always regenerate after any `mushpi-server` endpoint change.

## State Management

- Use **React Query** for all server state — no `useEffect` + `useState` for fetched data.
- Query keys live in `src/api/queryKeys.ts`.
- Consume context hooks (`usePicoUnit()`, `usePicoUnits()`, `useCharts()`) — avoid prop-drilling.
- Mutations live in `src/contexts/PicoUnit/mutations/` (one file per concern).

## Routing

| Path              | Page          |
| ----------------- | ------------- |
| `/`               | Dashboard     |
| `/pico-units`     | Units list    |
| `/pico-units/:id` | Unit detail   |
| `/readings`       | Charts        |
| `/server`         | Server health |

## Component Conventions

- **Atoms**: stateless, props only.
- **Molecules**: may connect to context/hooks.
- Use **MUI components** over raw HTML; use `sx` prop for one-off styles.
- Use `ModalDialog` for all confirmation/edit dialogs.
- Use `OnOffInfo` / `OnOffInput` for boolean device states.
- Use `EditableInfoCard` for display + inline edit.
- `mushroomTheme.ts` for global theme overrides.

## Charts

Three Recharts cards in `/readings`:

- `TempHumCard` — temperature + humidity line chart.
- `DevicesCard` — binary on/off for fan, humidifier, heater.
- `ControlLoopCard` — binary on/off for control loop.

Shared query params (unit, date range, limit) come from `Charts` context.

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
