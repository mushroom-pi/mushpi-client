import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo } from 'react';

import { useGetBatch } from './hooks';
import {
  createBatchMutation,
  createDeleteBatchMutation,
  createRecipeFromBatchMutation,
  createRemoveBatchImageMutation,
  createUpdateBatchMutation,
  createUploadBatchImagesMutation,
} from './mutations';
import type { BatchCtx } from './types';

const BatchContext = createContext<BatchCtx | undefined>(undefined);

export const BatchProvider: React.FC<React.PropsWithChildren<{ batchId: number }>> = ({
  batchId,
  children,
}) => {
  const qc = useQueryClient();

  const { data: batch, isLoading, isError, error, refetch } = useGetBatch(batchId);

  const updateMutation = createUpdateBatchMutation(qc);
  const deleteMutation = createDeleteBatchMutation(qc);
  const createMutation = createBatchMutation(qc);
  const createRecipeMutation = createRecipeFromBatchMutation(qc);
  const uploadImagesMutation = createUploadBatchImagesMutation(qc);
  const removeImageMutation = createRemoveBatchImageMutation(qc);

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

  const recipeMutate = createRecipeMutation.mutate;
  const recipeMutateAsync = createRecipeMutation.mutateAsync;
  const recipeIsPending = createRecipeMutation.isPending;

  const uploadMutate = uploadImagesMutation.mutate;
  const uploadMutateAsync = uploadImagesMutation.mutateAsync;
  const uploadIsPending = uploadImagesMutation.isPending;

  const removeMutate = removeImageMutation.mutate;
  const removeMutateAsync = removeImageMutation.mutateAsync;
  const removeIsPending = removeImageMutation.isPending;

  const value = useMemo<BatchCtx>(
    () => ({
      batch,
      isLoading,
      isError,
      error,
      refetch: () => void refetch(),
      updateBatch: {
        mutate: updateMutate,
        mutateAsync: updateMutateAsync,
        isLoading: updateIsPending,
      },
      deleteBatch: {
        mutate: deleteMutate,
        mutateAsync: deleteMutateAsync,
        isLoading: deleteIsPending,
      },
      createBatch: {
        mutate: createMutate,
        mutateAsync: createMutateAsync,
        isLoading: createIsPending,
      },
      createRecipeFromBatch: {
        mutate: recipeMutate,
        mutateAsync: recipeMutateAsync,
        isLoading: recipeIsPending,
      },
      uploadImages: {
        mutate: uploadMutate,
        mutateAsync: uploadMutateAsync,
        isLoading: uploadIsPending,
      },
      removeImage: {
        mutate: removeMutate,
        mutateAsync: removeMutateAsync,
        isLoading: removeIsPending,
      },
    }),
    [
      batch,
      isLoading,
      isError,
      error,
      refetch,
      updateMutate,
      updateMutateAsync,
      updateIsPending,
      deleteMutate,
      deleteMutateAsync,
      deleteIsPending,
      createMutate,
      createMutateAsync,
      createIsPending,
      recipeMutate,
      recipeMutateAsync,
      recipeIsPending,
      uploadMutate,
      uploadMutateAsync,
      uploadIsPending,
      removeMutate,
      removeMutateAsync,
      removeIsPending,
    ],
  );

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
};

export function useBatchContext() {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatchContext must be used within <BatchProvider>');
  return ctx;
}
