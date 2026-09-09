import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { PicoUnit, Readings } from '~api/generated';
import { picoUnitKeys, picoUnitsKeys, readingsKeys } from '~api/queryKeys';

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

/**
 * Write a poll result to BOTH caches: the detail query ['picoUnit', id]
 * and every list page ['picoUnits', ...], so navigating back to the list
 * after a poll shows fresh status/last_seen.
 */
export function applyPollResult(
  qc: ReturnType<typeof useQueryClient>,
  picoUnitId: number,
  data: PicoUnit,
) {
  qc.setQueryData(picoUnitKeys.detail(picoUnitId), data);
  updateItemInAllPages(qc, picoUnitId, () => data);
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
 * - snapshot item
 * - apply an optimistic update to ['picoUnit', id] and all list pages
 * - on error restore snapshot or invalidate
 * - on settled poll hardware for live state, then invalidate list/readings;
 *   fall back to DB invalidation if poll fails
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

      return { snapshotItem };
    },
    onError: (_err, vars: Input, context: any) => {
      const id = opts.getIdFromVars(vars);
      if (context?.snapshotItem) {
        qc.setQueryData(picoUnitKeys.detail(id), context.snapshotItem);
      } else {
        qc.invalidateQueries({ queryKey: picoUnitKeys.detail(id) });
      }
      qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
    },
    onSettled: (_data, _err, vars: Input) => {
      const id = opts.getIdFromVars(vars);
      // Fire poll to get live hardware state; don't invalidate detail — the poll's
      // setQueryData provides the authoritative result and we must avoid a stale DB
      // fetch overwriting it.
      unwrap(PicoUnits.picoUnitIdControllerPollV1({ picoUnitId: id }))
        .then((result) => {
          qc.setQueryData(picoUnitKeys.detail(id), result);
          // Now that a fresh reading is stored on the server, invalidate list/readings
          qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
          qc.invalidateQueries({ queryKey: readingsKeys.all, exact: false });
        })
        .catch(() => {
          // Poll failed — fall back to DB data
          qc.invalidateQueries({ queryKey: picoUnitKeys.detail(id) });
          qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
          qc.invalidateQueries({ queryKey: readingsKeys.all, exact: false });
        });
    },
  });
}

/** small helper that applies/merges reading fields safely */
export function applyReadingPatch(
  prev: Readings | null | undefined,
  patch: Partial<Readings>,
): Readings {
  return {
    ...(prev ?? {}),
    ...patch,
  } as Readings;
}
