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

  const value = useMemo<PicoUnitCtx>(
    () => ({
      pico,
      isLoading,
      isError,
      error,
      refetch: () => void refetch(),
      pollPico: {
        mutate: (params) => pollMutation.mutate(params),
        mutateAsync: (params) => pollMutation.mutateAsync(params),
        isLoading: pollMutation.isPending,
      },
      updatePico: {
        mutate: (vars) => updateMutation.mutate(vars),
        mutateAsync: (vars) => updateMutation.mutateAsync(vars),
        isLoading: updateMutation.isPending,
      },
      deletePico: {
        mutate: (id) => deleteMutation.mutate(id),
        mutateAsync: (id) => deleteMutation.mutateAsync(id),
        isLoading: deleteMutation.isPending,
      },
      toggleControlLoop: {
        mutate: (vars) => toggleControlLoopMutation.mutate(vars),
        mutateAsync: (vars) => toggleControlLoopMutation.mutateAsync(vars),
        isLoading: toggleControlLoopMutation.isPending,
      },
      changeTargets: {
        mutate: (vars) => changeTargetsMutation.mutate(vars),
        mutateAsync: (vars) => changeTargetsMutation.mutateAsync(vars),
        isLoading: changeTargetsMutation.isPending,
      },
      changeOutputs: {
        mutate: (vars) => changeOutputsMutation.mutate(vars),
        mutateAsync: (vars) => changeOutputsMutation.mutateAsync(vars),
        isLoading: changeOutputsMutation.isPending,
      },
      changeSetup: {
        mutate: (vars) => changeSetupMutation.mutate(vars),
        mutateAsync: (vars) => changeSetupMutation.mutateAsync(vars),
        isLoading: changeSetupMutation.isPending,
      },
      rebootPico: {
        mutate: (vars) => rebootMutation.mutate(vars),
        mutateAsync: (vars) => rebootMutation.mutateAsync(vars),
        isLoading: rebootMutation.isPending,
      },
    }),
    [
      pico,
      isLoading,
      isError,
      error,
      refetch,
      pollMutation,
      updateMutation,
      deleteMutation,
      toggleControlLoopMutation,
      changeTargetsMutation,
      changeOutputsMutation,
      changeSetupMutation,
      rebootMutation,
    ],
  );

  return <PicoUnitContext.Provider value={value}>{children}</PicoUnitContext.Provider>;
};

export function usePicoUnitContext() {
  const ctx = useContext(PicoUnitContext);
  if (!ctx) throw new Error('usePicoUnitContext must be used within <PicoUnitProvider>');
  return ctx;
}
