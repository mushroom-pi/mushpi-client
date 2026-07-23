import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type {
  Batch,
  BatchListResponseDto,
  BatchesControllerListV1StatusEnum,
  BatchesApiBatchesControllerListV1Request as ListBatchesParams,
  PicoUnitIdBatchesControllerListV1StatusEnum,
} from '~api/generated';
import { batchKeys } from '~api/queryKeys';

export function useListBatches(
  params?: Partial<ListBatchesParams>,
  queryOptions?: Omit<
    UseQueryOptions<BatchListResponseDto, unknown, BatchListResponseDto>,
    'queryKey' | 'queryFn'
  >,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;
  const picoUnitId = params?.picoUnitId;
  const recipeId = params?.recipeId;

  return useQuery<BatchListResponseDto, unknown, BatchListResponseDto>({
    queryKey: batchKeys.list({ page, limit, status, picoUnitId, recipeId }),
    queryFn: async () => {
      const resp = await unwrap(
        Batches.batchesControllerListV1({ page, limit, status, picoUnitId, recipeId }),
      );
      return resp as unknown as BatchListResponseDto;
    },
    placeholderData: (prev?: BatchListResponseDto) => prev,
    ...queryOptions,
  });
}

export function usePicoUnitBatches(
  picoUnitId: number | null,
  params?: {
    page?: number;
    limit?: number;
    status?: PicoUnitIdBatchesControllerListV1StatusEnum;
  },
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;

  return useQuery<BatchListResponseDto, unknown, BatchListResponseDto>({
    queryKey: batchKeys.forUnit(picoUnitId ?? 0, { page, limit, status }),
    queryFn: async () => {
      const resp = await unwrap(
        Batches.picoUnitIdBatchesControllerListV1({ picoUnitId: picoUnitId!, page, limit, status }),
      );
      return resp as unknown as BatchListResponseDto;
    },
    enabled: picoUnitId != null,
    placeholderData: (prev?: BatchListResponseDto) => prev,
  });
}

// batchId is required by the generated client but unused in the URL template
// (generator quirk for /pico-units/{picoUnitId}/batches/current)
export function usePicoUnitCurrentBatch(picoUnitId: number | null) {
  return useQuery<Batch, unknown, Batch>({
    queryKey: batchKeys.currentForUnit(picoUnitId ?? 0),
    queryFn: async () => {
      const resp = await unwrap(
        Batches.picoUnitIdBatchesControllerGetCurrentV1({ picoUnitId: picoUnitId!, batchId: 0 }),
      );
      return resp as unknown as Batch;
    },
    enabled: picoUnitId != null,
    retry: (_count, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      return status !== 404;
    },
  });
}

export type { BatchesControllerListV1StatusEnum, PicoUnitIdBatchesControllerListV1StatusEnum };
