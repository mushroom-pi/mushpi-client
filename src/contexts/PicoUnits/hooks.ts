import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type {
  PicoUnitsApiPicoUnitsControllerListV1Request as ListPicoUnitsParams,
  PicoUnitListResponseDto,
} from '~api/generated';
import { picoUnitsKeys } from '~api/queryKeys';

export function useListPicoUnits(
  params?: ListPicoUnitsParams,
  queryOptions?: Omit<
    UseQueryOptions<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>,
    'queryKey' | 'queryFn'
  >,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  // mark as readonly tuple to satisfy queryKey typing
  const queryKey = picoUnitsKeys.list(params);

  return useQuery<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>({
    queryKey,
    queryFn: async () => {
      const resp = await unwrap(
        PicoUnits.picoUnitsControllerListV1({ page, limit, ...params } as ListPicoUnitsParams),
      );
      return resp as unknown as PicoUnitListResponseDto;
    },
    placeholderData: (previousData?: PicoUnitListResponseDto) => previousData,
    ...queryOptions,
  });
}
