import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo } from 'react';

import { unwrap } from 'src/api/adapter';
import { PicoUnits } from 'src/api/client';
import type { PicoUnit, UpdatePicoUnitDto } from 'src/api/generated';

function updateItemInAllPages(
  queryClient: ReturnType<typeof useQueryClient>,
  itemId: number,
  updater: (item: PicoUnit) => PicoUnit,
) {
  const cache = queryClient.getQueryCache();
  const queries = cache.findAll({ queryKey: ['picoUnits'], exact: false, type: 'all' });
  queries.forEach((q) => {
    const cur = queryClient.getQueryData<{ items: PicoUnit[] }>(q.queryKey as any);
    if (!cur?.items) return;
    const updated = { ...cur, items: cur.items.map((it) => (it.id === itemId ? updater(it) : it)) };
    queryClient.setQueryData(q.queryKey as any, updated);
  });
}

function removeItemFromAllPages(queryClient: ReturnType<typeof useQueryClient>, itemId: number) {
  const cache = queryClient.getQueryCache();
  const queries = cache.findAll({ queryKey: ['picoUnits'], exact: false, type: 'all' });
  queries.forEach((q) => {
    const cur = queryClient.getQueryData<{ items: PicoUnit[]; total?: number }>(q.queryKey as any);
    if (!cur?.items) return;
    const updated = {
      ...cur,
      items: cur.items.filter((it) => it.id !== itemId),
      total: (cur.total ?? 0) - 1,
    };
    queryClient.setQueryData(q.queryKey as any, updated);
  });
}

type PicoUnitCtx = {
  pico?: PicoUnit;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
  updatePico: {
    mutate: (vars: { picoUnitId: number; body: Partial<UpdatePicoUnitDto> }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: Partial<UpdatePicoUnitDto> }) => Promise<any>;
    isLoading: boolean;
  };
  deletePico: {
    mutate: (id: number) => void;
    mutateAsync: (id: number) => Promise<any>;
    isLoading: boolean;
  };
};

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
  const {
    data: pico,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PicoUnit>({
    queryKey: ['picoUnit', picoUnitId] as const,
    queryFn: async () => {
      const res = await unwrap(PicoUnits.picoUnitIdControllerGetOne({ picoUnitId }));
      return res as unknown as PicoUnit;
    },
    enabled: picoUnitId != null,
  });

  // -------------------------
  // Update mutation (patch)
  // -------------------------
  const updateMutation = useMutation({
    mutationFn: async ({
      picoUnitId,
      body,
    }: {
      picoUnitId: number;
      body: Partial<UpdatePicoUnitDto>;
    }) => {
      const res = await unwrap(
        PicoUnits.picoUnitIdControllerUpdate({ picoUnitId, updatePicoUnitDto: body }),
      );
      return res as unknown as PicoUnit;
    },
    onMutate: async ({ picoUnitId: id, body }) => {
      // cancel ongoing queries for this item and lists
      await qc.cancelQueries({ queryKey: ['picoUnit', id] });
      await qc.cancelQueries({ queryKey: ['picoUnits'] });

      // snapshot single-item and lists (coarse)
      const snapshotItem = qc.getQueryData(['picoUnit', id]);
      const snapshotLists = qc.getQueryData(['picoUnits']);

      // optimistic -> update the single item in cache if present
      const prevItem = qc.getQueryData<PicoUnit>(['picoUnit', id]);
      if (prevItem) {
        const optimistic = { ...prevItem, ...body };
        qc.setQueryData(['picoUnit', id], optimistic);
      }

      // update any cached list pages that include the item
      updateItemInAllPages(qc, id, (old) => ({ ...old, ...body }));

      return { snapshotItem, snapshotLists };
    },
    onError: (_err, _vars, context: any) => {
      // rollback: restore snapshots by invalidating (coarse) or setting data directly
      if (context?.snapshotItem) {
        qc.setQueryData(['picoUnit', (_vars as any)?.picoUnitId], context.snapshotItem);
      } else {
        qc.invalidateQueries({ queryKey: ['picoUnit', picoUnitId] });
      }
      // restore lists
      if (context?.snapshotLists) {
        qc.invalidateQueries({ queryKey: ['picoUnits'] });
      }
    },
    onSettled: (_data, _err, _vars) => {
      // revalidate both single item and lists to ensure canonical server state
      qc.invalidateQueries({ queryKey: ['picoUnit', picoUnitId] });
      qc.invalidateQueries({ queryKey: ['picoUnits'] });
    },
  });

  // -------------------------
  // Delete mutation
  // -------------------------
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await unwrap(PicoUnits.picoUnitIdControllerRemove({ picoUnitId: id }));
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['picoUnit', id] });
      await qc.cancelQueries({ queryKey: ['picoUnits'] });

      const snapshotItem = qc.getQueryData(['picoUnit', id]);
      const snapshotLists = qc.getQueryData(['picoUnits']);

      // remove single-item cache
      qc.removeQueries({ queryKey: ['picoUnit', id], exact: true });

      // remove from all pages
      removeItemFromAllPages(qc, id);

      return { snapshotItem, snapshotLists };
    },
    onError: (_err, id, context: any) => {
      // rollback: restore single item and lists
      if (context?.snapshotItem) {
        qc.setQueryData(['picoUnit', id], context.snapshotItem);
      } else {
        qc.invalidateQueries({ queryKey: ['picoUnit', picoUnitId] });
      }
      if (context?.snapshotLists) {
        qc.invalidateQueries({ queryKey: ['picoUnits'] });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['picoUnits'] });
    },
  });

  const value = useMemo<PicoUnitCtx>(
    () => ({
      pico,
      isLoading,
      isError,
      error,
      refetch: () => void refetch(),
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
    }),
    [pico, isLoading, isError, error, refetch, updateMutation, deleteMutation],
  );

  return <PicoUnitContext.Provider value={value}>{children}</PicoUnitContext.Provider>;
};

export function usePicoUnitContext() {
  const ctx = useContext(PicoUnitContext);
  if (!ctx) throw new Error('usePicoUnitContext must be used within <PicoUnitProvider>');
  return ctx;
}
