import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

import type { PicoUnit, Readings } from '~api/generated';

/**
 * Returns a complete, properly-typed PicoUnit fixture for testing. The generated
 * `PicoUnit` interface is complete, so the base object type-checks against it
 * directly; `overrides` stays an open bag (tests deliberately shape-poke fields
 * the DTO does not narrow), applied via a single typed merge.
 */
export function makePicoUnit(
  overrides?: Record<string, unknown>,
): PicoUnit & { latest_reading: Readings } {
  const unit: PicoUnit & { latest_reading: Readings } = {
    id: 1,
    created_at: '2026-01-01T00:00:00.000Z',
    handle: 'test-unit',
    name: 'Test Unit',
    host: 'test-unit.local',
    port: 5000,
    monitored: true,
    failed_calls: 0,
    failed_readings: 0,
    consecutive_empty_readings: 0,
    address: 'http://test-unit.local:5000',
    ipAddress: null,
    status: 'healthy',
    api_compatibility: 'compatible',
    // Firmware that reports the version handshake fills both fields; pass
    // { firmware_version: null, api_version: null } in overrides to simulate a
    // legacy unit that hasn't announced since the migration.
    firmware_version: '0.8.4',
    api_version: 1,
    latest_reading: {
      temperature: 25,
      humidity: 80,
      humidifier_on: false,
      fan_on: false,
      heater_on: false,
      temperature_set: 25,
      humidity_set: 80,
      control_loop_enabled: true,
      board_uptime_s: 0,
      board_temp: 42,
      board_used_mem: 100_000,
      board_used_fs: 200_000,
      time_to_response_ms: 120,
    },
  };
  return { ...unit, ...overrides };
}

/**
 * Renders a component wrapped in a QueryClientProvider with a fresh QueryClient.
 * Returns RTL's render result plus the queryClient.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: { queryClient?: QueryClient; [key: string]: unknown },
) {
  const queryClient =
    options?.queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  const { queryClient: _qc, ...restOptions } = options ?? {};
  void _qc;

  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, restOptions),
    queryClient,
  };
}
