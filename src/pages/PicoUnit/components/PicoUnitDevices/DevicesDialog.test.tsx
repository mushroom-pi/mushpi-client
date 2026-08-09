import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ToastProvider } from '~ctx/Toast';

import { DevicesDialog } from './DevicesDialog';
import { makePicoUnit } from '../../../../test/fixtures';

const mockMutateAsync = vi.fn();

vi.mock('~ctx/PicoUnit', () => ({
  usePicoUnitContext: () => ({
    pico: makePicoUnit({
      id: 1,
      latest_reading: {
        temperature: 25,
        humidity: 80,
        humidifier_on: false,
        fan_on: false,
        heater_on: false,
        temperature_set: 25,
        humidity_set: 80,
        control_loop_enabled: false,
        ts: '2026-01-01T00:00:00.000Z',
      },
    }),
    changeOutputs: {
      mutateAsync: mockMutateAsync,
      isLoading: false,
    },
  }),
}));

// Mock useAsyncWithToast to swallow errors (the component doesn't catch rejections)
const mockRun = vi.fn();
vi.mock('~hook/useAsyncWithToast', () => ({
  useAsyncWithToast: () => ({
    run: mockRun,
  }),
}));

function TestWrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

describe('DevicesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: run actually executes the function and handles callbacks
    mockRun.mockImplementation(async (fn: () => Promise<unknown>, opts?: any) => {
      try {
        const result = await fn();
        opts?.onSuccess?.(result);
        return result;
      } catch {
        // Error is swallowed by the mock run
        return undefined;
      }
    });
  });

  it('sends correct payload when all switches toggled on and submitted', async () => {
    mockMutateAsync.mockResolvedValue({});
    const user = userEvent.setup();

    render(<DevicesDialog open={true} onClose={vi.fn()} />, { wrapper: TestWrapper });

    // Find all switches (there are 3: Humidifier, Fan, Heater)
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);

    // Toggle all three ON
    for (const sw of switches) {
      await user.click(sw);
    }

    // Click Save button
    const saveBtn = screen.getByRole('button', { name: /save/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledOnce();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      picoUnitId: 1,
      body: { humidifier: true, fan: true, heater: true },
    });
  });

  it('shows error toast when mutation fails', async () => {
    mockMutateAsync.mockImplementation(async () => {
      throw new Error('Network error');
    });
    const user = userEvent.setup();

    render(<DevicesDialog open={true} onClose={vi.fn()} />, { wrapper: TestWrapper });

    // Toggle a switch to enable submit
    const switches = screen.getAllByRole('switch');
    await user.click(switches[0]);

    // Click Save
    const saveBtn = screen.getByRole('button', { name: /save/i });
    await user.click(saveBtn);

    // The mock run catches the error; verify it was called with fallbackErrorMessage
    await waitFor(() => {
      expect(mockRun).toHaveBeenCalled();
    });

    // Verify the run was called with the fallback error message option
    const runCall = mockRun.mock.calls[0];
    expect(runCall[1]).toMatchObject({
      fallbackErrorMessage: "Failed to change the devices' outputs",
    });
  });

  it('calls onClose after successful submission', async () => {
    mockMutateAsync.mockResolvedValue({});
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<DevicesDialog open={true} onClose={onClose} />, { wrapper: TestWrapper });

    // Toggle a switch to enable submit
    const switches = screen.getAllByRole('switch');
    await user.click(switches[0]);

    // Click Save
    const saveBtn = screen.getByRole('button', { name: /save/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
