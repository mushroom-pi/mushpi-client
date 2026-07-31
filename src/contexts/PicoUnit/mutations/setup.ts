import type { useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Control } from '~api/client';
import type { ChangeSetupDto, PicoUnit } from '~api/generated';

import { createOptimisticMutation } from '../helpers';

export const createChangeSetupMutation = (qc: ReturnType<typeof useQueryClient>) =>
  createOptimisticMutation(qc, {
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: ChangeSetupDto }) => {
      const res = await unwrap(
        Control.picoUnitIdControlControllerSetupV1({ picoUnitId, changeSetupDto: body }),
      );
      return res as unknown as ChangeSetupDto;
    },
    getIdFromVars: (vars: { picoUnitId: number; body: ChangeSetupDto }) => vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      const prev = prevItem;
      const body = vars.body;
      if (!prev) return undefined;
      const prevDevices = (prev as any).devices;
      return {
        ...prev,
        devices: {
          pins: {
            dht: body.pins?.dht ?? prevDevices?.pins?.dht ?? 4,
            humidifier: body.pins?.humidifier ?? prevDevices?.pins?.humidifier ?? 6,
            fan: body.pins?.fan ?? prevDevices?.pins?.fan ?? 7,
            heater: body.pins?.heater ?? prevDevices?.pins?.heater ?? 8,
          },
        },
      } as PicoUnit;
    },
  });
