import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type { Batch, UpdateBatchDto } from '~api/generated';
import { batchKeys } from '~api/queryKeys';

export const createUpdateBatchMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async ({
      batchId,
      body,
    }: {
      batchId: number;
      body: Partial<UpdateBatchDto>;
    }) => {
      const res = await unwrap(
        Batches.batchIdControllerUpdate({ batchId, updateBatchDto: body as UpdateBatchDto }),
      );
      return res as unknown as Batch;
    },
    onSuccess: (_data, { batchId }) => {
      qc.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      qc.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
