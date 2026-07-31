export const DEFAULT_PINS = { dht: 4, humidifier: 6, fan: 7, heater: 8 } as const;
export const PIN_RANGE = { min: 0, max: 28 } as const;
export const PICO_PINOUT_DOC_URL =
  'https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html';

export function formatGp(n: number | null | undefined): string {
  return n == null ? '—' : `GP${n}`;
}
