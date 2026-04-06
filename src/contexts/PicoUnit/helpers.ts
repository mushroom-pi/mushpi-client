import { useMutation, type useQueryClient } from '@tanstack/react-query';

import type { PicoUnit, Readings } from '~api/generated';
import { picoUnitKeys, picoUnitsKeys } from '~api/queryKeys';

export function updateItemInAllPages(
  queryClient: ReturnType<typeof useQueryClient>,
  itemId: number,
  updater: (item: PicoUnit) => PicoUnit,
) {
  const cache = queryClient.getQueryCache();
  const queries = cache.findAll({ queryKey: picoUnitsKeys.all, exact: false, type: 'all' });
  queries.forEach((q) => {
    const cur = queryClient.getQueryData<{ items: PicoUnit[] }>(q.queryKey as any);
    if (!cur?.items) return;
    const updated = { ...cur, items: cur.items.map((it) => (it.id === itemId ? updater(it) : it)) };
    queryClient.setQueryData(q.queryKey as any, updated);
  });
}

export function removeItemFromAllPages(
  queryClient: ReturnType<typeof useQueryClient>,
  itemId: number,
) {
  const cache = queryClient.getQueryCache();
  const queries = cache.findAll({ queryKey: picoUnitsKeys.all, exact: false, type: 'all' });
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
export function createOptimisticMutation<Input, Result = any>(
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

      await qc.cancelQueries({ queryKey: picoUnitKeys.detail(id) });
      await qc.cancelQueries({ queryKey: picoUnitsKeys.all });

      const snapshotItem = qc.getQueryData(picoUnitKeys.detail(id));
      const snapshotLists = qc.getQueryData(picoUnitsKeys.all);

      const prevItem = qc.getQueryData<PicoUnit>(picoUnitKeys.detail(id));
      const optimisticItem = opts.applyOptimistic(prevItem, vars);
      if (optimisticItem) {
        qc.setQueryData(picoUnitKeys.detail(id), optimisticItem);
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
        qc.setQueryData(picoUnitKeys.detail(id), context.snapshotItem);
      } else {
        qc.invalidateQueries({ queryKey: picoUnitKeys.detail(id) });
      }
      if (context?.snapshotLists) {
        qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
      }
    },
    onSettled: (_data, _err, vars: Input) => {
      const id = opts.getIdFromVars(vars);
      qc.invalidateQueries({ queryKey: picoUnitKeys.detail(id) });
      qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
    },
  });
}

/** small helper that applies/merges reading fields safely */
export function applyReadingPatch(prev: Readings | undefined, patch: Partial<Readings>): Readings {
  return {
    ...(prev ?? {}),
    ...patch,
  } as Readings;
}
