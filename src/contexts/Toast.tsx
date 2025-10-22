import type { AlertColor } from '@mui/material';
import { Alert, Slide, Snackbar } from '@mui/material';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastSeverity = AlertColor;

export type ToastOptions = {
  message: string;
  severity?: ToastSeverity;
  durationMs?: number; // undefined -> default
};

type ToastInternal = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (opts: ToastOptions) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 4000;

export const ToastProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const push = useCallback((opts: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: ToastInternal = {
      id,
      severity: opts.severity ?? 'info',
      message: opts.message,
      durationMs: opts.durationMs ?? DEFAULT_DURATION,
    };
    setToasts((t) => [...t, toast]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (opts) => push(opts),
      success: (message, durationMs) => push({ message, severity: 'success', durationMs }),
      error: (message, durationMs) => push({ message, severity: 'error', durationMs }),
      info: (message, durationMs) => push({ message, severity: 'info', durationMs }),
      warning: (message, durationMs) => push({ message, severity: 'warning', durationMs }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((t) => (
        <Snackbar
          key={t.id}
          open
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={t.durationMs}
          onClose={() => remove(t.id)}
          slots={{ transition: Slide }}
        >
          <Alert
            onClose={() => remove(t.id)}
            severity={t.severity}
            elevation={6}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
