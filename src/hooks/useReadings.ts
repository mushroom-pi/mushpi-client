import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { unwrap } from '~api/adapter';
import { Readings } from '~api/client';
import type {
  ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams,
  ReadingsListResponseDto,
} from '~api/generated';

export const useListPicoUnitReadings = ({
  start,
  end,
  page = 1,
  limit = 500,
  picoUnitId,
}: Partial<ListPicoUnitReadingsParams>) => {
  if (!picoUnitId) return;
  const queryKey = useMemo(
    () => ['picoReadings', picoUnitId, start || 'none', end || 'none', page, limit],
    [picoUnitId, start, end, page, limit],
  );

  return useQuery<ReadingsListResponseDto, unknown, ReadingsListResponseDto>({
    queryKey,
    queryFn: async () => {
      const params: Record<string, any> = { picoUnitId, page, limit };
      if (start) params.start = typeof start === 'string' ? start : new Date(start).toISOString();
      if (end) params.end = typeof end === 'string' ? end : new Date(end).toISOString();

      const resp = await unwrap(
        Readings.picoUnitIdReadingsControllerListForUnit(params as ListPicoUnitReadingsParams),
      );
      return resp as unknown as ReadingsListResponseDto;
    },
    enabled: picoUnitId != null,
  });
};
