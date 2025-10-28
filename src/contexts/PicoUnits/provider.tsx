import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams,
  PicoUnit,
  PicoUnitListResponseDto,
} from '~api/generated';

import { useListPicoUnits } from './hooks';

// adapt import path

type PicoUnitsContextType = {
  units: PicoUnit[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
  getById: (id: string | number) => PicoUnit | undefined;
  updateLocal: (unit: PicoUnit) => void;
  setParams: (p: ListPicoUnitsParams | undefined) => void;
  params?: ListPicoUnitsParams;
  queryData: Omit<PicoUnitListResponseDto, 'items'> | null;
};

const PicoUnitsContext = createContext<PicoUnitsContextType | undefined>(undefined);

function normalizeListResponse(resp?: PicoUnitListResponseDto | null): PicoUnit[] {
  if (!resp) return [];
  const asAny = resp as any;
  if (Array.isArray(asAny)) return asAny;
  if (Array.isArray(asAny.items)) return asAny.items;
  if (Array.isArray(asAny.data)) return asAny.data;
  if (Array.isArray(asAny.results)) return asAny.results;
  // fallback: try to find the first array property
  const firstArray = Object.values(asAny).find((v) => Array.isArray(v));
  if (Array.isArray(firstArray)) return firstArray as any;
  return [];
}

function extractQueryData(
  resp?: PicoUnitListResponseDto | null,
): Omit<PicoUnitListResponseDto, 'items'> | null {
  if (!resp) return null;
  const { page, limit, total, pages } = resp;

  return { page, limit, total, pages };
}

export function PicoUnitsProvider({
  children,
  initialParams,
}: {
  children: ReactNode;
  initialParams?: ListPicoUnitsParams;
}) {
  const [params, setParams] = useState<ListPicoUnitsParams | undefined>(initialParams);

  // useListPicoUnits is your existing hook (react-query). We pass params from state.
  const query = useListPicoUnits(params);

  const rawData = query.data;
  const units = useMemo(() => normalizeListResponse(rawData), [rawData]);
  const queryData = useMemo(() => extractQueryData(rawData), [rawData]);

  // local copy so we can optimistically update view without mutating react-query cache.
  // (You could also use queryClient.setQueryData to update react-query cache instead;
  // this local state approach keeps things simple and immediate.)
  const [localUnits, setLocalUnits] = useState<PicoUnit[] | null>(null);

  // Keep localUnits in sync when fresh data arrives
  React.useEffect(() => {
    if (units.length > 0) {
      setLocalUnits(units);
    } else if (rawData == null) {
      setLocalUnits(null);
    } else {
      // if API returned empty list, set to empty array
      setLocalUnits([]);
    }
  }, [rawData, units]);

  const getById = useCallback(
    (id: string | number) => {
      const list = localUnits ?? units;
      return list.find((u: any) => u?.id === id || u?.uuid === id || u?._id === id);
    },
    [localUnits, units],
  );

  const updateLocal = useCallback(
    (unit: PicoUnit) => {
      setLocalUnits((prev) => {
        const base = prev ?? units;
        const idx = base.findIndex((u: any) => u?.id === unit?.id);
        if (idx === -1) return [unit, ...base];
        const copy = [...base];
        copy[idx] = { ...copy[idx], ...unit };
        return copy;
      });
    },
    [units],
  );

  const refetch = useCallback(async () => {
    // delegate to react-query's refetch
    if (query.refetch) {
      await query.refetch();
    }
    return;
  }, [query]);

  const contextValue: PicoUnitsContextType = useMemo(
    () => ({
      units: localUnits ?? units,
      isLoading: query.isLoading ?? false,
      isError: query.isError ?? false,
      error: query.isError ? query.error : undefined,
      refetch,
      getById,
      updateLocal,
      setParams,
      params,
      queryData,
    }),
    [
      localUnits,
      units,
      query.isLoading,
      query.isError,
      query.error,
      refetch,
      getById,
      updateLocal,
      params,
      queryData,
    ],
  );

  return <PicoUnitsContext.Provider value={contextValue}>{children}</PicoUnitsContext.Provider>;
}

export function usePicoUnitsContext(): PicoUnitsContextType {
  const ctx = useContext(PicoUnitsContext);
  if (!ctx) {
    throw new Error('usePicoUnitsContext must be used inside a PicoUnitsProvider');
  }
  return ctx;
}
