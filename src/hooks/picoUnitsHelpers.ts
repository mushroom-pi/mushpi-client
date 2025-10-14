import { QueryClient } from '@tanstack/react-query';

import type { PicoUnit, PicoUnitListResponseDto } from 'src/api/generated';

export function updateItemInAllPages(
  qc: QueryClient,
  itemId: number,
  updater: (item: PicoUnit) => PicoUnit,
) {
  qc.getQueryCache()
    .findAll(['picoUnits'])
    .forEach((entry) => {
      try {
        const current = qc.getQueryData<PicoUnitListResponseDto>(entry.queryKey as any);
        if (!current) return;
        const updated = {
          ...current,
          items: current.items.map((it: PicoUnit) => (it.id === itemId ? updater(it) : it)),
        };
        qc.setQueryData(entry.queryKey as any, updated);
      } catch {
        // ignore pages that don't match shape
      }
    });
}

export function prependItemToFirstPage(qc: QueryClient, newItem: PicoUnit) {
  const key = ['picoUnits', 1, undefined, undefined];
  qc.getQueryCache()
    .findAll(['picoUnits'])
    .forEach((entry) => {
      try {
        const cur = qc.getQueryData<PicoUnitListResponseDto>(entry.queryKey as any);
        if (!cur) return;

        const updated = {
          ...cur,
          items: [newItem, ...cur.items],
          total: cur.total + 1,
        };
        qc.setQueryData(entry.queryKey as any, updated);
      } catch {
        //
      }
    });
}
