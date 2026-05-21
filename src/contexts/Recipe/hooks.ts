import { useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Recipes } from '~api/client';
import type {
  BatchListResponseDto,
  Recipe,
  RecipesApiRecipeIdBatchesControllerListRequest as ListRecipeBatchesParams,
} from '~api/generated';
import { recipeKeys } from '~api/queryKeys';

export function useGetRecipe(recipeId: number | null) {
  return useQuery<Recipe, unknown, Recipe>({
    queryKey: recipeKeys.detail(recipeId ?? 0),
    queryFn: async () => {
      const res = await unwrap(Recipes.recipeIdControllerGetOne({ recipeId: recipeId! }));
      return res as unknown as Recipe;
    },
    enabled: recipeId != null,
  });
}

export function useGetRecipeBatches(
  recipeId: number | null,
  params?: Partial<Omit<ListRecipeBatchesParams, 'recipeId'>>,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;

  return useQuery<BatchListResponseDto, unknown, BatchListResponseDto>({
    queryKey: recipeKeys.batches(recipeId ?? 0, { page, limit, status }),
    queryFn: async () => {
      const res = await unwrap(
        Recipes.recipeIdBatchesControllerList({ recipeId: recipeId!, page, limit, status }),
      );
      return res as unknown as BatchListResponseDto;
    },
    enabled: recipeId != null,
  });
}
