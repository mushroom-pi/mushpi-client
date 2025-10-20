import type { useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { PicoUnit, UpdatePicoUnitDto } from '~api/generated';

import { createOptimisticMutation } from '../helpers';

export const createUpdateMutation = (qc: ReturnType<typeof useQueryClient>) =>
  createOptimisticMutation(qc, {
    mutationFn: async ({
      picoUnitId,
      body,
    }: {
      picoUnitId: number;
      body: Partial<UpdatePicoUnitDto>;
    }) => {
      const res = await unwrap(
        PicoUnits.picoUnitIdControllerUpdate({ picoUnitId, updatePicoUnitDto: body }),
      );
      return res as unknown as PicoUnit;
    },
    getIdFromVars: (v) => v.picoUnitId,
    applyOptimistic: (prev, vars) => {
      if (!prev) return undefined;
      return { ...prev, ...vars.body } as PicoUnit;
    },
  });
