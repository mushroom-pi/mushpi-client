import dayjs from 'dayjs';
import { afterEach, describe, expect, it } from 'vitest';

import {
  DISPLAY_TIMEZONE_STORAGE_KEY,
  displayLocaleString,
  formatInDisplayZone,
  setDisplayTimezoneOverrideEnabled,
} from '~utils/displayTime';

const FIXTURE = '2026-06-15T23:30:00.000Z';

afterEach(() => {
  setDisplayTimezoneOverrideEnabled(false);
  localStorage.clear();
});

describe('displayTime formatters', () => {
  it('take the plain path with the gate closed even when a stored override exists', () => {
    // Non-demo hub (or the health-loading window) with an override left over
    // from a demo hub: formatting must equal the pre-gate code path exactly.
    localStorage.setItem(DISPLAY_TIMEZONE_STORAGE_KEY, 'Asia/Tokyo');

    expect(displayLocaleString(FIXTURE)).toBe(new Date(FIXTURE).toLocaleString());
    expect(formatInDisplayZone(FIXTURE, 'MMM DD HH:mm')).toBe(
      dayjs(FIXTURE).format('MMM DD HH:mm'),
    );
  });

  it('apply the stored override only when the gate is open', () => {
    localStorage.setItem(DISPLAY_TIMEZONE_STORAGE_KEY, 'Asia/Tokyo');
    setDisplayTimezoneOverrideEnabled(true);

    expect(displayLocaleString(FIXTURE)).toBe(
      new Date(FIXTURE).toLocaleString(undefined, { timeZone: 'Asia/Tokyo' }),
    );
    expect(formatInDisplayZone(FIXTURE, 'MMM DD HH:mm')).toBe('Jun 16 08:30');
  });

  it('stay on the plain path when the gate is open but no override is stored', () => {
    setDisplayTimezoneOverrideEnabled(true);

    expect(displayLocaleString(FIXTURE)).toBe(new Date(FIXTURE).toLocaleString());
    expect(formatInDisplayZone(FIXTURE, 'MMM DD HH:mm')).toBe(
      dayjs(FIXTURE).format('MMM DD HH:mm'),
    );
  });

  it('keep the absent-value renderings', () => {
    expect(displayLocaleString(undefined)).toBe('—');
    expect(displayLocaleString(null)).toBe('—');
  });
});
