import type { useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Control } from '~api/client';
import type { ChangeOutputsDto, PicoUnit } from '~api/generated';

import { applyReadingPatch, createOptimisticMutation } from '../helpers';

export const createChangeOutputsMutation = (qc: ReturnType<typeof useQueryClient>) =>
  createOptimisticMutation(qc, {
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: ChangeOutputsDto }) => {
      const res = await unwrap(
        Control.picoUnitIdControlControllerOutputsV1({ picoUnitId, changeOutputsDto: body }),
      );
      return res as unknown as ChangeOutputsDto;
    },
    getIdFromVars: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      const prev = prevItem;
      const body = vars.body;
      if (!prev) return undefined;
      const patched = applyReadingPatch(prev.latest_reading, {
        humidifier_on:
          body.humidifier === undefined ? prev.latest_reading?.humidifier_on : body.humidifier,
        heater_on: body.heater === undefined ? prev.latest_reading?.heater_on : body.heater,
        fan_on: body.fan === undefined ? prev.latest_reading?.fan_on : body.fan,
      });
      return { ...prev, latest_reading: patched } as PicoUnit;
    },
  });
