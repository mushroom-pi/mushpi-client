import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Recipes } from '~api/client';
import type { Recipe, UpdateRecipeDto } from '~api/generated';
import { recipeKeys } from '~api/queryKeys';

export const createUpdateRecipeMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async ({
      recipeId,
      body,
    }: {
      recipeId: number;
      body: Partial<UpdateRecipeDto>;
    }) => {
      const res = await unwrap(
        Recipes.recipeIdControllerUpdate({ recipeId, updateRecipeDto: body as UpdateRecipeDto }),
      );
      return res as unknown as Recipe;
    },
    onSuccess: (_data, { recipeId }) => {
      qc.invalidateQueries({ queryKey: recipeKeys.detail(recipeId) });
      qc.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
