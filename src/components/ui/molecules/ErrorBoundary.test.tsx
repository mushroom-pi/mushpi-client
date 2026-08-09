import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

vi.mock('~assets/SadMushroom.svg', () => ({ default: 'mock.svg' }));

function Thrower(): React.ReactElement {
  throw new Error('Test crash');
}

describe('ErrorBoundary', () => {
  // Suppress console.error noise from React's error boundary logging
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeVisible();
    expect(screen.getByRole('button', { name: /reload/i })).toBeVisible();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>ok</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('ok')).toBeVisible();
  });

  it('calls window.location.reload when Reload button is clicked', async () => {
    const reloadFn = vi.fn();
    // window.location.reload is non-configurable in jsdom, so we use a workaround
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadFn },
    });

    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: /reload/i }));
    expect(reloadFn).toHaveBeenCalledOnce();
  });
});
