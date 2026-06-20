import type { Batch, CreateRecipeDto, Recipe, UpdateRecipeDto } from '~api/generated';

export type RecipeCtx = {
  recipe?: Recipe;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
  updateRecipe: {
    mutate: (vars: { recipeId: number; body: Partial<UpdateRecipeDto> }) => void;
    mutateAsync: (vars: { recipeId: number; body: Partial<UpdateRecipeDto> }) => Promise<Recipe>;
    isLoading: boolean;
  };
  deleteRecipe: {
    mutate: (id: number) => void;
    mutateAsync: (id: number) => Promise<void>;
    isLoading: boolean;
  };
  uploadImage: {
    mutate: (vars: { recipeId: number; file?: File; url?: string }) => void;
    mutateAsync: (vars: { recipeId: number; file?: File; url?: string }) => Promise<Recipe>;
    isLoading: boolean;
  };
  deleteImage: {
    mutate: (recipeId: number) => void;
    mutateAsync: (recipeId: number) => Promise<void>;
    isLoading: boolean;
  };
  recipeBatches?: Batch[];
  isBatchesLoading: boolean;
  createRecipe?: {
    mutate: (body: CreateRecipeDto) => void;
    mutateAsync: (body: CreateRecipeDto) => Promise<Recipe>;
    isLoading: boolean;
  };
};
