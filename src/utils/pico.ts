export const OFFLINE_THRESHOLD = 3;
export const PROVISION_AP_PREFIX = 'mushpi-provision-';
export const PROVISION_AP_URL = 'http://192.168.4.1:5000';
export const POLL_INTERVAL_MS = 3000;
export const POLL_STALE_MS = 15 * 60 * 1000;

export function isUnitOffline(pico: { failed_calls?: number }): boolean {
  return (pico.failed_calls ?? 0) >= OFFLINE_THRESHOLD;
}

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
  { id: 'off', color: '#4a5568', label: 'LED OFF', meaning: 'No power, or still booting (wait a moment)' },
  { id: 'config_error', color: '#C53030', label: '3 fast blinks + pause', meaning: 'config.json is malformed or has invalid values — check serial output' },
  { id: 'provisioning', color: '#C66F2F', label: 'Slow double-blink', meaning: 'Provisioning mode — correct! Waiting for credentials' },
  { id: 'solid', color: '#A27B35', label: 'Solid ON', meaning: 'Connected to Wi‑Fi, waiting to reach the hub' },
  { id: 'heartbeat', color: '#3C8D5A', label: 'Heartbeat blink', meaning: 'Fully connected to the hub — operational' },
] as const;

export const chipColorForFailedCalls = (failedCalls: number | null) => {
  if (!failedCalls) return 'success';
  if (failedCalls < 3) return 'warning';
  return 'error';
};
