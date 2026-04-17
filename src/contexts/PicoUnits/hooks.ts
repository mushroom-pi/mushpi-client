import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type {
  PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams,
  PicoUnitListResponseDto,
} from '~api/generated';
import { picoUnitsKeys } from '~api/queryKeys';

export function useListPicoUnits(
  params?: ListPicoUnitsParams,
  queryOptions?: UseQueryOptions<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const enabled = params?.enabled ?? true;

  // mark as readonly tuple to satisfy queryKey typing
  const queryKey = picoUnitsKeys.list(params);

  return useQuery<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>({
    queryKey,
    queryFn: async () => {
      const resp = await unwrap(
        PicoUnits.picoUnitsControllerList({ page, limit, ...params } as ListPicoUnitsParams),
      );
      return resp as unknown as PicoUnitListResponseDto;
    },
    placeholderData: (previousData?: PicoUnitListResponseDto) => previousData,
    enabled,
    ...queryOptions,
  });
}
