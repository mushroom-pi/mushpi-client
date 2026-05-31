import dayjs from 'dayjs';

import { schemas } from '~api/generated/schemas';

import type { BatchFormErrors, BatchFormFieldValues } from './interfaces';

export const nowDateTimeLocal = () => dayjs().format('YYYY-MM-DDTHH:mm');

export function computeFinishAt(start: string, durationDays: number) {
  return dayjs(start).add(durationDays, 'day').format('YYYY-MM-DDTHH:mm');
}

/** Convert string form values to the types CreateBatchDto expects. */
function toDto(values: BatchFormFieldValues) {
  const num = (v: string) => (v.trim() ? Number(v) : undefined);
  return {
    description: values.description.trim() || undefined,
    temperature_target: num(values.temperatureTarget),
    humidity_target: num(values.humidityTarget),
    notes: values.notes.trim() || undefined,
  };
}

export function validate(values: BatchFormFieldValues): BatchFormErrors {
  const result = schemas.CreateBatchDto.safeParse(toDto(values));
  const errors: BatchFormErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field === 'temperature_target' && !errors.temperatureTarget)
        errors.temperatureTarget = issue.message;
      if (field === 'humidity_target' && !errors.humidityTarget)
        errors.humidityTarget = issue.message;
      if (field === 'description' && !errors.description) errors.description = issue.message;
      if (field === 'notes' && !errors.notes) errors.notes = issue.message;
    }
  }
  return errors;
}
