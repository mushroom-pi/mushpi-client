import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Returns a minimal PicoUnit-like object for testing.
 * The PicoUnit TS interface is incomplete per AGENTS.md, so we cast as any.
 */
export function makePicoUnit(overrides?: Record<string, unknown>): any {
  return {
    id: 1,
    handle: 'test-unit',
    name: 'Test Unit',
    latest_reading: {
      temperature: 25,
      humidity: 80,
      humidifier_on: false,
      fan_on: false,
      heater_on: false,
      temperature_set: 25,
      humidity_set: 80,
      control_loop_enabled: true,
      ts: '2026-01-01T00:00:00.000Z',
    },
    ...overrides,
  };
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
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
      restOptions,
    ),
    queryClient,
  };
}
