import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import type { ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams } from '~api/generated';
import { useChartsContext } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';

export const BuildQueryForm: React.FC = () => {
  const { units: picoUnits = [] } = usePicoUnitsContext();
  const { params, setParams } = useChartsContext();

  // local staged params — Partial so we can edit individual fields safely
  const [localParams, setLocalParams] = useState<Partial<ListPicoUnitReadingsParams>>(params ?? {});

  // sync when provider params change
  useEffect(() => {
    setLocalParams(params ?? {});
  }, [params]);

  // Helper: convert local "YYYY-MM-DDTHH:mm" -> ISO string (or undefined)
  const toIsoOrUndefined = (localDatetime?: string | null) =>
    localDatetime ? new Date(localDatetime).toISOString() : undefined;

  const apply = () => {
    const picoUnitId =
      localParams?.picoUnitId != null ? Number(localParams.picoUnitId) : params?.picoUnitId;
    if (!picoUnitId) return;

    // merge provider params with local staged params, converting dates to ISO
    const merged: ListPicoUnitReadingsParams = {
      ...(params ?? {}),
      ...(localParams ?? {}),
      // ensure picoUnitId numeric if present
      picoUnitId,
      // convert start/end from local input string -> ISO (backend expects ISO)
      start: toIsoOrUndefined(localParams?.start as unknown as string) ?? params?.start,
      end: toIsoOrUndefined(localParams?.end as unknown as string) ?? params?.end,
      // page/limit as numbers (fall back to existing)
      page: localParams?.page ?? params?.page,
      limit: localParams?.limit ?? params?.limit,
    };

    setParams(merged);
  };

  // Render helpers / safe values
  const currentPicoUnitValue = String(localParams?.picoUnitId ?? params?.picoUnitId ?? '');
  const currentLimitValue = String(localParams?.limit ?? params?.limit ?? 500);
  const currentStartLocal = maybeIsoToInputLocal(localParams?.start ?? params?.start);
  const currentEndLocal = maybeIsoToInputLocal(localParams?.end ?? params?.end);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
      <FormControl sx={{ minWidth: 240 }}>
        <InputLabel id="pico-unit-selector-label">Pico Unit</InputLabel>
        <Select
          labelId="pico-unit-selector-label"
          id="pico-unit-selector"
          label="Pico Unit"
          value={currentPicoUnitValue}
          onChange={(e: SelectChangeEvent) =>
            setLocalParams((prev) => ({ ...prev, picoUnitId: Number(e.target.value) }))
          }
        >
          {(picoUnits ?? []).map(({ id, name, handle }) => (
            <MenuItem key={id} value={String(id)}>
              {name ?? handle}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Start (local)"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={currentStartLocal}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLocalParams((prev) => ({ ...prev, start: e.target.value }))
        }
      />

      <TextField
        label="End (local)"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={currentEndLocal}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLocalParams((prev) => ({ ...prev, end: e.target.value }))
        }
      />

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id="limit-label">Limit</InputLabel>
        <Select
          labelId="limit-label"
          value={currentLimitValue}
          label="Limit"
          onChange={(e: SelectChangeEvent) =>
            setLocalParams((prev) => ({ ...prev, limit: Number(e.target.value) }))
          }
        >
          {[25, 50, 100, 250, 500].map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <IconButton onClick={apply} aria-label="apply">
        <RefreshIcon />
      </IconButton>

      <Box flex={1} />
    </Stack>
  );
};

/** Helpers below **/

/** Convert Date -> input[type="datetime-local"] string local */
function toInputDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** Convert ISO (or other) date -> input-local string, or empty string if falsy */
function maybeIsoToInputLocal(iso?: string | null): string {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return toInputDatetimeLocal(parsed);
}
