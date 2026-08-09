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

  // Destructure stable parts — mutate/mutateAsync are referentially stable,
  // but the wrapper object returned by useMutation changes identity every render.
  const updateMutate = updateMutation.mutate;
  const updateMutateAsync = updateMutation.mutateAsync;
  const updateIsPending = updateMutation.isPending;

  const deleteMutate = deleteMutation.mutate;
  const deleteMutateAsync = deleteMutation.mutateAsync;
  const deleteIsPending = deleteMutation.isPending;

  const createMutate = createMutation.mutate;
  const createMutateAsync = createMutation.mutateAsync;
  const createIsPending = createMutation.isPending;

  const uploadMutate = uploadImageMutation.mutate;
  const uploadMutateAsync = uploadImageMutation.mutateAsync;
  const uploadIsPending = uploadImageMutation.isPending;

  const deleteImgMutate = deleteImageMutation.mutate;
  const deleteImgMutateAsync = deleteImageMutation.mutateAsync;
  const deleteImgIsPending = deleteImageMutation.isPending;

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
        mutate: updateMutate,
        mutateAsync: updateMutateAsync,
        isLoading: updateIsPending,
      },
      deleteRecipe: {
        mutate: deleteMutate,
        mutateAsync: deleteMutateAsync,
        isLoading: deleteIsPending,
      },
      uploadImage: {
        mutate: uploadMutate,
        mutateAsync: uploadMutateAsync,
        isLoading: uploadIsPending,
      },
      deleteImage: {
        mutate: deleteImgMutate,
        mutateAsync: deleteImgMutateAsync,
        isLoading: deleteImgIsPending,
      },
      createRecipe: {
        mutate: createMutate,
        mutateAsync: createMutateAsync,
        isLoading: createIsPending,
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
      updateMutate,
      updateMutateAsync,
      updateIsPending,
      deleteMutate,
      deleteMutateAsync,
      deleteIsPending,
      createMutate,
      createMutateAsync,
      createIsPending,
      uploadMutate,
      uploadMutateAsync,
      uploadIsPending,
      deleteImgMutate,
      deleteImgMutateAsync,
      deleteImgIsPending,
    ],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};

export function useRecipeContext() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipeContext must be used within <RecipeProvider>');
  return ctx;
}
