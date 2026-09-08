import { API_BASE } from '~utils/apiUrl';

import {
  BatchesApi,
  Configuration,
  ControlApi,
  DashboardApi,
  ImagesApi,
  MonitoringApi,
  PicoUnitsApi,
  ReadingsApi,
  RecipesApi,
  SettingsApi,
} from './generated';

// Build a configuration object for runtime values. API_BASE is normalized
// (trailing slashes stripped) — the generated client naive-concatenates
// basePath + url, so it must never receive a trailing-slash base.
const configuration = new Configuration({
  basePath: API_BASE,
  accessToken:
    typeof localStorage !== 'undefined' ? (localStorage.getItem('token') ?? undefined) : undefined,
});

// instantiate APIs you need. Generator often creates several Api classes; DefaultApi is common.
export const PicoUnits = new PicoUnitsApi(configuration);
export const Readings = new ReadingsApi(configuration);
export const Batches = new BatchesApi(configuration);
export const Control = new ControlApi(configuration);
export const Dashboard = new DashboardApi(configuration);
export const Monitoring = new MonitoringApi(configuration);
export const Recipes = new RecipesApi(configuration);
export const Images = new ImagesApi(configuration);
export const Settings = new SettingsApi(configuration);

// optional helper to set token at runtime (if generator uses axios instance internally)
export function setAuthToken(token: string | null) {
  // Use the generated client's access token support if possible.
  // This keeps authorization scoped to the API configuration instead of relying on a global axios default.
  configuration.accessToken = token ?? undefined;
}
