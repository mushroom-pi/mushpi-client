import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { unwrap } from '~api/adapter';
import { Readings } from '~api/client';
import type {
  AggregatedReadingsResponseDto,
  ReadingsApiPicoUnitIdReadingsControllerExportCsvForUnitV1Request as ExportPicoUnitReadingsParams,
  ReadingsApiPicoUnitIdReadingsControllerListForUnitV1Request as ListPicoUnitReadingsParams,
} from '~api/generated';
import { readingsKeys } from '~api/queryKeys';
import { resolveTimeBounds, type TimeWindow } from '~utils/timeWindow';

export const useListPicoUnitReadings = (
  { picoUnitId, timeWindow, points = 200 }: {
    picoUnitId?: number;
    timeWindow: TimeWindow;
    points?: number;
  },
  enabled: boolean = true,
) => {
  const queryKey = readingsKeys.list(picoUnitId ?? 0, timeWindow, points);

  return useQuery<AggregatedReadingsResponseDto, unknown, AggregatedReadingsResponseDto>({
    queryKey,
    queryFn: async () => {
      const { start, end } = resolveTimeBounds(timeWindow);
      const params: Record<string, any> = { picoUnitId, points };
      if (start) params.start = start;
      if (end) params.end = end;

      const resp = await unwrap(
        Readings.picoUnitIdReadingsControllerListForUnitV1(params as ListPicoUnitReadingsParams),
      );
      return resp as unknown as AggregatedReadingsResponseDto;
    },
    enabled: picoUnitId != null && enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
};

/**
 * Helper to download readings as CSV.
 * Returns a command function that fetches the blob when invoked.
 * This is intentionally NOT a query hook because:
 * - Downloads are imperative actions, not declarative data needs
 * - We don't want auto-refetch on mount/focus
 * - Clearer API for download button clicks
 *
 * Usage:
 *   const exportCsv = useExportPicoUnitReadingsCmd();
 *   const blob = await exportCsv({ picoUnitId: 1, timeWindow: { kind: 'preset', preset: '1h' } });
 */
export const useExportPicoUnitReadingsCmd = () => {
  return useCallback(
    async (params: { picoUnitId: number; timeWindow: TimeWindow }): Promise<Blob> => {
      const { timeWindow, picoUnitId } = params;
      if (!picoUnitId) throw new Error('picoUnitId is required');

      const { start, end } = resolveTimeBounds(timeWindow);
      const apiParams: Record<string, any> = { picoUnitId };
      if (start) apiParams.start = start;
      if (end) apiParams.end = end;

      const resp = await unwrap(
        Readings.picoUnitIdReadingsControllerExportCsvForUnitV1(
          apiParams as ExportPicoUnitReadingsParams,
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
    [],
  );
};
