import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { PicoUnit, PicoUnitListResponseDto } from '~api/generated';
import { picoUnitsKeys } from '~api/queryKeys';
import {
  diffNewUnitIds,
  POLL_FINISH_INTERVAL_MS,
  POLL_FINISH_MAX_ATTEMPTS,
} from '~utils/pico';

export function useNewPicoPoll(
  baselineIds: number[] | null,
  options: { enabled: boolean },
) {
  const qc = useQueryClient();
  const [newUnit, setNewUnit] = useState<PicoUnit | null>(null);
  const [detected, setDetected] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const detectedRef = useRef(false);
  const attemptRef = useRef(0);

  const enabled = options.enabled && baselineIds != null && !detected && !timedOut;

  const query = useQuery<PicoUnitListResponseDto>({
    queryKey: picoUnitsKeys.list({ page: 1, limit: 100 }),
    queryFn: async () => {
      const resp = await unwrap(
        PicoUnits.picoUnitsControllerList({ page: 1, limit: 100 }),
      );
      return resp as unknown as PicoUnitListResponseDto;
    },
    refetchInterval: enabled ? POLL_FINISH_INTERVAL_MS : false,
    enabled,
  });

  // Check for new units whenever data changes
  useEffect(() => {
    if (detectedRef.current || !baselineIds || !query.data) return;

    const currentIds = query.data.items.map((u) => u.id);
    const newIds = diffNewUnitIds(baselineIds, currentIds);

    if (newIds.length > 0) {
      const found = query.data.items.find((u) => u.id === newIds[0]) ?? null;
      detectedRef.current = true;
      setNewUnit(found);
      setDetected(true);
      qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
    } else {
      // Increment attempt counter
      attemptRef.current += 1;
      setAttempt(attemptRef.current);
      if (attemptRef.current >= POLL_FINISH_MAX_ATTEMPTS) {
        setTimedOut(true);
      }
    }
  }, [query.data, baselineIds, qc]);

  // Reset when wizard closes
  useEffect(() => {
    if (!options.enabled) {
      detectedRef.current = false;
      attemptRef.current = 0;
      setNewUnit(null);
      setDetected(false);
      setAttempt(0);
      setTimedOut(false);
    }
  }, [options.enabled]);

  const reset = useCallback(() => {
    detectedRef.current = false;
    attemptRef.current = 0;
    setNewUnit(null);
    setDetected(false);
    setAttempt(0);
    setTimedOut(false);
  }, []);

  return { newUnit, detected, attempt, timedOut, reset };
}
