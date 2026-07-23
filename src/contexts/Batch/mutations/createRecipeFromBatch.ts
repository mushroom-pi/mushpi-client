import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type { Recipe } from '~api/generated';
import { batchKeys, recipeKeys } from '~api/queryKeys';

export const createRecipeFromBatchMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async ({
      batchId,
      name,
      notes,
    }: {
      batchId: number;
      name: string;
      notes?: string;
    }) => {
      const res = await unwrap(
        Batches.batchIdRecipeControllerCreateRecipeV1({
          batchId,
          createRecipeFromBatchDto: { name, notes },
        }),
      );
      return res as unknown as Recipe;
    },
    onSuccess: (_data, { batchId }) => {
      qc.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      qc.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
