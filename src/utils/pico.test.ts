import { describe, expect, it } from 'vitest';

import type { DashboardUnitItemDto, PicoUnit, PollPicoUnitResponseDto } from '~api/generated';
import {
  type CompatibilityStatus,
  FIRMWARE_UNKNOWN,
  type FirmwareStatus,
  compatibilityStatus,
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

describe('compatibilityStatus', () => {
  it('passes through a server "compatible" verdict', () => {
    expect(compatibilityStatus({ api_compatibility: 'compatible' })).toBe('compatible');
  });

  it('passes through a server "incompatible" verdict', () => {
    expect(compatibilityStatus({ api_compatibility: 'incompatible' })).toBe('incompatible');
  });

  it('passes through an explicit server "unknown" verdict', () => {
    expect(compatibilityStatus({ api_compatibility: 'unknown' })).toBe('unknown');
  });

  it('treats an absent field (older server that omits it) as unknown, never re-deriving a verdict', () => {
    expect(compatibilityStatus({})).toBe('unknown');
  });

  it('treats a null api_compatibility value as unknown', () => {
    expect(compatibilityStatus({ api_compatibility: null })).toBe('unknown');
  });

  it('never invents a range check from a null api_version — trusts the server verdict', () => {
    // A unit with NO api_version but a server "incompatible" verdict still reads incompatible:
    // the client does not compare api_version against any minimum/maximum.
    expect(compatibilityStatus({ api_compatibility: 'incompatible', api_version: null })).toBe(
      'incompatible',
    );
  });

  it('ignores api_version entirely — the verdict is server-owned', () => {
    // An absurd api_version does not flip a "compatible" verdict: no client-side range logic.
    expect(compatibilityStatus({ api_compatibility: 'compatible', api_version: 999_999 })).toBe(
      'compatible',
    );
    expect(compatibilityStatus({ api_compatibility: 'unknown', api_version: 1 })).toBe('unknown');
  });

  it('collapses an unrecognised verdict string to unknown (warning-only safety)', () => {
    expect(compatibilityStatus({ api_compatibility: 'definitely-broken' })).toBe('unknown');
  });

  it('handles a null or undefined unit without throwing', () => {
    expect(compatibilityStatus(null)).toBe('unknown');
    expect(compatibilityStatus(undefined)).toBe('unknown');
  });
});

// ── Compile-time contract guard ─────────────────────────────────────────────────────────
// `CompatibilityStatus` is *derived* from the server's generated `api_compatibility` enum
// (see src/utils/pico.ts) rather than hand-copied. The helpers below are erased at runtime
// but are checked by `tsc -b`, so they run on every `yarn build`: if the contract ever gains
// a state, the client alias follows automatically (it's a type alias, not a re-declaration),
// and these assertions lock the alias to the exact generated field type and prove it is a
// closed union. They are NOT a runtime behaviour test — they exist so a future hand-widening
// (e.g. someone re-typing the alias to `string`) is caught by the compiler, not a green suite.

/** Exact type identity (non-distributive — the classic conditional-wrapping trick). */
type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

/**
 * Compile-time assertion: the generic is constrained to `true`, so any call whose argument
 * resolves to anything else (e.g. `false` when a value drifts out of the union) fails `tsc`.
 * The optional `_proof` param and empty body keep it free at runtime; `_`-prefix exempts it
 * from `noUnusedParameters`.
 */
function assertContractHolds<T extends true>(_proof?: T): void {
  // intentionally empty — type-level guard only
}

describe('CompatibilityStatus ↔ server api_compatibility contract (compile-time guard)', () => {
  it('locks the derived alias to the generated DTO field types', () => {
    // The alias IS PicoUnit.api_compatibility, so this pair is identical by construction —
    // a trivially-true anchor check. The other two DTOs each declare their own
    // structurally-identical enum, so these are the load-bearing cross-checks: every site the
    // badge reads the verdict from must agree with the client alias, or the build breaks.
    assertContractHolds<Equals<CompatibilityStatus, PicoUnit['api_compatibility']>>();
    assertContractHolds<Equals<CompatibilityStatus, DashboardUnitItemDto['api_compatibility']>>();
    assertContractHolds<
      Equals<CompatibilityStatus, PollPicoUnitResponseDto['api_compatibility']>
    >();
    expect(true).toBe(true); // satisfies the runtime `it` body; the real check is at compile time
  });

  it('rejects an out-of-contract literal (union is closed, never widened to string)', () => {
    // @ts-expect-error a value the server never emits must NOT be assignable to CompatibilityStatus
    const notAStatus: CompatibilityStatus = 'a_value_the_server_never_emits';
    expect(notAStatus).toBeDefined(); // runtime reference only — keeps `noUnusedLocals` satisfied
  });
});
