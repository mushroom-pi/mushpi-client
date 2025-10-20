import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';

import { removeItemFromAllPages } from '../helpers';

export const createDeleteMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async (id: number) => {
      await unwrap(PicoUnits.picoUnitIdControllerRemove({ picoUnitId: id }));
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['picoUnit', id] });
      await qc.cancelQueries({ queryKey: ['picoUnits'] });

      const snapshotItem = qc.getQueryData(['picoUnit', id]);
      const snapshotLists = qc.getQueryData(['picoUnits']);

      // remove single-item cache
      qc.removeQueries({ queryKey: ['picoUnit', id], exact: true });

      // remove from all pages
      removeItemFromAllPages(qc, id);

      return { snapshotItem, snapshotLists };
    },
    onError: (_err, id, context: any) => {
      if (context?.snapshotItem) {
        qc.setQueryData(['picoUnit', id], context.snapshotItem);
      } else {
        qc.invalidateQueries({ queryKey: ['picoUnit', id] });
      }
      if (context?.snapshotLists) {
        qc.invalidateQueries({ queryKey: ['picoUnits'] });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['picoUnits'] });
    },
  });
