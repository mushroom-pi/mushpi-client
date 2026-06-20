import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { unwrap } from '~api/adapter';
import { PicoUnits, Readings } from '~api/client';
import type { PicoUnit } from '~api/generated';
import { schemas } from '~api/generated/schemas';
import { picoUnitsKeys } from '~api/queryKeys';
import { useToast } from '~ctx/Toast';

import type { AddPicoUnitDialogProps } from './interfaces';

type Step = 'idle' | 'searching';

export function useAddPicoUnitForm({ onClose }: AddPicoUnitDialogProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const [step, setStep] = useState<Step>('idle');
  const [handle, setHandle] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  const isValid = !fieldError;

  const errors = useMemo(() => {
    const result = schemas.UpsertPicoUnitDto.safeParse({ handle });
    if (!result.success) {
      return {
        handle: result.error.issues.find((i) => i.path[0] === 'handle')?.message,
      };
    }
    return {};
  }, [handle]);

  const updateHandle = useCallback((value: string) => {
    setHandle(value);
    const result = schemas.UpsertPicoUnitDto.safeParse({ handle: value });
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === 'handle')?.message;
      setFieldError(msg);
    } else {
      setFieldError(undefined);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    const result = schemas.UpsertPicoUnitDto.safeParse({ handle });
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === 'handle')?.message;
      setFieldError(msg);
      return;
    }

    setStep('searching');

    try {
      const created = (await unwrap(
        PicoUnits.picoUnitsControllerUpsert({ upsertPicoUnitDto: { handle } }),
      )) as unknown as PicoUnit;

      const id = created.id;

      try {
        await unwrap(PicoUnits.picoUnitIdControllerPing({ picoUnitId: id }));
      } catch {
        await unwrap(PicoUnits.picoUnitIdControllerRemove({ picoUnitId: id })).catch(() => {});
        toast.warning('The pico unit could not be found in the local network. Try another handle.');
        setHandle('');
        setFieldError(undefined);
        setStep('idle');
        return;
      }

      await unwrap(Readings.picoUnitIdReadingsControllerPoll({ picoUnitId: id })).catch(() => {});
      await qc.invalidateQueries({ queryKey: picoUnitsKeys.all });

      navigate(`/pico-units/${id}`, { state: { openEditDialog: true } });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add pico unit. Please try again.';
      toast.error(message);
      setStep('idle');
    }
  }, [handle, navigate, onClose, qc, toast]);

  const reset = useCallback(() => {
    setHandle('');
    setFieldError(undefined);
    setStep('idle');
  }, []);

  return {
    handle,
    updateHandle,
    errors,
    isValid,
    step,
    handleSearch,
    reset,
  };
}
