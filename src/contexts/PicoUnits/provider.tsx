import omit from 'lodash/omit';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type {
  PicoUnitsApiPicoUnitsControllerListV1Request as ListPicoUnitsParams,
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

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const getById = useCallback(
    (id: string | number) => {
      return units.find((u: any) => u?.id === id || u?.uuid === id || u?._id === id);
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
      units,
      isLoading: query.isLoading ?? false,
      isError: query.isError ?? false,
      error: query.isError ? query.error : undefined,
      refetch,
      getById,
      setParams,
      params,
      queryData,
      selectedUnitId,
      setSelectedUnitId,
    }),
    [
      units,
      query.isLoading,
      query.isError,
      query.error,
      refetch,
      getById,
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
