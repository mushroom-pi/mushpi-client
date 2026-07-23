import type { useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Control } from '~api/client';
import type { ChangeSetPointsDto, PicoUnit } from '~api/generated';

import { applyReadingPatch, createOptimisticMutation } from '../helpers';

export const createChangeTargetsMutation = (qc: ReturnType<typeof useQueryClient>) =>
  createOptimisticMutation(qc, {
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: ChangeSetPointsDto }) => {
      const res = await unwrap(
        Control.picoUnitIdControlControllerSetpointsV1({ picoUnitId, changeSetPointsDto: body }),
      );
      return res as unknown as ChangeSetPointsDto;
    },
    getIdFromVars: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      const prev = prevItem;
      const body = vars.body;
      if (!prev) return undefined;
      const patched = applyReadingPatch(prev.latest_reading, {
        temperature_set: body.temperature ?? prev.latest_reading?.temperature_set,
        humidity_set: body.humidity ?? prev.latest_reading?.humidity_set,
      });
      return { ...prev, latest_reading: patched } as PicoUnit;
    },
  });
