import { useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { PicoUnit } from '~api/generated';
import { picoUnitKeys } from '~api/queryKeys';

export function useGetPicoUnit(picoUnitId: number | null) {
  if (!picoUnitId) throw new Error('no id');

  return useQuery<PicoUnit, unknown, PicoUnit>({
    queryKey: picoUnitKeys.detail(picoUnitId),
    queryFn: async () => {
      const res = await unwrap(PicoUnits.picoUnitIdControllerGetOne({ picoUnitId }));
      return res as unknown as PicoUnit;
    },
    enabled: picoUnitId != null,
  });
}
