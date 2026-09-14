import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { picoUnitKeys } from '~api/queryKeys';

import { makePicoUnit } from '../../test/fixtures';
import { createOptimisticMutation } from './helpers';

// vi.hoisted() ensures the mock ref is available inside the hoisted vi.mock factory
const { mockPollV1 } = vi.hoisted(() => ({ mockPollV1: vi.fn() }));

vi.mock('~api/client', () => ({
  PicoUnits: {
    picoUnitIdControllerPollV1: mockPollV1,
  },
}));

vi.mock('~api/adapter', () => ({
  unwrap: vi.fn((p: Promise<unknown>) => p),
}));

describe('createOptimisticMutation', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    qc.clear();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  }

  const pico = makePicoUnit({ id: 1 });

  function seedCache() {
    qc.setQueryData(picoUnitKeys.detail(1), pico);
  }

  it('stores optimistic value in cache', async () => {
    seedCache();
    // Make poll hang so it doesn't overwrite the optimistic update
    mockPollV1.mockReturnValue(new Promise(() => {}));

    const mutationFn = vi.fn().mockResolvedValue(pico);

    const { result } = renderHook(
      () =>
        createOptimisticMutation(qc, {
          mutationFn,
          getIdFromVars: (v: { picoUnitId: number }) => v.picoUnitId,
          applyOptimistic: (prev, v) =>
            prev
              ? ({
                  ...prev,
                  latest_reading: {
                    ...prev.latest_reading,
                    humidifier_on: (v as any).body.humidifier,
                  },
                } as any)
              : prev,
        }),
      { wrapper },
    );

    await result.current.mutateAsync({
      picoUnitId: 1,
      body: { humidifier: true },
    } as any);

    const cached = qc.getQueryData<any>(picoUnitKeys.detail(1));
    expect(cached.latest_reading.humidifier_on).toBe(true);
  });

  it('rolls back on error', async () => {
    seedCache();
    const originalItem = { ...pico };

    const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));
    mockPollV1.mockResolvedValue(pico);

    const { result } = renderHook(
      () =>
        createOptimisticMutation(qc, {
          mutationFn,
          getIdFromVars: (v: { picoUnitId: number }) => v.picoUnitId,
          applyOptimistic: (prev, v) =>
            prev
              ? ({
                  ...prev,
                  latest_reading: {
                    ...prev.latest_reading,
                    humidifier_on: (v as any).body.humidifier,
                  },
                } as any)
              : prev,
        }),
      { wrapper },
    );

    try {
      await result.current.mutateAsync({
        picoUnitId: 1,
        body: { humidifier: true },
      } as any);
    } catch {
      // expected to throw
    }

    await waitFor(() => {
      const cached = qc.getQueryData<any>(picoUnitKeys.detail(1));
      expect(cached.latest_reading.humidifier_on).toBe(originalItem.latest_reading.humidifier_on);
    });
  });

  it('invalidates on success (poll is called)', async () => {
    seedCache();
    const updatedPico = makePicoUnit({ id: 1 });
    updatedPico.latest_reading.humidifier_on = true;

    const mutationFn = vi.fn().mockResolvedValue(updatedPico);
    mockPollV1.mockResolvedValue(updatedPico);

    const { result } = renderHook(
      () =>
        createOptimisticMutation(qc, {
          mutationFn,
          getIdFromVars: (v: { picoUnitId: number }) => v.picoUnitId,
          applyOptimistic: (prev, v) =>
            prev
              ? ({
                  ...prev,
                  latest_reading: {
                    ...prev.latest_reading,
                    humidifier_on: (v as any).body.humidifier,
                  },
                } as any)
              : prev,
        }),
      { wrapper },
    );

    await result.current.mutateAsync({
      picoUnitId: 1,
      body: { humidifier: true },
    } as any);

    await waitFor(() => {
      expect(mockPollV1).toHaveBeenCalledWith({ picoUnitId: 1 });
    });
  });
});
