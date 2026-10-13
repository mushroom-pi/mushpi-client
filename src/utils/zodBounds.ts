import { z } from 'zod';

/**
 * Inclusive numeric bounds extracted from a generated Zod schema field.
 * A key is absent when the schema carries no matching inclusive check
 * (e.g. `duration_days` has a minimum but no maximum).
 */
export interface NumericBounds {
  min?: number;
  max?: number;
}

/**
 * Minimal structural view of a zod check `def` (`core.$ZodCheckDef.check`
 * is a plain `string`, so range fields are read through this guard rather
 * than a cast to `any`).
 */
interface RangeCheckDef {
  check: 'greater_than' | 'less_than';
  value: number;
  inclusive: boolean;
}

function isRangeCheck(def: {
  check: string;
  value?: unknown;
  inclusive?: unknown;
}): def is RangeCheckDef {
  return (
    (def.check === 'greater_than' || def.check === 'less_than') &&
    def.inclusive === true &&
    typeof def.value === 'number'
  );
}

/** Peel single-child wrappers (`.optional()`, `.nullable()`, `.nullish()`, `.partial()`) off a schema. */
function unwrapInner(field: z.ZodType): z.ZodType {
  const inner: unknown = (field._def as { innerType?: unknown }).innerType;
  return inner instanceof z.ZodType ? unwrapInner(inner) : field;
}

/**
 * Extract the inclusive numeric `min`/`max` a generated Zod schema encodes,
 * so form `inputProps.min`/`max` and range hints stay in lockstep with the
 * server DTO instead of being hand-copied literals (the 20–90 % humidity bug).
 *
 * Unwraps optional/nullable wrappers first (`.partial()` DTO fields arrive
 * as `ZodOptional`), then scans the remaining `checks` for the inclusive
 * `greater_than` / `less_than` defs zod attaches for `.gte()` / `.lte()`.
 * Format checks (`.int()`) and exclusive bounds (`.gt()` / `.lt()`) are
 * deliberately ignored.
 */
export function numericBounds(field: z.ZodType): NumericBounds {
  const bounds: NumericBounds = {};
  for (const check of unwrapInner(field)._def.checks ?? []) {
    const def = check._zod.def;
    if (!isRangeCheck(def)) continue;
    if (def.check === 'greater_than') bounds.min = def.value;
    else bounds.max = def.value;
  }
  return bounds;
}

/**
 * Human-readable range hint for a number field's `helperText`, phrased to
 * match the bounds the schema actually encodes:
 * `10–90 %` (both), `Minimum 1 day` (min only), `Up to 5 days` (max only).
 */
export function rangeHint(bounds: NumericBounds, unit: string): string {
  const { min, max } = bounds;
  if (min !== undefined && max !== undefined) return `${min}–${max} ${unit}`;
  if (min !== undefined) return `Minimum ${min} ${unit}`;
  if (max !== undefined) return `Up to ${max} ${unit}`;
  return '';
}
