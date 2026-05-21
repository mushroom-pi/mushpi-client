import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Recipes } from '~api/client';
import type { CreateRecipeDto, Recipe } from '~api/generated';
import { recipeKeys } from '~api/queryKeys';

export const createRecipeMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async (body: CreateRecipeDto) => {
      const res = await unwrap(Recipes.recipesControllerCreate({ createRecipeDto: body }));
      return res as unknown as Recipe;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
