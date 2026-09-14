import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export type RangePreset = '1h' | '6h' | '24h' | '7d';

export type TimeWindow =
  | { kind: 'none' }
  | { kind: 'preset'; preset: RangePreset }
  | { kind: 'custom'; start?: string; end?: string };

export const PRESET_DURATIONS: Record<RangePreset, { unit: dayjs.ManipulateType; amount: number }> =
  {
    '1h': { unit: 'hour', amount: 1 },
    '6h': { unit: 'hour', amount: 6 },
    '24h': { unit: 'hour', amount: 24 },
    '7d': { unit: 'day', amount: 7 },
  };

/** Resolve a TimeWindow to API query bounds AT CALL TIME (presets stay dynamic on refetch) */
export const resolveTimeBounds = (tw: TimeWindow): { start?: string; end?: string } => {
  if (tw.kind === 'none') return {};
  if (tw.kind === 'custom') {
    return {
      ...(tw.start ? { start: tw.start } : {}),
      ...(tw.end ? { end: tw.end } : {}),
    };
  }
  const { unit, amount } = PRESET_DURATIONS[tw.preset];
  const now = dayjs().utc();
  return {
    start: now.subtract(amount, unit).format('YYYY-MM-DDTHH:mm:ss[Z]'),
    end: now.format('YYYY-MM-DDTHH:mm:ss[Z]'),
  };
};

/** Reverse map: TimeWindow → local UI draft values */
export const dayjsFromTimeWindow = (
  tw: TimeWindow,
): {
  start: dayjs.Dayjs | null;
  end: dayjs.Dayjs | null;
  preset: RangePreset | 'recent' | 'custom';
} => {
  if (tw.kind === 'none') return { start: null, end: null, preset: 'recent' };
  if (tw.kind === 'preset') return { start: null, end: null, preset: tw.preset };
  return {
    start: tw.start ? dayjs(tw.start) : null,
    end: tw.end ? dayjs(tw.end) : null,
    preset: 'custom',
  };
};
