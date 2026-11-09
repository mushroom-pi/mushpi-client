import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { HealthCheckResponseDto, ServerDto } from '~api/generated';

import { renderWithProviders } from '../../test/fixtures';
import { Server } from './index';

const apiMocks = vi.hoisted(() => ({ health: vi.fn() }));

vi.mock('~api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~api/client')>();
  return {
    ...actual,
    Monitoring: {
      ...actual.Monitoring,
      monitoringControllerHealth: apiMocks.health,
    },
  };
});

/**
 * A settled, healthy payload. `ServerResourcesCard` dereferences `upTime` and
 * indexes `loadAverage` without guards, so both are always present; the
 * `docsPath` key is the only thing tests vary.
 */
function healthPayload(overrides: Partial<ServerDto> = {}): HealthCheckResponseDto {
  const server: ServerDto = {
    healthy: true,
    environment: 'prod',
    loadAverage: [0.1, 0.2, 0.3],
    memoryUsageInMB: { rss: 100, heapTotal: 50, heapUsed: 40, external: 1, arrayBuffers: 0 },
    upTime: { seconds: 42, minutes: 0, hours: 0, days: 0 },
    nodeVersion: 'v22.1.0',
    appVersion: '0.9.0',
  };
  return { server: { ...server, ...overrides } };
}

/**
 * Renders the page and waits for the health query to settle (the status chip
 * appears only after it resolves). VITE_DOCS_PATH is stubbed per test — the
 * local, gitignored `.env` supplies `contract`, which Vitest loads, so leaving
 * it unstubbed would make the assertions machine-dependent.
 */
async function renderSettledServerPage(docsPathEnv: string, payload: HealthCheckResponseDto) {
  vi.stubEnv('VITE_DOCS_PATH', docsPathEnv);
  apiMocks.health.mockResolvedValue({ data: payload });
  const result = renderWithProviders(<Server />);
  await screen.findByText('Healthy');
  return result;
}

describe('Server page API Docs button', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders the docs link pointing at the server-reported docsPath', async () => {
    await renderSettledServerPage('', healthPayload({ docsPath: 'api-docs' }));

    const link = screen.getByRole('link', { name: 'API Docs' });
    expect(link.getAttribute('href')).toContain('/api-docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('prefers the server-reported docsPath over the build-time fallback', async () => {
    await renderSettledServerPage('contract', healthPayload({ docsPath: 'api-docs' }));

    const link = screen.getByRole('link', { name: 'API Docs' });
    expect(link.getAttribute('href')).toContain('/api-docs');
    expect(link.getAttribute('href')).not.toContain('/contract');
  });

  it('falls back to the build-time docs path when the server reports none', async () => {
    await renderSettledServerPage('contract', healthPayload());

    const link = screen.getByRole('link', { name: 'API Docs' });
    expect(link.getAttribute('href')).toContain('/contract');
  });

  it('hides the button when neither the server path nor the build-time path is set', async () => {
    await renderSettledServerPage('', healthPayload());

    expect(screen.queryByRole('link', { name: 'API Docs' })).not.toBeInTheDocument();
  });
});
