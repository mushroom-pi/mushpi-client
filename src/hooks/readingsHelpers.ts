import { bytesToMB } from 'src/utils/methods';

import type { Readings } from '~api/generated';

export const fmtTsShort = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  // e.g. 22 Oct 15:23
  return d.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toChartPoints = (items: Readings[]) =>
  items.map((it) => ({
    ts: it.ts,
    label: fmtTsShort(it.ts),
    temperature: it.temperature,
    humidity: it.humidity,
    temperature_target: it.temperature_set,
    humidity_target: it.humidity_set,
    board_used_mem: bytesToMB(it.board_used_mem),
    fanOn: it.fan_on ? 1 : 0,
    humidifierOn: it.humidifier_on ? 1 : 0,
    heaterOn: it.heater_on ? 1 : 0,
    controlLoopOn: it.control_loop_enabled ? 1 : 0,
  }));
