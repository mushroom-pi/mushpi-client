import { led } from '~theme/tokens';

/** Temperature must be within ±2°C of target before a deviation warning fires */
export const TEMP_DEVIATION_THRESHOLD = 2;
/** Humidity must be within ±10% of target before a deviation warning fires */
export const HUMIDITY_DEVIATION_THRESHOLD = 10;

export const PROVISION_AP_PREFIX = 'mushpi-provision-';
export const PROVISION_AP_URL = 'http://192.168.4.1:5000';
export const POLL_INTERVAL_MS = 3000;
export const POLL_STALE_MS = 15 * 60 * 1000;

export function deriveApSsidFromMac(mac?: string | null): string | null {
  if (!mac) return null;
  const hex = mac.replace(/[^0-9a-fA-F]/g, '');
  if (hex.length < 4) return null;
  return `${PROVISION_AP_PREFIX}${hex.slice(-4).toUpperCase()}`;
}

export function apSsidOrFallback(mac?: string | null): { ssid: string; exact: boolean } {
  const derived = deriveApSsidFromMac(mac);
  return derived
    ? { ssid: derived, exact: true }
    : { ssid: `${PROVISION_AP_PREFIX}XXXX`, exact: false };
}

export function diffNewUnitIds(baseline: number[], current: number[]): number[] {
  const set = new Set(baseline);
  return current.filter((id) => !set.has(id));
}

export const POLL_FINISH_INTERVAL_MS = 5000;
export const POLL_FINISH_MAX_ATTEMPTS = 5;

export const LED_STATES = [
  {
    id: 'off',
    color: led.off,
    label: 'LED OFF',
    meaning: 'No power, or still booting (wait a moment)',
  },
  {
    id: 'config_error',
    color: led.error,
    label: '3 fast blinks + pause',
    meaning: 'config.json is malformed or has invalid values — check serial output',
  },
  {
    id: 'provisioning',
    color: led.provisioning,
    label: 'Slow double-blink',
    meaning: 'Provisioning mode — correct! Waiting for credentials',
  },
  {
    id: 'solid',
    color: led.solid,
    label: 'Solid ON',
    meaning: 'Connected to Wi‑Fi, waiting to reach the hub',
  },
  {
    id: 'heartbeat',
    color: led.heartbeat,
    label: 'Heartbeat blink',
    meaning: 'Fully connected to the hub — operational',
  },
] as const;

export const chipColorForFailedCalls = (failedCalls: number | null) => {
  if (!failedCalls) return 'success';
  if (failedCalls < 3) return 'warning';
  return 'error';
};

export const FAILS_READINGS_UNHEALTHY = 5;

/** Color for the failed_readings chip: 0=success(green), 1-4=warning(yellow), 5+=error(red) */
export const chipColorForFailedReadings = (failedReadings: number | null | undefined) => {
  const n = failedReadings ?? 0;
  if (n === 0) return 'success' as const;
  if (n < FAILS_READINGS_UNHEALTHY) return 'warning' as const;
  return 'error' as const;
};
