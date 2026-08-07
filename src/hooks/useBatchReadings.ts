import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { unwrap } from '~api/adapter';
import { Readings } from '~api/client';
import type {
  AggregatedReadingsResponseDto,
  ReadingsApiBatchIdReadingsControllerExportCsvForUnitV1Request as ExportBatchReadingsParams,
  ReadingsApiBatchIdReadingsControllerListForBatchV1Request as ListBatchReadingsParams,
} from '~api/generated';
import { batchKeys } from '~api/queryKeys';

export const useListBatchReadings = (
  { batchId, start, end, points = 200 }: Partial<ListBatchReadingsParams>,
  enabled: boolean = true,
) => {
  const queryKey = batchKeys.readings(batchId ?? 0, start, end, points);

  return useQuery<AggregatedReadingsResponseDto, unknown, AggregatedReadingsResponseDto>({
    queryKey,
    queryFn: async () => {
      const apiParams: ListBatchReadingsParams = {
        batchId: batchId!,
        points,
        ...(start
          ? { start: typeof start === 'string' ? start : new Date(start).toISOString() }
          : {}),
        ...(end ? { end: typeof end === 'string' ? end : new Date(end).toISOString() } : {}),
      };

      const resp = await unwrap<AggregatedReadingsResponseDto>(
        Readings.batchIdReadingsControllerListForBatchV1(apiParams),
      );
      return resp;
    },
    enabled: batchId != null && enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
};

/**
 * Imperative command to export batch readings as CSV.
 * Usage:
 *   const exportCsv = useExportBatchReadingsCmd();
 *   const blob = await exportCsv({ batchId: 1, start, end });
 */
export const useExportBatchReadingsCmd = () => {
  return useCallback(async (params: Partial<ExportBatchReadingsParams>): Promise<Blob> => {
    const { batchId, start, end } = params;
    if (!batchId) throw new Error('batchId is required');

    const apiParams: ExportBatchReadingsParams = {
      batchId,
      ...(start
        ? { start: typeof start === 'string' ? start : new Date(start).toISOString() }
        : {}),
      ...(end ? { end: typeof end === 'string' ? end : new Date(end).toISOString() } : {}),
    };

    const resp = (await unwrap(
      Readings.batchIdReadingsControllerExportCsvForUnitV1(apiParams, { responseType: 'blob' }),
    )) as unknown;

    if (resp instanceof Blob) return resp;
    if (resp instanceof File) return resp;

    if (resp && typeof resp === 'object' && 'data' in (resp as object)) {
      const data = (resp as { data: unknown }).data;
      if (data instanceof Blob || data instanceof File) return data;
      return new Blob([String(data ?? '')], { type: 'text/csv' });
    }

    return new Blob([String(resp ?? '')], { type: 'text/csv' });
  }, []);
};
