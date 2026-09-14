import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { ChartsReadingsParams } from '~ctx/Charts';
import { type RangePreset, type TimeWindow, dayjsFromTimeWindow } from '~utils/timeWindow';

import type { LocalParams } from './interfaces';

dayjs.extend(utc);

export const dayjsToBackendIso = (d?: Dayjs | null): string | undefined =>
  d ? dayjs(d).utc().format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;

/** Build a TimeWindow from local UI draft values */
export const buildTimeWindowFromLocal = (
  preset: RangePreset | 'recent' | 'custom' | undefined,
  start: Dayjs | null,
  end: Dayjs | null,
): TimeWindow => {
  if (preset === 'recent' || (preset === undefined && !start && !end)) return { kind: 'none' };
  if (preset && preset !== 'custom') return { kind: 'preset', preset };
  return {
    kind: 'custom',
    ...(start ? { start: dayjs.utc(start).format('YYYY-MM-DDTHH:mm:ss[Z]') } : {}),
    ...(end ? { end: dayjs.utc(end).format('YYYY-MM-DDTHH:mm:ss[Z]') } : {}),
  };
};

/** Build initial LocalParams from applied ChartsReadingsParams */
export const buildInitialLocalParams = (params?: ChartsReadingsParams): LocalParams => {
  if (!params) return {};
  const { start, end, preset } = dayjsFromTimeWindow(params.timeWindow);
  return {
    picoUnitId: params.picoUnitId,
    points: params.points,
    start,
    end,
    preset,
  };
};
