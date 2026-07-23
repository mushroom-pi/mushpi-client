import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import { batchKeys } from '~api/queryKeys';

export const createDeleteBatchMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async (batchId: number) => {
      await unwrap(Batches.batchIdControllerRemoveV1({ batchId }));
    },
    onSuccess: (_data, batchId) => {
      qc.removeQueries({ queryKey: batchKeys.detail(batchId), exact: true });
      qc.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
