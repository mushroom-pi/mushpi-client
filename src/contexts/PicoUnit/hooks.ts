import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { PicoUnit } from '~api/generated';
import { picoUnitKeys, readingsKeys } from '~api/queryKeys';

export function useGetPicoUnit(picoUnitId: number | null) {
  const queryClient = useQueryClient();

  // Periodic hardware poll — fetches live state from the Pico rather than stale DB data
  useEffect(() => {
    if (!picoUnitId) return;
    const interval = setInterval(() => {
      unwrap(PicoUnits.picoUnitIdControllerPollV1({ picoUnitId }))
        .then((result) => queryClient.setQueryData(picoUnitKeys.detail(picoUnitId), result))
        .catch(() => {}); // silent — falls back to last known data
    }, 60_000);
    return () => clearInterval(interval);
  }, [picoUnitId, queryClient]);

  return useQuery<PicoUnit, unknown, PicoUnit>({
    queryKey: picoUnitKeys.detail(picoUnitId!),
    queryFn: async () => {
      const res = await unwrap(PicoUnits.picoUnitIdControllerGetOneV1({ picoUnitId: picoUnitId! }));
      return res as unknown as PicoUnit;
    },
    enabled: picoUnitId != null,
  });
}

export function usePollPicoUnit() {
  const qc = useQueryClient();

  return useMutation<PicoUnit, unknown, { picoUnitId: number }>({
    mutationKey: ['picoUnit', 'poll'],
    mutationFn: async ({ picoUnitId }) => {
      const res = await unwrap(PicoUnits.picoUnitIdControllerPollV1({ picoUnitId }));
      return res as unknown as PicoUnit;
    },
    onSuccess: (data, { picoUnitId }) => {
      qc.setQueryData(picoUnitKeys.detail(picoUnitId), data);
      qc.invalidateQueries({ queryKey: readingsKeys.all, exact: false });
    },
  });
}
