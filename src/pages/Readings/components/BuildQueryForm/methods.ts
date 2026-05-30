import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams } from '~api/generated';

import type { LocalParams } from './interfaces';

dayjs.extend(utc);

export const dayjsToBackendIso = (d?: Dayjs | null): string | undefined =>
  d ? dayjs(d).utc().format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;

export const resolveBoundaryParam = (
  value: Dayjs | null | undefined,
  previous?: string,
): string | undefined => {
  if (value === null) return undefined;
  if (value === undefined) return previous;
  return dayjsToBackendIso(value);
};

export const buildInitialLocalParams = (params?: ListPicoUnitReadingsParams): LocalParams => ({
  ...(params ?? {}),
  start: params?.start ? dayjs(params.start) : undefined,
  end: params?.end ? dayjs(params.end) : undefined,
});
