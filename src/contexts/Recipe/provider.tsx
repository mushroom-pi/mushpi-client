import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo } from 'react';

import { useGetRecipe, useGetRecipeBatches } from './hooks';
import {
  createDeleteRecipeImageMutation,
  createDeleteRecipeMutation,
  createRecipeMutation,
  createUpdateRecipeMutation,
  createUploadRecipeImageMutation,
} from './mutations';
import type { RecipeCtx } from './types';

const RecipeContext = createContext<RecipeCtx | undefined>(undefined);

export const RecipeProvider: React.FC<React.PropsWithChildren<{ recipeId: number }>> = ({
  recipeId,
  children,
}) => {
  const qc = useQueryClient();

  const { data: recipe, isLoading, isError, error, refetch } = useGetRecipe(recipeId);
  const { data: batchesData, isLoading: isBatchesLoading } = useGetRecipeBatches(recipeId);

  const updateMutation = createUpdateRecipeMutation(qc);
  const deleteMutation = createDeleteRecipeMutation(qc);
  const createMutation = createRecipeMutation(qc);
  const uploadImageMutation = createUploadRecipeImageMutation(qc);
  const deleteImageMutation = createDeleteRecipeImageMutation(qc);

  const value = useMemo<RecipeCtx>(
    () => ({
      recipe,
      isLoading,
      isError,
      error,
      refetch: () => void refetch(),
      recipeBatches: batchesData?.items,
      isBatchesLoading,
      updateRecipe: {
        mutate: (vars) => updateMutation.mutate(vars),
        mutateAsync: (vars) => updateMutation.mutateAsync(vars),
        isLoading: updateMutation.isPending,
      },
      deleteRecipe: {
        mutate: (id) => deleteMutation.mutate(id),
        mutateAsync: (id) => deleteMutation.mutateAsync(id),
        isLoading: deleteMutation.isPending,
      },
      uploadImage: {
        mutate: (vars) => uploadImageMutation.mutate(vars),
        mutateAsync: (vars) => uploadImageMutation.mutateAsync(vars),
        isLoading: uploadImageMutation.isPending,
      },
      deleteImage: {
        mutate: (id) => deleteImageMutation.mutate(id),
        mutateAsync: (id) => deleteImageMutation.mutateAsync(id),
        isLoading: deleteImageMutation.isPending,
      },
      createRecipe: {
        mutate: (body) => createMutation.mutate(body),
        mutateAsync: (body) => createMutation.mutateAsync(body),
        isLoading: createMutation.isPending,
      },
    }),
    [
      recipe,
      isLoading,
      isError,
      error,
      refetch,
      batchesData,
      isBatchesLoading,
      updateMutation,
      deleteMutation,
      createMutation,
      uploadImageMutation,
      deleteImageMutation,
    ],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};

export function useRecipeContext() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipeContext must be used within <RecipeProvider>');
  return ctx;
}
