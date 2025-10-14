import { type UseQueryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { unwrap } from 'src/api/adapter';
import { PicoUnits } from 'src/api/client';
import {
  type PicoUnit,
  type PicoUnitListResponseDto,
  type UpdatePicoUnitDto,
} from 'src/api/generated';

export function useListPicoUnits(
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

export function useGetPicoUnit(picoUnitId: number | null) {
  if (!picoUnitId) throw new Error('no id');
  const queryKey = ['picoUnit', picoUnitId] as const;

  return useQuery<PicoUnit, unknown, PicoUnit>({
    queryKey,
    queryFn: async () =>
      (await unwrap(
        PicoUnits.picoUnitIdControllerGetOne({ picoUnitId } as any),
      )) as unknown as PicoUnit,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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
