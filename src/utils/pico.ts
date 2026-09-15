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

/** Placeholder shown when a unit has not reported its firmware/API contract version */
export const FIRMWARE_UNKNOWN = 'unknown';

/** Minimal structural shape of the version fields (nullable until a unit announces with post-#21 firmware) */
export interface FirmwareReportFields {
  firmware_version?: string | null;
  api_version?: number | null;
}

export interface FirmwareStatus {
  /** Reported firmware version string, or `FIRMWARE_UNKNOWN` */
  firmware: string;
  /** Reported Pico↔Server API-contract generation (bare integer as string), or `FIRMWARE_UNKNOWN` */
  apiGeneration: string;
  /** True only when BOTH values were reported */
  known: boolean;
}

/**
 * Normalize a unit's self-reported firmware version and Pico↔Server API-contract
 * generation for display. `null`/`undefined`/blank → `'unknown'` — the expected
 * state for legacy units that have not announced since the server migration,
 * not an error. Deliberately no "stale/incompatible" judgment (server-side
 * range-check feature territory).
 */
export function firmwareStatus(pico: FirmwareReportFields | null | undefined): FirmwareStatus {
  const firmware = pico?.firmware_version?.trim() || FIRMWARE_UNKNOWN;
  const apiGeneration = pico?.api_version != null ? String(pico.api_version) : FIRMWARE_UNKNOWN;
  return {
    firmware,
    apiGeneration,
    known: firmware !== FIRMWARE_UNKNOWN && apiGeneration !== FIRMWARE_UNKNOWN,
  };
}

/** One compact fleet-scan caption line, e.g. "Firmware 0.8.4 · API gen 1" */
export function firmwareCaption(status: FirmwareStatus): string {
  return `Firmware ${status.firmware} · API gen ${status.apiGeneration}`;
}
