import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo } from 'react';

import { useGetPicoUnit, usePollPicoUnit } from './hooks';
import {
  createChangeOutputsMutation,
  createChangeSetupMutation,
  createChangeTargetsMutation,
  createDeleteMutation,
  createRebootMutation,
  createToggleControlLoopMutation,
  createUpdateMutation,
} from './mutations';
import type { PicoUnitCtx } from './types';

const PicoUnitContext = createContext<PicoUnitCtx | undefined>(undefined);

/**
 * Provider fetches the pico unit by id and exposes update/delete wrappers that:
 * - optimistically update the single-item query ['picoUnit', id]
 * - update paginated list caches (['picoUnits', ...]) so lists reflect changes
 * - invalidate queries on settle to get canonical server truth
 */
export const PicoUnitProvider: React.FC<React.PropsWithChildren<{ picoUnitId: number }>> = ({
  picoUnitId,
  children,
}) => {
  const qc = useQueryClient();

  // fetch single item
  const { data: pico, isLoading, isError, error, refetch } = useGetPicoUnit(picoUnitId);

  const pollMutation = usePollPicoUnit();
  const updateMutation = createUpdateMutation(qc);
  const deleteMutation = createDeleteMutation(qc);
  const toggleControlLoopMutation = createToggleControlLoopMutation(qc);
  const changeTargetsMutation = createChangeTargetsMutation(qc);
  const changeOutputsMutation = createChangeOutputsMutation(qc);
  const changeSetupMutation = createChangeSetupMutation(qc);
  const rebootMutation = createRebootMutation(qc);

  // Destructure stable parts — mutate/mutateAsync are referentially stable,
  // but the wrapper object returned by useMutation changes identity every render.
  const pollMutate = pollMutation.mutate;
  const pollMutateAsync = pollMutation.mutateAsync;
  const pollIsPending = pollMutation.isPending;

  const updateMutate = updateMutation.mutate;
  const updateMutateAsync = updateMutation.mutateAsync;
  const updateIsPending = updateMutation.isPending;

  const deleteMutate = deleteMutation.mutate;
  const deleteMutateAsync = deleteMutation.mutateAsync;
  const deleteIsPending = deleteMutation.isPending;

  const toggleMutate = toggleControlLoopMutation.mutate;
  const toggleMutateAsync = toggleControlLoopMutation.mutateAsync;
  const toggleIsPending = toggleControlLoopMutation.isPending;

  const targetsMutate = changeTargetsMutation.mutate;
  const targetsMutateAsync = changeTargetsMutation.mutateAsync;
  const targetsIsPending = changeTargetsMutation.isPending;

  const outputsMutate = changeOutputsMutation.mutate;
  const outputsMutateAsync = changeOutputsMutation.mutateAsync;
  const outputsIsPending = changeOutputsMutation.isPending;

  const setupMutate = changeSetupMutation.mutate;
  const setupMutateAsync = changeSetupMutation.mutateAsync;
  const setupIsPending = changeSetupMutation.isPending;

  const rebootMutate = rebootMutation.mutate;
  const rebootMutateAsync = rebootMutation.mutateAsync;
  const rebootIsPending = rebootMutation.isPending;

  const value = useMemo<PicoUnitCtx>(
    () => ({
      pico,
      isLoading,
      isError,
      error,
      refetch: () => void refetch(),
      pollPico: {
        mutate: pollMutate,
        mutateAsync: pollMutateAsync,
        isLoading: pollIsPending,
      },
      updatePico: {
        mutate: updateMutate,
        mutateAsync: updateMutateAsync,
        isLoading: updateIsPending,
      },
      deletePico: {
        mutate: deleteMutate,
        mutateAsync: deleteMutateAsync,
        isLoading: deleteIsPending,
      },
      toggleControlLoop: {
        mutate: toggleMutate,
        mutateAsync: toggleMutateAsync,
        isLoading: toggleIsPending,
      },
      changeTargets: {
        mutate: targetsMutate,
        mutateAsync: targetsMutateAsync,
        isLoading: targetsIsPending,
      },
      changeOutputs: {
        mutate: outputsMutate,
        mutateAsync: outputsMutateAsync,
        isLoading: outputsIsPending,
      },
      changeSetup: {
        mutate: setupMutate,
        mutateAsync: setupMutateAsync,
        isLoading: setupIsPending,
      },
      rebootPico: {
        mutate: rebootMutate,
        mutateAsync: rebootMutateAsync,
        isLoading: rebootIsPending,
      },
    }),
    [
      pico,
      isLoading,
      isError,
      error,
      refetch,
      pollMutate,
      pollMutateAsync,
      pollIsPending,
      updateMutate,
      updateMutateAsync,
      updateIsPending,
      deleteMutate,
      deleteMutateAsync,
      deleteIsPending,
      toggleMutate,
      toggleMutateAsync,
      toggleIsPending,
      targetsMutate,
      targetsMutateAsync,
      targetsIsPending,
      outputsMutate,
      outputsMutateAsync,
      outputsIsPending,
      setupMutate,
      setupMutateAsync,
      setupIsPending,
      rebootMutate,
      rebootMutateAsync,
      rebootIsPending,
    ],
  );

  return <PicoUnitContext.Provider value={value}>{children}</PicoUnitContext.Provider>;
};

export function usePicoUnitContext() {
  const ctx = useContext(PicoUnitContext);
  if (!ctx) throw new Error('usePicoUnitContext must be used within <PicoUnitProvider>');
  return ctx;
}
