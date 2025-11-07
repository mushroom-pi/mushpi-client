import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { unwrap } from '~api/adapter';
import { Readings } from '~api/client';
import type {
  ReadingsApiPicoUnitIdReadingsControllerExportCsvForUnitRequest as ExportPicoUnitReadingsParams,
  ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams,
  ReadingsListResponseDto,
} from '~api/generated';

export const useListPicoUnitReadings = (
  { start, end, page = 1, limit = 500, picoUnitId }: Partial<ListPicoUnitReadingsParams>,
  enabled: boolean = true,
) => {
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
    enabled: picoUnitId != null && enabled, // This makes sure that the query is called ONLY if there is a picoUnitId
  });
};

// This query is a bit different, since the endpoint returns a file for download
export const useExportPicoUnitReadings = (
  { start, end, picoUnitId }: Partial<ExportPicoUnitReadingsParams>,
  enabled: boolean = false,
) => {
  const queryKey = useMemo(
    () => ['exportPicoReadings', picoUnitId, start, end],
    [picoUnitId, start, end],
  );

  return useQuery<Blob, unknown>({
    queryKey,
    queryFn: async () => {
      const params: Record<string, any> = { picoUnitId };
      if (start) params.start = typeof start === 'string' ? start : new Date(start).toISOString();
      if (end) params.end = typeof end === 'string' ? end : new Date(end).toISOString();

      const resp = await unwrap(
        Readings.picoUnitIdReadingsControllerExportCsvForUnit(
          params as ExportPicoUnitReadingsParams,
          { responseType: 'blob' },
        ),
      );

      // Normalize into a Blob no matter how the client returns it:
      if (resp instanceof Blob) return resp;

      // axios sometimes returns an object like { data: Blob }
      if (resp && typeof resp === 'object' && 'data' in (resp as any)) {
        const data = (resp as any).data;
        if (data instanceof Blob) return data;
        return new Blob([data], { type: 'text/csv' });
      }

      // fallback: if it's ArrayBuffer / string etc.
      return new Blob([resp as any], { type: 'text/csv' });
    },
    enabled: picoUnitId != null && !!start && !!end && enabled,
  });
};
