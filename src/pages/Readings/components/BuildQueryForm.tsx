import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  type SxProps,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useMemo, useState } from 'react';

import type { ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams } from '~api/generated';
import { useChartsContext } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';

dayjs.extend(utc);

// Local params: keep start/end strictly Dayjs | null when used in the UI
type LocalParams = Partial<Omit<ListPicoUnitReadingsParams, 'start' | 'end'>> & {
  start?: Dayjs | null;
  end?: Dayjs | null;
};

// ---- layout constants
const DATE_TIME_PICKER_HEIGHT = 48;
const SELECTORS_HEIGHT = DATE_TIME_PICKER_HEIGHT + 8;

// Shared sx that tries to exactly match Select + TextField + Button
const controlSx: SxProps<Theme> = {
  // unify the root input container
  '& .MuiInputBase-root': {
    height: SELECTORS_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  // unify the raw input element padding so text sits at same vertical spot
  '& .MuiInputBase-input': {
    paddingTop: '10px', // tune if needed; aim so text baseline matches Select
    paddingBottom: '10px',
    // keep left/right padding consistent
    paddingLeft: '12px',
    paddingRight: '12px',
    lineHeight: '1.2',
  },
  // helper text reserved
  '& .MuiFormHelperText-root': {
    minHeight: '1.2em',
  },
};

export const BuildQueryForm: React.FC = () => {
  const { units: picoUnits = [] } = usePicoUnitsContext();
  const { params, setParams } = useChartsContext();

  // Initialize localParams converting ISO start/end -> Dayjs | null
  const [localParams, setLocalParams] = useState<LocalParams>(() => ({
    ...(params ?? {}),
    start: params?.start ? dayjs(params.start) : undefined,
    end: params?.end ? dayjs(params.end) : undefined,
  }));

  // sync when provider params change
  useEffect(() => {
    setLocalParams({
      ...(params ?? {}),
      start: params?.start ? dayjs(params.start) : undefined,
      end: params?.end ? dayjs(params.end) : undefined,
    });
  }, [params?.start, params?.end, params?.picoUnitId, params?.page, params?.limit]);

  const dayjsToBackendIso = (d?: Dayjs | null) =>
    d ? dayjs(d).utc().format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;

  const apply = () => {
    const picoUnitId =
      localParams?.picoUnitId != null ? Number(localParams.picoUnitId) : params?.picoUnitId;
    if (!picoUnitId) return;

    const merged: ListPicoUnitReadingsParams = {
      ...(params ?? {}),
      picoUnitId,
      start: dayjsToBackendIso(localParams.start) ?? params?.start,
      end: dayjsToBackendIso(localParams.end) ?? params?.end,
      page: localParams?.page ?? params?.page,
      limit: localParams?.limit ?? params?.limit,
    };

    setParams(merged);
  };

  // validation
  const start = localParams.start ?? null;
  const end = localParams.end ?? null;
  const isEndBeforeStart = useMemo(() => {
    if (!start || !end) return false;
    return end.isBefore(start);
  }, [start, end]);

  const hasPicoUnit = Boolean(localParams?.picoUnitId ?? params?.picoUnitId);
  const isApplyDisabled = !hasPicoUnit || isEndBeforeStart;

  // UI values
  const currentPicoUnitValue = String(localParams?.picoUnitId ?? params?.picoUnitId ?? '');
  const currentLimitValue = String(localParams?.limit ?? params?.limit ?? 500);
  const currentStartValue: Dayjs | null = start;
  const currentEndValue: Dayjs | null = end;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems="center"
      mb={2}
      sx={{ '& > *': { flexShrink: 0 } }}
    >
      {/* Pico Unit select — medium size; match inner padding/height with controlSx */}
      <FormControl sx={{ minWidth: 280, ...controlSx }} size="medium">
        <InputLabel id="pico-unit-selector-label">Pico Unit</InputLabel>
        <Select
          labelId="pico-unit-selector-label"
          id="pico-unit-selector"
          label="Pico Unit"
          value={currentPicoUnitValue}
          size="medium"
          onChange={(e: SelectChangeEvent) =>
            setLocalParams((prev) => ({ ...prev, picoUnitId: Number(e.target.value) }))
          }
          sx={{
            // ensure the displayed select area matches DATE_TIME_PICKER_HEIGHT and padding
            '& .MuiSelect-select': {
              height: SELECTORS_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              paddingTop: 0,
              paddingBottom: 0,
            },
          }}
        >
          {(picoUnits ?? []).map(({ id, name, handle }) => (
            <MenuItem key={id} value={String(id)}>
              {name ?? handle}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText sx={{ minHeight: '1.2em' }}> </FormHelperText>
      </FormControl>

      {/* Start picker — pass controlSx to inner TextField via slotProps */}
      <DateTimePicker
        label="Start (local)"
        value={currentStartValue}
        onChange={(v) => setLocalParams((prev) => ({ ...prev, start: v ?? null }))}
        slotProps={{
          textField: {
            size: 'medium',
            helperText: start && end && start.isAfter(end) ? 'Start must be ≤ End' : ' ',
            sx: controlSx,
          },
        }}
      />

      {/* End picker */}
      <DateTimePicker
        label="End (local)"
        value={currentEndValue}
        onChange={(v) => setLocalParams((prev) => ({ ...prev, end: v ?? null }))}
        slotProps={{
          textField: {
            size: 'medium',
            helperText: isEndBeforeStart ? 'End must be ≥ Start' : ' ',
            sx: controlSx,
          },
        }}
      />

      {/* Limit select */}
      <FormControl sx={{ minWidth: 140, ...controlSx }} size="medium">
        <InputLabel id="limit-label">Limit</InputLabel>
        <Select
          labelId="limit-label"
          value={currentLimitValue}
          label="Limit"
          size="medium"
          onChange={(e: SelectChangeEvent) =>
            setLocalParams((prev) => ({ ...prev, limit: Number(e.target.value) }))
          }
          sx={{
            '& .MuiSelect-select': {
              height: SELECTORS_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              paddingTop: 0,
              paddingBottom: 0,
            },
          }}
        >
          {[25, 50, 100, 250, 500].map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText sx={{ minHeight: '1.2em' }}> </FormHelperText>
      </FormControl>

      <Stack>
        {' '}
        <Button
          variant="contained"
          onClick={apply}
          disabled={isApplyDisabled}
          startIcon={<RefreshIcon />}
          aria-label="apply"
          size="medium"
          sx={{
            minHeight: SELECTORS_HEIGHT,
            height: SELECTORS_HEIGHT,
            paddingLeft: 2,
            paddingRight: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            // ensure icon and text don't shift baseline
            lineHeight: 1,
          }}
        >
          Apply
        </Button>
        <Box flex={1} sx={{ minHeight: '1.2em' }} />
      </Stack>
    </Stack>
  );
};
