import type { Dayjs } from 'dayjs';

import type { RangePreset } from '~utils/timeWindow';

export type LocalParams = {
  picoUnitId?: number;
  points?: number;
  start?: Dayjs | null;
  end?: Dayjs | null;
  preset?: RangePreset | 'recent' | 'custom';
};
