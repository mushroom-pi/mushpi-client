import { useCallback } from 'react';

import { useToast } from '~ctx/Toast';

type RunOptions<T = unknown> = {
  successMessage?: string;
  fallbackErrorMessage?: string;
  rethrow?: boolean; // default false
  onSuccess?: (result: T) => void | Promise<void>;
  onError?: (err: unknown) => void | Promise<void>;
};

function extractMessage(err: unknown, fallback = 'Something went wrong'): string {
  try {
    if (!err) return fallback;
    const anyErr = err as any;
    if (anyErr?.response?.data?.message) return String(anyErr.response.data.message);
    if (err instanceof Error && err.message) return err.message;
    if (anyErr?.response?.data) return JSON.stringify(anyErr.response.data);
    if (anyErr?.message) return String(anyErr.message);
    if (typeof err === 'string') return err;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Hook that returns a `run` helper to execute async functions with automatic toast + error handling.
 */
export function useAsyncWithToast() {
  const toast = useToast();

  const run = useCallback(
    async <T = unknown>(fn: () => Promise<T>, opts?: RunOptions<T>): Promise<T> => {
      const {
        successMessage,
        fallbackErrorMessage = 'Failed to complete operation',
        rethrow = false,
        onSuccess,
        onError,
      } = opts ?? {};

      try {
        const result = await fn();
        if (successMessage) toast.success(successMessage);
        if (onSuccess) await onSuccess(result);
        return result;
      } catch (err) {
        const msg = extractMessage(err, fallbackErrorMessage);
        toast.error(msg);
        if (onError) await onError(err);
        if (rethrow) throw err;
        // keep a rejected promise so callers that `await` still get a rejection if they want to handle it
        return Promise.reject(err);
      }
    },
    [toast],
  );

  return { run };
}
