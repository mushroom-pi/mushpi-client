import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { unwrap } from '~api/adapter';
import { Readings } from '~api/client';
import type {
  ReadingsApiPicoUnitIdReadingsControllerExportCsvForUnitRequest as ExportPicoUnitReadingsParams,
  ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams,
  ReadingsListResponseDto,
} from '~api/generated';
import { readingsKeys } from '~api/queryKeys';

export const useListPicoUnitReadings = (
  { start, end, page = 1, limit = 500, picoUnitId }: Partial<ListPicoUnitReadingsParams>,
  enabled: boolean = true,
) => {
  const queryKey = readingsKeys.list(picoUnitId ?? 0, start, end, page, limit);

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
 *   const blob = await exportCsv({ picoUnitId: 1, start, end });
 */
export const useExportPicoUnitReadingsCmd = () => {
  return useCallback(async (params: Partial<ExportPicoUnitReadingsParams>): Promise<Blob> => {
    const { start, end, picoUnitId } = params;
    if (!picoUnitId) throw new Error('picoUnitId is required');

    const apiParams: Record<string, any> = { picoUnitId };
    if (start) apiParams.start = typeof start === 'string' ? start : new Date(start).toISOString();
    if (end) apiParams.end = typeof end === 'string' ? end : new Date(end).toISOString();

    const resp = await unwrap(
      Readings.picoUnitIdReadingsControllerExportCsvForUnit(
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
  }, []);
};

/**
 * @deprecated Use useExportPicoUnitReadingsCmd instead.
 * Kept for backwards compatibility but will be removed in next major version.
 * This was previously a useQuery but downloads should be imperative actions.
 */
export const useExportPicoUnitReadings = (
  { start, end, picoUnitId }: Partial<ExportPicoUnitReadingsParams>,
  enabled: boolean = false,
) => {
  const exportCmd = useExportPicoUnitReadingsCmd();

  // Return a query-like object with refetch capability for backwards compatibility
  return {
    isFetching: false,
    isLoading: false,
    refetch: async () => {
      try {
        const data = await exportCmd({ picoUnitId, start, end });
        return { data, error: null };
      } catch (error) {
        return { data: undefined, error };
      }
    },
  };
};
