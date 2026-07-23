import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Recipes } from '~api/client';
import { recipeKeys } from '~api/queryKeys';

export const createDeleteRecipeMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async (recipeId: number) => {
      await unwrap(Recipes.recipeIdControllerRemoveV1({ recipeId }));
    },
    onSuccess: (_data, recipeId) => {
      qc.removeQueries({ queryKey: recipeKeys.detail(recipeId), exact: true });
      qc.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
