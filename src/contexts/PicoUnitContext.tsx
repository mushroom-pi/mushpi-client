import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo } from 'react';

import { unwrap } from '~api/adapter';
import { Control, PicoUnits } from '~api/client';
import type {
  ChangeOutputsDto,
  ChangeSetPointsDto,
  ControlLoopDto,
  PicoUnit,
  Readings,
  UpdatePicoUnitDto,
} from '~api/generated';

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

/**
 * createOptimisticMutation centralizes the common mutation lifecycle for mutations that:
 * - cancel queries for ['picoUnit', id] and ['picoUnits']
 * - snapshot item and lists
 * - apply an optimistic update to ['picoUnit', id] and all list pages
 * - on error restore snapshot or invalidate
 * - on settled invalidate queries to re-sync
 *
 * usage: createOptimisticMutation(qc, {
 *   mutationFn,
 *   applyOptimistic: (prevItem, body) => newItem
 * })
 */
function createOptimisticMutation<Input, Result = any>(
  qc: ReturnType<typeof useQueryClient>,
  opts: {
    mutationFn: (vars: Input) => Promise<Result>;
    getIdFromVars: (vars: Input) => number;
    applyOptimistic: (prevItem: PicoUnit | undefined, vars: Input) => PicoUnit | undefined;
  },
) {
  return useMutation({
    mutationFn: opts.mutationFn,
    onMutate: async (vars: Input) => {
      const id = opts.getIdFromVars(vars);

      await qc.cancelQueries({ queryKey: ['picoUnit', id] });
      await qc.cancelQueries({ queryKey: ['picoUnits'] });

      const snapshotItem = qc.getQueryData(['picoUnit', id]);
      const snapshotLists = qc.getQueryData(['picoUnits']);

      const prevItem = qc.getQueryData<PicoUnit>(['picoUnit', id]);
      const optimisticItem = opts.applyOptimistic(prevItem, vars);
      if (optimisticItem) {
        qc.setQueryData(['picoUnit', id], optimisticItem);
      }

      if (optimisticItem) {
        updateItemInAllPages(qc, id, () => optimisticItem);
      } else if (prevItem) {
        // If applyOptimistic returns undefined but prevItem exists, we still may need to map partial changes:
        // attempt to call applyOptimistic with prevItem to get a per-item updater (not all callers need this)
        const maybe = opts.applyOptimistic(prevItem, vars);
        if (maybe) updateItemInAllPages(qc, id, () => maybe);
      }

      return { snapshotItem, snapshotLists };
    },
    onError: (_err, vars: Input, context: any) => {
      const id = opts.getIdFromVars(vars);
      if (context?.snapshotItem) {
        qc.setQueryData(['picoUnit', id], context.snapshotItem);
      } else {
        qc.invalidateQueries({ queryKey: ['picoUnit', id] });
      }
      if (context?.snapshotLists) {
        qc.invalidateQueries({ queryKey: ['picoUnits'] });
      }
    },
    onSettled: (_data, _err, vars: Input) => {
      const id = opts.getIdFromVars(vars);
      qc.invalidateQueries({ queryKey: ['picoUnit', id] });
      qc.invalidateQueries({ queryKey: ['picoUnits'] });
    },
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
  toggleControlLoop?: {
    mutate: (vars: { picoUnitId: number; body: ControlLoopDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ControlLoopDto }) => Promise<any>;
    isLoading: boolean;
  };
  changeTargets?: {
    mutate: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => Promise<any>;
    isLoading: boolean;
  };
  changeOutputs?: {
    mutate: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => Promise<any>;
    isLoading: boolean;
  };
};

const PicoUnitContext = createContext<PicoUnitCtx | undefined>(undefined);

/** small helper that applies/merges reading fields safely */
function applyReadingPatch(prev: Readings | undefined, patch: Partial<Readings>): Readings {
  return {
    ...(prev ?? {}),
    ...patch,
  } as Readings;
}

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
  const updateMutation = createOptimisticMutation(qc, {
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
    getIdFromVars: (vars: { picoUnitId: number; body: Partial<UpdatePicoUnitDto> }) =>
      vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      if (!prevItem) return undefined;
      const { body } = vars;
      // merge top-level fields from body into the item (same as previous behaviour)
      return {
        ...prevItem,
        ...body,
      } as PicoUnit;
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

  // -------------------------
  // toggleControlLoop mutation (uses createOptimisticMutation)
  // -------------------------
  const toggleControlLoopMutation = createOptimisticMutation(qc, {
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: ControlLoopDto }) => {
      const res = await unwrap(
        Control.picoUnitIdControlControllerLoop({ picoUnitId, controlLoopDto: body }),
      );
      return res as unknown as ControlLoopDto;
    },
    getIdFromVars: (vars: { picoUnitId: number; body: ControlLoopDto }) => vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      const prev = prevItem;
      const body = vars.body;
      if (!prev) return undefined;
      const patched = applyReadingPatch(prev.latest_reading, {
        control_loop_enabled:
          body.enabled === undefined ? prev.latest_reading?.control_loop_enabled : body.enabled,
      });
      return { ...prev, latest_reading: patched } as PicoUnit;
    },
  });

  // -------------------------
  // changeTargets mutation
  // -------------------------
  const changeTargetsMutation = createOptimisticMutation(qc, {
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: ChangeSetPointsDto }) => {
      const res = await unwrap(
        Control.picoUnitIdControlControllerSetpoints({ picoUnitId, changeSetPointsDto: body }),
      );
      return res as unknown as ChangeSetPointsDto;
    },
    getIdFromVars: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      const prev = prevItem;
      const body = vars.body;
      if (!prev) return undefined;
      const patched = applyReadingPatch(prev.latest_reading, {
        temperature_set: body.temperature ?? prev.latest_reading?.temperature_set,
        humidity_set: body.humidity ?? prev.latest_reading?.humidity_set,
      });
      return { ...prev, latest_reading: patched } as PicoUnit;
    },
  });

  // -------------------------
  // changeOutputs mutation
  // -------------------------
  const changeOutputsMutation = createOptimisticMutation(qc, {
    mutationFn: async ({ picoUnitId, body }: { picoUnitId: number; body: ChangeOutputsDto }) => {
      const res = await unwrap(
        Control.picoUnitIdControlControllerOutputs({ picoUnitId, changeOutputsDto: body }),
      );
      return res as unknown as ChangeOutputsDto;
    },
    getIdFromVars: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => vars.picoUnitId,
    applyOptimistic: (prevItem, vars) => {
      const prev = prevItem;
      const body = vars.body;
      if (!prev) return undefined;
      const patched = applyReadingPatch(prev.latest_reading, {
        humidifier_on:
          body.humidifier === undefined ? prev.latest_reading?.humidifier_on : body.humidifier,
        heater_on: body.heater === undefined ? prev.latest_reading?.heater_on : body.heater,
        fan_on: body.fan === undefined ? prev.latest_reading?.fan_on : body.fan,
      });
      return { ...prev, latest_reading: patched } as PicoUnit;
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
    }),
    [
      pico,
      isLoading,
      isError,
      error,
      refetch,
      updateMutation,
      deleteMutation,
      toggleControlLoopMutation,
      changeTargetsMutation,
      changeOutputsMutation,
    ],
  );

  return <PicoUnitContext.Provider value={value}>{children}</PicoUnitContext.Provider>;
};

export function usePicoUnitContext() {
  const ctx = useContext(PicoUnitContext);
  if (!ctx) throw new Error('usePicoUnitContext must be used within <PicoUnitProvider>');
  return ctx;
}
