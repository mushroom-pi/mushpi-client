import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import { getCooldownUntil, resetRetryCooldown } from '~utils/retryCooldown';

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  toast: vi.fn(),
};

vi.mock('~ctx/Toast', () => ({
  useToast: () => mockToast,
}));

function wrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

describe('useAsyncWithToast', () => {
  it('shows success toast', async () => {
    const { result } = renderHook(() => useAsyncWithToast(), { wrapper });

    await result.current.run(() => Promise.resolve(42), { successMessage: 'Done' });

    expect(mockToast.success).toHaveBeenCalledWith('Done');
  });

  it('shows server error message', async () => {
    const { result } = renderHook(() => useAsyncWithToast(), { wrapper });

    const serverError = { response: { data: { message: 'Conflict' } } };

    // run returns a rejected promise when rethrow is false, so we catch
    await result.current
      .run(() => Promise.reject(serverError), { fallbackErrorMessage: 'Fallback' })
      .catch(() => {});

    expect(mockToast.error).toHaveBeenCalledWith('Conflict');
  });

  it('falls back for non-HTTP errors', async () => {
    const { result } = renderHook(() => useAsyncWithToast(), { wrapper });

    await result.current
      .run(() => Promise.reject(null), { fallbackErrorMessage: 'Fallback' })
      .catch(() => {});

    expect(mockToast.error).toHaveBeenCalledWith('Fallback');
  });

  it('rethrows when rethrow: true and still shows error toast', async () => {
    const { result } = renderHook(() => useAsyncWithToast(), { wrapper });

    await expect(
      result.current.run(() => Promise.reject(new Error('x')), { rethrow: true }),
    ).rejects.toThrow('x');

    expect(mockToast.error).toHaveBeenCalled();
  });
});

describe('useAsyncWithToast cooldown behavior', () => {
  afterEach(() => {
    resetRetryCooldown();
  });

  it('extends the error toast duration and arms the cooldown on 429 + Retry-After', async () => {
    const { result } = renderHook(() => useAsyncWithToast(), { wrapper });
    const slowDown = {
      response: {
        status: 429,
        data: { message: 'Please wait a moment' },
        headers: { 'retry-after': '30' },
      },
    };

    await result.current.run(() => Promise.reject(slowDown)).catch(() => {});

    // the server's sentence renders verbatim; the toast lasts at least as long as the wait
    expect(mockToast.error).toHaveBeenCalledWith('Please wait a moment', 30000);
    expect(getCooldownUntil()).toBeGreaterThan(0);
  });

  it('renders the refusal message verbatim and never arms a cooldown on 403', async () => {
    const { result } = renderHook(() => useAsyncWithToast(), { wrapper });
    const refusal = {
      response: { status: 403, data: { message: 'Changes are not accepted here' } },
    };

    await result.current.run(() => Promise.reject(refusal)).catch(() => {});

    // single-argument call: the standard error toast, no duration extension
    expect(mockToast.error).toHaveBeenCalledWith('Changes are not accepted here');
    expect(getCooldownUntil()).toBe(0);
  });
});
