import { type UseQueryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { unwrap } from 'src/api/adapter';
import { PicoUnits } from 'src/api/client';
import type {
  PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams,
  PicoUnit,
  PicoUnitListResponseDto,
  UpdatePicoUnitDto,
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

export function useUpdatePicoUnit() {
  return useMutation({
    mutationFn: async (vars: { picoUnitId: number; body: UpdatePicoUnitDto }) => {
      const { picoUnitId, body } = vars;
      const resp = await unwrap(PicoUnits.picoUnitIdControllerUpdate({ picoUnitId, body } as any));
      return resp as unknown as PicoUnit;
    },
    // onSuccess: (_data, vars) => {
    //   // invalidate the single item and the list so UI refreshes
    //   qc.invalidateQueries({ queryKey: ['picoUnit', vars.picoUnitId] });
    //   qc.invalidateQueries({ queryKey: ['picoUnits'] });
    // },
  });
}

export function useDeletePicoUnit() {
  return useMutation({
    mutationFn: async (picoUnitId: number) => {
      await unwrap(PicoUnits.picoUnitIdControllerRemove({ picoUnitId } as any));
      return undefined;
    },
    // onSuccess: (_data, picoUnitId) => {
    //   qc.invalidateQueries({ queryKey: ['picoUnit', picoUnitId] });
    //   qc.invalidateQueries({ queryKey: ['picoUnits'] });
    // },
  });
}
