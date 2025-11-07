import { omit } from 'lodash';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams,
  PicoUnit,
  PicoUnitListResponseDto,
} from '~api/generated';

import { useListPicoUnits } from './hooks';

interface PicoUnitsContextValue {
  initialParams?: ListPicoUnitsParams;
}

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
  selectedUnitId: number | null;
  setSelectedUnitId: (id: number | null) => void;
};

const PicoUnitsContext = createContext<PicoUnitsContextType | undefined>(undefined);

export const PicoUnitsProvider = ({
  children,
  initialParams,
}: React.PropsWithChildren<PicoUnitsContextValue>) => {
  const [params, setParams] = useState<ListPicoUnitsParams | undefined>(initialParams);
  const query = useListPicoUnits(params);

  const rawData = query.data;
  const units = useMemo(() => rawData?.items || [], [rawData]);
  const queryData = useMemo(() => omit(rawData, 'items'), [rawData]);

  // local copy so we can optimistically update view without mutating react-query cache.
  // (You could also use queryClient.setQueryData to update react-query cache instead;
  // this local state approach keeps things simple and immediate.)
  const [localUnits, setLocalUnits] = useState<PicoUnit[] | null>(null);

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

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
      selectedUnitId,
      setSelectedUnitId,
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
      selectedUnitId,
      setSelectedUnitId,
    ],
  );

  return <PicoUnitsContext.Provider value={contextValue}>{children}</PicoUnitsContext.Provider>;
};

export function usePicoUnitsContext(): PicoUnitsContextType {
  const ctx = useContext(PicoUnitsContext);
  if (!ctx) {
    throw new Error('usePicoUnitsContext must be used inside a PicoUnitsProvider');
  }
  return ctx;
}
