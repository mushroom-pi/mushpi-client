import {
  BatchesApi,
  Configuration,
  ControlApi,
  MonitoringApi,
  PicoUnitsApi,
  ReadingsApi,
} from './generated';

// Build a configuration object for runtime values
const apiBase =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof process !== 'undefined'
    ? (process.env.REACT_APP_API_BASE_URL as string | undefined)
    : undefined) ??
  'http://localhost:3000';

const configuration = new Configuration({
  basePath: apiBase,
  accessToken:
    typeof localStorage !== 'undefined' ? (localStorage.getItem('token') ?? undefined) : undefined,
});

// instantiate APIs you need. Generator often creates several Api classes; DefaultApi is common.
export const PicoUnits = new PicoUnitsApi(configuration);
export const Readings = new ReadingsApi(configuration);
export const Batches = new BatchesApi(configuration);
export const Control = new ControlApi(configuration);
export const Monitoring = new MonitoringApi(configuration);

// optional helper to set token at runtime (if generator uses axios instance internally)
export function setAuthToken(token: string | null) {
  // Use the generated client's access token support if possible.
  // This keeps authorization scoped to the API configuration instead of relying on a global axios default.
  configuration.accessToken = token ?? undefined;
}
