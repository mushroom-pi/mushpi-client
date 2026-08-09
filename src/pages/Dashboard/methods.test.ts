import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatRelativeFromNow } from '~pages/Dashboard/methods';

describe('formatRelativeFromNow', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for a timestamp 4 seconds ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const fourSecsAgo = new Date('2026-01-01T11:59:56.000Z').toISOString();
    expect(formatRelativeFromNow(fourSecsAgo)).toBe('just now');
  });

  it('returns seconds for a timestamp 30 seconds ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const thirtySecsAgo = new Date('2026-01-01T11:59:30.000Z').toISOString();
    expect(formatRelativeFromNow(thirtySecsAgo)).toContain('seconds');
  });

  it('returns minutes for a timestamp 5 minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const fiveMinsAgo = new Date('2026-01-01T11:55:00.000Z').toISOString();
    expect(formatRelativeFromNow(fiveMinsAgo)).toContain('minutes');
  });

  it('returns hours for a timestamp 2 hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const twoHoursAgo = new Date('2026-01-01T10:00:00.000Z').toISOString();
    expect(formatRelativeFromNow(twoHoursAgo)).toContain('hours');
  });
});
