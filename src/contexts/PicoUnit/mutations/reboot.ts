import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { RebootDto, RebootResponseDto } from '~api/generated';
import { picoUnitKeys, picoUnitsKeys } from '~api/queryKeys';

export const createRebootMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: RebootDto }) => {
      const res = await unwrap(
        PicoUnits.picoUnitIdControllerRebootV1({ picoUnitId, rebootDto: body }),
      );
      return res as unknown as RebootResponseDto;
    },
    onSuccess: (_data, vars) => {
      const id = vars.picoUnitId;
      qc.invalidateQueries({ queryKey: picoUnitKeys.detail(id) });
      qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
    },
  });
