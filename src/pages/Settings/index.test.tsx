import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '~ctx/Toast';
import { useDemoMode } from '~hook/useDemoMode';
import {
  DISPLAY_TIMEZONE_STORAGE_KEY,
  setDisplayTimezoneOverrideEnabled,
} from '~utils/displayTime';

import { Settings } from './index';

const apiMocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  health: vi.fn(),
}));

vi.mock('~api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~api/client')>();
  return {
    ...actual,
    Settings: {
      ...actual.Settings,
      settingsControllerGetSettingsV1: apiMocks.getSettings,
      settingsControllerUpdateSettingsV1: apiMocks.updateSettings,
    },
    Monitoring: {
      ...actual.Monitoring,
      monitoringControllerHealth: apiMocks.health,
    },
  };
});

/** Renders the settled environment so tests can wait out the health-loading window. */
function ModeProbe() {
  const { isDemo } = useDemoMode();
  return <span>{isDemo ? 'probe:demo' : 'probe:non-demo'}</span>;
}

function harness() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <ModeProbe />
        <Settings />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

async function pickTimezone(user: ReturnType<typeof userEvent.setup>, option: string) {
  const combobox = await screen.findByRole('combobox');
  await user.click(combobox);
  await user.clear(combobox);
  await user.type(combobox, 'Tokyo');
  await user.click(await screen.findByRole('option', { name: option }));
}

beforeEach(() => {
  apiMocks.getSettings.mockResolvedValue({ data: { timezone: 'UTC' } });
  apiMocks.updateSettings.mockResolvedValue({ data: { timezone: 'Asia/Tokyo' } });
});

afterEach(() => {
  setDisplayTimezoneOverrideEnabled(false);
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Settings page timezone save', () => {
  it('on a non-demo hub, saves via the server PATCH and never touches the stored override', async () => {
    apiMocks.health.mockResolvedValue({ data: { server: { environment: 'prod' } } });
    // Carry-over case: a stored override from a previous demo visit must be
    // ignored — not read, not written — and the server flow must run untouched.
    localStorage.setItem(DISPLAY_TIMEZONE_STORAGE_KEY, 'Europe/Paris');
    const user = userEvent.setup();
    harness();

    expect(await screen.findByText('probe:non-demo')).toBeInTheDocument();

    await pickTimezone(user, 'Asia/Tokyo');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(apiMocks.updateSettings).toHaveBeenCalledWith({
        updateSettingsDto: { timezone: 'Asia/Tokyo' },
      }),
    );
    expect(localStorage.getItem(DISPLAY_TIMEZONE_STORAGE_KEY)).toBe('Europe/Paris');
  });

  it('on a demo hub, saving writes the local override and issues no request at all', async () => {
    apiMocks.health.mockResolvedValue({ data: { server: { environment: 'demo' } } });
    const user = userEvent.setup();
    harness();

    expect(await screen.findByText('probe:demo')).toBeInTheDocument();

    await pickTimezone(user, 'Asia/Tokyo');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Timezone updated')).toBeInTheDocument();
    expect(apiMocks.updateSettings).not.toHaveBeenCalled();
    expect(localStorage.getItem(DISPLAY_TIMEZONE_STORAGE_KEY)).toBe('Asia/Tokyo');
  });
});
