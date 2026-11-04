import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getCooldownUntil,
  recordRetryCooldown,
  resetRetryCooldown,
  retryAfterSeconds,
  subscribeRetryCooldown,
} from '~utils/retryCooldown';

function slowDown(headers: unknown): unknown {
  return { response: { status: 429, data: { message: 'Hold on' }, headers } };
}

describe('retryAfterSeconds', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('parses relative seconds', () => {
    expect(retryAfterSeconds(slowDown({ 'retry-after': '30' }))).toBe(30);
  });

  it('reads AxiosHeaders-style get() accessors', () => {
    const headers = { get: (name: string) => (name === 'retry-after' ? '45' : undefined) };
    expect(retryAfterSeconds(slowDown(headers))).toBe(45);
  });

  it('falls back to an HTTP-date', () => {
    expect(retryAfterSeconds(slowDown({ 'retry-after': 'Fri, 16 Oct 2026 12:01:00 GMT' }))).toBe(
      60,
    );
  });

  it('clamps a past HTTP-date to 0', () => {
    expect(retryAfterSeconds(slowDown({ 'retry-after': 'Fri, 16 Oct 2026 11:59:00 GMT' }))).toBe(0);
  });

  it('only arms on 429 — a 403 refusal never starts a cooldown', () => {
    const refusal = { response: { status: 403, data: {}, headers: { 'retry-after': '30' } } };
    expect(retryAfterSeconds(refusal)).toBeNull();
  });

  it('returns null without the header or with unparseable values', () => {
    expect(retryAfterSeconds(slowDown({}))).toBeNull();
    expect(retryAfterSeconds(slowDown({ 'retry-after': 'soon-ish' }))).toBeNull();
    expect(retryAfterSeconds(null)).toBeNull();
    expect(retryAfterSeconds(new Error('network'))).toBeNull();
  });
});

describe('cooldown store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-16T12:00:00Z'));
    resetRetryCooldown();
  });

  afterEach(() => {
    resetRetryCooldown();
    vi.useRealTimers();
  });

  it('records the window and clears it automatically when it expires', () => {
    recordRetryCooldown(10);
    expect(getCooldownUntil()).toBe(Date.now() + 10_000);
    vi.advanceTimersByTime(10_000);
    expect(getCooldownUntil()).toBe(0);
  });

  it('notifies subscribers when a cooldown is armed and when it expires', () => {
    const seen = vi.fn();
    const unsubscribe = subscribeRetryCooldown(seen);

    recordRetryCooldown(5);
    expect(seen).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5_000);
    expect(seen).toHaveBeenCalledTimes(2);

    unsubscribe();
    recordRetryCooldown(5);
    expect(seen).toHaveBeenCalledTimes(2);
  });

  it('re-arming replaces the previous window', () => {
    recordRetryCooldown(10);
    recordRetryCooldown(20);
    vi.advanceTimersByTime(10_000);
    expect(getCooldownUntil()).toBe(Date.now() + 10_000);
    vi.advanceTimersByTime(10_000);
    expect(getCooldownUntil()).toBe(0);
  });

  it('reset clears the window, notifies once, and the cleared timer cannot fire again', () => {
    const seen = vi.fn();
    const unsubscribe = subscribeRetryCooldown(seen);

    recordRetryCooldown(30);
    resetRetryCooldown();
    expect(getCooldownUntil()).toBe(0);
    expect(seen).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(30_000);
    expect(seen).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
