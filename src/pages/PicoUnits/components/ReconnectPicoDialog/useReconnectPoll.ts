import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { PicoUnitListResponseDto } from '~api/generated';
import { picoUnitsKeys } from '~api/queryKeys';
import {
  isUnitOffline,
  POLL_FINISH_INTERVAL_MS,
  POLL_FINISH_MAX_ATTEMPTS,
} from '~utils/pico';

export function useReconnectPoll(picoUnitId: number | undefined) {
  const qc = useQueryClient();
  const [recovered, setRecovered] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const recoveredRef = useRef(false);
  const attemptRef = useRef(0);

  const enabled = picoUnitId != null && !recovered && !timedOut;

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

  // Check for recovery whenever data changes
  useEffect(() => {
    if (recoveredRef.current || picoUnitId == null || !query.data) return;

    const unit = query.data.items.find((u) => u.id === picoUnitId);
    if (unit && !isUnitOffline(unit)) {
      recoveredRef.current = true;
      setRecovered(true);
      qc.invalidateQueries({ queryKey: picoUnitsKeys.all });
    } else {
      // Increment attempt counter
      attemptRef.current += 1;
      setAttempt(attemptRef.current);
      if (attemptRef.current >= POLL_FINISH_MAX_ATTEMPTS) {
        setTimedOut(true);
      }
    }
  }, [query.data, picoUnitId, qc]);

  // Reset when dialog closes (picoUnitId becomes undefined)
  useEffect(() => {
    if (picoUnitId == null) {
      recoveredRef.current = false;
      attemptRef.current = 0;
      setRecovered(false);
      setAttempt(0);
      setTimedOut(false);
    }
  }, [picoUnitId]);

  const reset = useCallback(() => {
    recoveredRef.current = false;
    attemptRef.current = 0;
    setRecovered(false);
    setAttempt(0);
    setTimedOut(false);
  }, []);

  return { waiting: !recovered && picoUnitId != null && !timedOut, recovered, attempt, timedOut, reset };
}
