import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useAsyncWithToast } from '~hook/useAsyncWithToast';

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
