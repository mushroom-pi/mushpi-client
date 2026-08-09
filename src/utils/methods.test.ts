import { describe, expect, it } from 'vitest';

import { percentage } from '~utils/methods';

describe('percentage', () => {
  it('returns 0 when part is 0', () => {
    expect(percentage(0, 100)).toBe(0);
  });

  it('returns 0 when total is 0', () => {
    expect(percentage(100, 0)).toBe(0);
  });

  it('returns 0 when part is NaN', () => {
    expect(percentage(NaN, 100)).toBe(0);
  });

  it('returns 0 when total is NaN', () => {
    expect(percentage(100, NaN)).toBe(0);
  });

  it('returns 0 when part is null', () => {
    expect(percentage(null as unknown as number, 100)).toBe(0);
  });

  it('returns 0 when total is null', () => {
    expect(percentage(50, null as unknown as number)).toBe(0);
  });

  it('calculates a clean percentage', () => {
    expect(percentage(25, 100)).toBe(25);
  });

  it('rounds to 2 decimal places', () => {
    expect(percentage(1, 3)).toBe(33.33);
  });
});
