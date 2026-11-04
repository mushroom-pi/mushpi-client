import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChartsProvider, useChartsContext } from '~ctx/Charts';
import { PicoUnitsProvider, usePicoUnitsContext } from '~ctx/PicoUnits';

import { makePicoUnit } from '../../../../test/fixtures';
import { useBuildQueryForm } from './useBuildQueryForm';

// Mock network at the queryFn boundary (the generated `~api/client` methods).
// The real client would otherwise fire axios requests on mount (both the unit
// list query in PicoUnitsProvider and the readings query in ChartsProvider).
// `unwrap` is stubbed as a pass-through so the mocked method's resolved value
// flows straight through, matching how the hooks consume it.
const { mockListUnits, mockListReadings } = vi.hoisted(() => ({
  mockListUnits: vi.fn(),
  mockListReadings: vi.fn(),
}));

vi.mock('~api/client', () => ({
  PicoUnits: { picoUnitsControllerListV1: mockListUnits },
  Readings: { picoUnitIdReadingsControllerListForUnitV1: mockListReadings },
}));

vi.mock('~api/adapter', () => ({
  unwrap: vi.fn((p: Promise<unknown>) => p),
}));

// useBuildQueryForm pulls in useAsyncWithToast → useToast; stub the toast
// surface so no ToastProvider is needed for the hook to run.
vi.mock('~ctx/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    toast: vi.fn(),
  }),
}));

// Mirrors the Readings page (src/pages/Readings/index.tsx:33,68): ChartsProvider's
// `initialParams.picoUnitId` is DERIVED from the PicoUnits context's
// `selectedUnitId` (fallback to the first unit id, 1). This wiring is the whole
// point of the harness — the one-directional sync effect in ChartsProvider
// (src/contexts/Charts/provider.tsx:53-60) reverts `params.picoUnitId` back to
// `initialParams.picoUnitId` whenever they disagree. Only by driving
// initialParams from selectedUnitId (exactly like the real page) can the test
// reproduce the revert bug: pre-fix `selectedUnitId` never changes, so
// initialParams stays 1 and reverts the dropdown's change; post-fix the write-
// through makes them agree, so no revert happens.
function ChartsBridge({ children }: { children: ReactNode }) {
  const { selectedUnitId } = usePicoUnitsContext();
  return (
    <ChartsProvider initialParams={{ picoUnitId: selectedUnitId ?? 1, points: 200 }}>
      {children}
    </ChartsProvider>
  );
}

function TestWrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={qc}>
      <PicoUnitsProvider>
        <ChartsBridge>{children}</ChartsBridge>
      </PicoUnitsProvider>
    </QueryClientProvider>
  );
}

describe('useBuildQueryForm — pico unit switch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListUnits.mockResolvedValue({
      items: [makePicoUnit({ id: 1 }), makePicoUnit({ id: 2 })],
      total: 2,
    });
    mockListReadings.mockResolvedValue({ data: [] });
  });

  it('applies the newly selected unit to both the Charts and PicoUnits contexts', async () => {
    const { result } = renderHook(
      () => ({
        form: useBuildQueryForm(),
        charts: useChartsContext(),
        pico: usePicoUnitsContext(),
      }),
      { wrapper: TestWrapper },
    );

    // Baseline: charts query is pointed at the initial unit (1); the dropdown
    // has not yet written a selection to the PicoUnits source of truth.
    expect(result.current.charts.params?.picoUnitId).toBe(1);

    // Switch to unit 2 via the dropdown handler.
    await act(async () => {
      result.current.form.onPicoUnitChange(2);
    });

    // (a) The Charts context must keep the new unit — NOT revert to 1. This is
    // the reported bug: pre-fix, `setSelectedUnitId` was never called so the
    // ChartsProvider sync effect flipped params.picoUnitId back to the stale
    // initialParams value.
    await waitFor(() => {
      expect(result.current.charts.params?.picoUnitId).toBe(2);
    });

    // (b) The PicoUnits source of truth must move to the newly selected unit so
    // initialParams agrees (no revert) and the on-change poll effect can fire.
    expect(result.current.pico.selectedUnitId).toBe(2);

    // The readings query for the NEW unit must actually be requested (query key
    // is keyed on params.picoUnitId, so this proves charts/CSV read unit 2).
    await waitFor(() => {
      expect(mockListReadings).toHaveBeenCalledWith(expect.objectContaining({ picoUnitId: 2 }));
    });
  });
});
