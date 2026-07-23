import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type { Batch, CreateBatchDto } from '~api/generated';
import { batchKeys } from '~api/queryKeys';

export const createBatchMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async (body: CreateBatchDto) => {
      const res = await unwrap(Batches.batchesControllerCreateV1({ createBatchDto: body }));
      return res as unknown as Batch;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
