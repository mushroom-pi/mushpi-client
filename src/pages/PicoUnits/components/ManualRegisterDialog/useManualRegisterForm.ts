import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { unwrap } from '~api/adapter';
import { PicoUnits } from '~api/client';
import type { PicoUnit } from '~api/generated';
import { schemas } from '~api/generated/schemas';
import { picoUnitsKeys } from '~api/queryKeys';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

import type { ManualRegisterDialogProps } from './interfaces';

export function useManualRegisterForm({ onClose, onSuccess }: ManualRegisterDialogProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { run } = useAsyncWithToast();

  const [isPending, setIsPending] = useState(false);
  const [handle, setHandle] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  const isValid = !fieldError;

  const errors = useMemo(() => {
    const result = schemas.CreatePicoUnitDto.safeParse({ handle });
    if (!result.success) {
      return {
        handle: result.error.issues.find((i) => i.path[0] === 'handle')?.message,
      };
    }
    return {};
  }, [handle]);

  const updateHandle = useCallback((value: string) => {
    setHandle(value);
    const result = schemas.CreatePicoUnitDto.safeParse({ handle: value });
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === 'handle')?.message;
      setFieldError(msg);
    } else {
      setFieldError(undefined);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const result = schemas.CreatePicoUnitDto.safeParse({ handle });
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === 'handle')?.message;
      setFieldError(msg);
      return;
    }

    setIsPending(true);

    try {
      await run(
        async () => {
          const created = (await unwrap(
            PicoUnits.picoUnitsControllerCreate({ createPicoUnitDto: { handle } }),
          )) as unknown as PicoUnit;

          await qc.invalidateQueries({ queryKey: picoUnitsKeys.all });

          if (onSuccess) {
            onSuccess(created);
          } else {
            navigate(`/pico-units/${created.id}`, { state: { openEditDialog: true } });
            onClose();
          }
        },
        { rethrow: true, successMessage: 'Unit registered successfully' },
      );
    } catch {
      // error toast already shown by useAsyncWithToast
    } finally {
      setIsPending(false);
    }
  }, [handle, navigate, onClose, onSuccess, qc, run]);

  const reset = useCallback(() => {
    setHandle('');
    setFieldError(undefined);
  }, []);

  return {
    handle,
    updateHandle,
    errors,
    isValid,
    isPending,
    handleSubmit,
    reset,
  };
}
