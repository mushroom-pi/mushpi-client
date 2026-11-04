import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { schemas } from '~api/generated/schemas';
import { numericBounds, rangeHint } from '~utils/zodBounds';

describe('numericBounds', () => {
  it('extracts inclusive gte/lte bounds', () => {
    expect(numericBounds(z.number().gte(10).lte(90))).toEqual({ min: 10, max: 90 });
  });

  it('ignores .int() format checks alongside range checks', () => {
    expect(numericBounds(z.number().int().gte(0).lte(50))).toEqual({ min: 0, max: 50 });
  });

  it('extracts a minimum-only bound', () => {
    expect(numericBounds(z.number().gte(1))).toEqual({ min: 1 });
  });

  it('extracts a maximum-only bound', () => {
    expect(numericBounds(z.number().lte(5))).toEqual({ max: 5 });
  });

  it('unwraps optional()', () => {
    expect(numericBounds(z.number().gte(10).lte(90).optional())).toEqual({ min: 10, max: 90 });
  });

  it('unwraps nullable() and nullish() (nested optional+nullable)', () => {
    expect(numericBounds(z.number().gte(10).lte(90).nullable())).toEqual({ min: 10, max: 90 });
    expect(numericBounds(z.number().gte(10).lte(90).nullish())).toEqual({ min: 10, max: 90 });
  });

  it('returns empty bounds for an unconstrained number', () => {
    expect(numericBounds(z.number())).toEqual({});
  });

  it('ignores exclusive gt/lt (only inclusive gte/lte become bounds)', () => {
    expect(numericBounds(z.number().gt(0).lt(10))).toEqual({});
  });

  describe('cross-check against the real generated DTO schemas', () => {
    const realFields = [
      ['CreateRecipeDto.humidity_target', schemas.CreateRecipeDto.shape.humidity_target],
      ['CreateBatchDto.humidity_target', schemas.CreateBatchDto.shape.humidity_target],
      ['CreateRecipeDto.temperature_target', schemas.CreateRecipeDto.shape.temperature_target],
      ['CreateBatchDto.temperature_target', schemas.CreateBatchDto.shape.temperature_target],
      ['CreateRecipeDto.duration_days', schemas.CreateRecipeDto.shape.duration_days],
    ] as const;

    for (const [name, schema] of realFields) {
      it(`${name}: extracted bounds match what the schema itself accepts`, () => {
        const bounds = numericBounds(schema);
        // Drift-free: assert against the schema's own verdicts, never literals.
        expect(bounds.min ?? bounds.max).toBeDefined();
        if (bounds.min !== undefined) {
          expect(schema.safeParse(bounds.min).success).toBe(true);
          expect(schema.safeParse(bounds.min - 1).success).toBe(false);
        }
        if (bounds.max !== undefined) {
          expect(schema.safeParse(bounds.max).success).toBe(true);
          expect(schema.safeParse(bounds.max + 1).success).toBe(false);
        }
      });
    }
  });
});

describe('rangeHint', () => {
  it('renders a both-bounds range with an en dash', () => {
    expect(rangeHint({ min: 10, max: 90 }, '%')).toBe('10–90 %');
  });

  it('renders a minimum-only hint', () => {
    expect(rangeHint({ min: 1 }, 'day')).toBe('Minimum 1 day');
  });

  it('renders a maximum-only hint', () => {
    expect(rangeHint({ max: 5 }, 'days')).toBe('Up to 5 days');
  });

  it('renders an empty string when there are no bounds', () => {
    expect(rangeHint({}, '%')).toBe('');
  });
});
