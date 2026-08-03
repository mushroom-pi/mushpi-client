import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import { picoUnitKeys, picoUnitsKeys } from '~api/queryKeys';

import { removeItemFromAllPages } from '../helpers';

export const createDeleteMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async (id: number) => {
      await unwrap(PicoUnits.picoUnitIdControllerRemoveV1({ picoUnitId: id }));
      return id;
    },
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: picoUnitKeys.detail(id), exact: true });
      removeItemFromAllPages(qc, id);
      qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
    },
    onError: (_err, id) => {
      qc.invalidateQueries({ queryKey: picoUnitKeys.detail(id) });
    },
  });
