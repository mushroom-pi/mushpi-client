import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { unwrap } from 'src/api/adapter';
import { PicoUnits } from 'src/api/client';
import type {
  PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams,
  PicoUnit,
  PicoUnitListResponseDto,
} from 'src/api/generated';

export function useListPicoUnits(
  params?: ListPicoUnitsParams,
  queryOptions?: UseQueryOptions<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const enabled = params?.enabled;
  const q = params?.q;

  // mark as readonly tuple to satisfy queryKey typing
  const queryKey = ['picoUnits', page, limit, enabled, q] as const;

  return useQuery<PicoUnitListResponseDto, unknown, PicoUnitListResponseDto>({
    queryKey,
    queryFn: async () => {
      const resp = await unwrap(
        PicoUnits.picoUnitsControllerList({ page, limit, ...params } as ListPicoUnitsParams),
      );
      return resp as unknown as PicoUnitListResponseDto;
    },
    placeholderData: (previousData?: PicoUnitListResponseDto) => previousData,
    ...queryOptions,
  });
}

export function useGetPicoUnit(picoUnitId: number | null) {
  if (!picoUnitId) throw new Error('no id');
  const queryKey = ['picoUnit', picoUnitId] as const;

  return useQuery<PicoUnit, unknown, PicoUnit>({
    queryKey,
    queryFn: async () =>
      (await unwrap(
        PicoUnits.picoUnitIdControllerGetOne({ picoUnitId } as any),
      )) as unknown as PicoUnit,
  });
}
