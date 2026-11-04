import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useDisplayTimezone } from '~hook/useDisplayTimezone';
import {
  DISPLAY_TIMEZONE_STORAGE_KEY,
  setDisplayTimezoneOverrideEnabled,
} from '~utils/displayTime';

afterEach(() => {
  setDisplayTimezoneOverrideEnabled(false);
  localStorage.clear();
});

describe('useDisplayTimezone', () => {
  it('falls back to the browser zone when no override is stored', () => {
    setDisplayTimezoneOverrideEnabled(true);
    const { result } = renderHook(() => useDisplayTimezone());
    expect(result.current.timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(result.current.isOverridden).toBe(false);
  });

  it('reads a stored override on a demo hub', () => {
    setDisplayTimezoneOverrideEnabled(true);
    localStorage.setItem(DISPLAY_TIMEZONE_STORAGE_KEY, 'Europe/Paris');
    const { result } = renderHook(() => useDisplayTimezone());
    expect(result.current.timezone).toBe('Europe/Paris');
    expect(result.current.isOverridden).toBe(true);
  });

  it('persists setTimezone to localStorage and re-renders', () => {
    setDisplayTimezoneOverrideEnabled(true);
    const { result } = renderHook(() => useDisplayTimezone());

    act(() => {
      result.current.setTimezone('Asia/Tokyo');
    });

    expect(localStorage.getItem(DISPLAY_TIMEZONE_STORAGE_KEY)).toBe('Asia/Tokyo');
    expect(result.current.timezone).toBe('Asia/Tokyo');
    expect(result.current.isOverridden).toBe(true);
  });

  it('ignores a stored override when the hub is not demo', () => {
    // The critical carry-over case: a browser that stored an override while on
    // a demo hub must act as if it never existed on a non-demo hub.
    localStorage.setItem(DISPLAY_TIMEZONE_STORAGE_KEY, 'Europe/Paris');
    const { result } = renderHook(() => useDisplayTimezone());
    expect(result.current.timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(result.current.isOverridden).toBe(false);
  });
});
