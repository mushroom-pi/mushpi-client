import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams } from 'src/api/generated';

export type PicoUnitsUIState = ListPicoUnitsParams & {
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
};

const PicoUnitsContext = createContext<PicoUnitsUIState | undefined>(undefined);

export const PicoUnitsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = parseInt(searchParams.get('page') ?? '1', 10);
  const initialLimit = parseInt(searchParams.get('limit') ?? '20', 10);

  const [page, setPageRaw] = useState<number>(initialPage);
  const [limit, setLimitRaw] = useState<number>(initialLimit);

  // keep URL in sync when values change
  useEffect(() => {
    const p = page !== 1 ? String(page) : null;
    const l = limit !== 20 ? String(limit) : null;
    const next = new URLSearchParams();
    if (p) next.set('page', p);
    if (l) next.set('limit', l);
    setSearchParams(next, { replace: true });
  }, [page, limit, setSearchParams]);

  const setPage = (p: number) => setPageRaw(p);
  const setLimit = (l: number) => setLimitRaw(l);

  return (
    <PicoUnitsContext.Provider value={{ page, limit, setPage, setLimit }}>
      {children}
    </PicoUnitsContext.Provider>
  );
};

export function usePicoUnitsUI() {
  const ctx = useContext(PicoUnitsContext);
  if (!ctx) throw new Error('usePicoUnitsUI must be used inside PicoUnitsProvider');
  return ctx;
}
