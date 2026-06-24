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

  const value = useMemo<BatchCtx>(
    () => ({
      batch,
      isLoading,
      isError,
      error,
      refetch: () => void refetch(),
      updateBatch: {
        mutate: (vars) => updateMutation.mutate(vars),
        mutateAsync: (vars) => updateMutation.mutateAsync(vars),
        isLoading: updateMutation.isPending,
      },
      deleteBatch: {
        mutate: (id) => deleteMutation.mutate(id),
        mutateAsync: (id) => deleteMutation.mutateAsync(id),
        isLoading: deleteMutation.isPending,
      },
      createBatch: {
        mutate: (body) => createMutation.mutate(body),
        mutateAsync: (body) => createMutation.mutateAsync(body),
        isLoading: createMutation.isPending,
      },
      createRecipeFromBatch: {
        mutate: (vars) => createRecipeMutation.mutate(vars),
        mutateAsync: (vars) => createRecipeMutation.mutateAsync(vars),
        isLoading: createRecipeMutation.isPending,
      },
      uploadImages: {
        mutate: (vars) => uploadImagesMutation.mutate(vars),
        mutateAsync: (vars) => uploadImagesMutation.mutateAsync(vars),
        isLoading: uploadImagesMutation.isPending,
      },
      removeImage: {
        mutate: (vars) => removeImageMutation.mutate(vars),
        mutateAsync: (vars) => removeImageMutation.mutateAsync(vars),
        isLoading: removeImageMutation.isPending,
      },
    }),
    [
      batch,
      isLoading,
      isError,
      error,
      refetch,
      updateMutation,
      deleteMutation,
      createMutation,
      createRecipeMutation,
      uploadImagesMutation,
      removeImageMutation,
    ],
  );

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
};

export function useBatchContext() {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatchContext must be used within <BatchProvider>');
  return ctx;
}
