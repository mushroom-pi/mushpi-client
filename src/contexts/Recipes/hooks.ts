import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Recipes } from '~api/client';
import type {
  RecipeListResponseDto,
  RecipesApiRecipesControllerListRequest as ListRecipesParams,
} from '~api/generated';
import { recipeKeys } from '~api/queryKeys';

export function useListRecipes(
  params?: Partial<ListRecipesParams>,
  queryOptions?: Omit<UseQueryOptions<RecipeListResponseDto, unknown, RecipeListResponseDto>, 'queryKey' | 'queryFn'>,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const species = params?.species;

  return useQuery<RecipeListResponseDto, unknown, RecipeListResponseDto>({
    queryKey: recipeKeys.list({ page, limit, species }),
    queryFn: async () => {
      const resp = await unwrap(Recipes.recipesControllerList({ page, limit, species }));
      return resp as unknown as RecipeListResponseDto;
    },
    placeholderData: (prev?: RecipeListResponseDto) => prev,
    ...queryOptions,
  });
}
