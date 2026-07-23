import type { useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Control } from '~api/client';
import type { ControlLoopDto, PicoUnit } from '~api/generated';

import { applyReadingPatch, createOptimisticMutation } from '../helpers';

export const createToggleControlLoopMutation = (qc: ReturnType<typeof useQueryClient>) =>
  createOptimisticMutation(qc, {
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: ControlLoopDto }) => {
      const res = await unwrap(
        Control.picoUnitIdControlControllerLoopV1({ picoUnitId, controlLoopDto: body }),
      );
      return res as unknown as ControlLoopDto;
    },
    getIdFromVars: (vars: { picoUnitId: number; body: ControlLoopDto }) => vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      const prev = prevItem;
      const body = vars.body;
      if (!prev) return undefined;
      const patched = applyReadingPatch(prev.latest_reading, {
        control_loop_enabled:
          body.enabled === undefined ? prev.latest_reading?.control_loop_enabled : body.enabled,
      });
      return { ...prev, latest_reading: patched } as PicoUnit;
    },
  });
