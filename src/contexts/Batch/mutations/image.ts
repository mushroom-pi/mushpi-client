import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type { Batch } from '~api/generated';
import { batchKeys } from '~api/queryKeys';

export const createUploadBatchImagesMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async ({ batchId, images }: { batchId: number; images: File[] }) => {
      const res = await unwrap(Batches.batchIdImagesControllerAddImages({ batchId, images }));
      return res as unknown as Batch;
    },
    onSuccess: (_data, { batchId }) => {
      qc.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      qc.invalidateQueries({ queryKey: batchKeys.all });
    },
  });

export const createRemoveBatchImageMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async ({ batchId, filename }: { batchId: number; filename: string }) => {
      await unwrap(Batches.batchIdImagesControllerRemoveImage({ batchId, filename }));
    },
    onSuccess: (_data, { batchId }) => {
      qc.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      qc.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
