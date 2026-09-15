import { describe, expect, it } from 'vitest';

import {
  FIRMWARE_UNKNOWN,
  type FirmwareStatus,
  firmwareCaption,
  firmwareStatus,
} from '~utils/pico';

describe('firmwareStatus', () => {
  it('reports both values when a unit announced with post-versioning firmware', () => {
    const status = firmwareStatus({ firmware_version: '0.8.4', api_version: 1 });
    expect(status).toEqual({ firmware: '0.8.4', apiGeneration: '1', known: true });
  });

  it('maps NULLs (not announced since the server migration) to unknown', () => {
    const status = firmwareStatus({ firmware_version: null, api_version: null });
    expect(status).toEqual({
      firmware: FIRMWARE_UNKNOWN,
      apiGeneration: FIRMWARE_UNKNOWN,
      known: false,
    });
  });

  it('treats undefined fields (legacy payloads predating the fields) as unknown', () => {
    expect(firmwareStatus({})).toEqual({
      firmware: FIRMWARE_UNKNOWN,
      apiGeneration: FIRMWARE_UNKNOWN,
      known: false,
    });
  });

  it('handles a null or undefined unit without throwing', () => {
    expect(firmwareStatus(null).known).toBe(false);
    expect(firmwareStatus(undefined).known).toBe(false);
  });

  it('is not known when only the firmware version is reported', () => {
    const status = firmwareStatus({ firmware_version: '0.8.4', api_version: null });
    expect(status.firmware).toBe('0.8.4');
    expect(status.apiGeneration).toBe(FIRMWARE_UNKNOWN);
    expect(status.known).toBe(false);
  });

  it('is not known when only the API generation is reported', () => {
    const status = firmwareStatus({ firmware_version: null, api_version: 2 });
    expect(status.firmware).toBe(FIRMWARE_UNKNOWN);
    expect(status.apiGeneration).toBe('2');
    expect(status.known).toBe(false);
  });

  it('renders the API generation as a bare integer, never a v-prefixed version', () => {
    expect(firmwareStatus({ firmware_version: '0.8.4', api_version: 12 }).apiGeneration).toBe('12');
  });

  it('treats a blank/whitespace firmware string as unknown', () => {
    expect(firmwareStatus({ firmware_version: '   ', api_version: 1 }).firmware).toBe(
      FIRMWARE_UNKNOWN,
    );
  });
});

describe('firmwareCaption', () => {
  const caption = (fields: Parameters<typeof firmwareStatus>[0]) =>
    firmwareCaption(firmwareStatus(fields));

  it('composes the compact fleet-scan line', () => {
    const status: FirmwareStatus = { firmware: '0.8.4', apiGeneration: '1', known: true };
    expect(firmwareCaption(status)).toBe('Firmware 0.8.4 · API gen 1');
  });

  it('substitutes unknown per field when only one value is missing', () => {
    expect(caption({ firmware_version: null, api_version: 1 })).toBe(
      'Firmware unknown · API gen 1',
    );
    expect(caption({ firmware_version: '0.8.4', api_version: null })).toBe(
      'Firmware 0.8.4 · API gen unknown',
    );
  });

  it('substitutes unknown in both slots for a legacy unit', () => {
    expect(caption({})).toBe('Firmware unknown · API gen unknown');
  });
});
