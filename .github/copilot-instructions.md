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

## Coding Rules

- Functional components only; no class components.
- Named exports for components; default export only for pages.
- No `any` — use types from `src/api/generated/`.
- Use **dayjs** for dates, not `Date` directly.
- ESLint + Prettier enforced via Husky pre-commit hook.
- Import order managed by `@trivago/prettier-plugin-sort-imports`.
