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
  (process.env.REACT_APP_API_BASE_URL as string) ??
  'http://localhost:3000';

const configuration = new Configuration({
  basePath: apiBase,
  // note: some generators support an accessToken function here:
  // accessToken: () => localStorage.getItem('token') ?? undefined
});

// instantiate APIs you need. Generator often creates several Api classes; DefaultApi is common.
export const PicoUnits = new PicoUnitsApi(configuration);
export const Readings = new ReadingsApi(configuration);
export const Batches = new BatchesApi(configuration);
export const Control = new ControlApi(configuration);
export const Monitoring = new MonitoringApi(configuration);

// optional helper to set token at runtime (if generator uses axios instance internally)
export function setAuthToken(token: string | null) {
  // If generator exposes an axios instance, prefer to set interceptors there.
  // Otherwise set global axios Authorization header:
  if (token) {
    const axios = require('axios');
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    const axios = require('axios');
    delete axios.defaults.headers.common.Authorization;
  }
}
