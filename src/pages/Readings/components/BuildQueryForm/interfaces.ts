import type { Dayjs } from 'dayjs';

import type { ReadingsApiPicoUnitIdReadingsControllerListForUnitV1Request as ListPicoUnitReadingsParams } from '~api/generated';

export type LocalParams = Partial<Omit<ListPicoUnitReadingsParams, 'start' | 'end'>> & {
  start?: Dayjs | null;
  end?: Dayjs | null;
};
