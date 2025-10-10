import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { unwrap } from '../api/adapter';
import { PicoUnits } from '../api/client';
import type { PicoUnitListResponseDto } from '../api/generated';

export function usePicoUnits(
  params?: { page?: number; limit?: number; enabled?: boolean; q?: string },
  queryOptions?: UseQueryOptions<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  // mark as readonly tuple to satisfy queryKey typing
  const queryKey = ['picoUnits', { page, limit, ...params }] as const;

  return useQuery<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>({
    queryKey,
    queryFn: async () => {
      const resp = await unwrap(
        PicoUnits.picoUnitsControllerList({ page, limit, ...params } as any),
      );
      return resp as unknown as PicoUnitListResponseDto;
    },
    // Ensures fetch happens every time the component mounts (so each page access)
    refetchOnMount: 'always',
    // Also commonly useful:
    refetchOnWindowFocus: true,
    // Spread user-supplied overrides last so callers can override defaults:
    ...queryOptions,
  });
}
