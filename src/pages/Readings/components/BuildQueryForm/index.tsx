import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, IconButton, Stack, type SxProps, type Theme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useMemo, useState } from 'react';

import type { ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams } from '~api/generated';
import { DateTimeField } from '~components';
import { useChartsContext } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { useExportPicoUnitReadingsCmd } from '~hook/useReadings';

import { AlignedButton } from './AlignedButton';
import { LimitSelect } from './LimitSelect';
import { PicoUnitSelect } from './PicoUnitSelect';

dayjs.extend(utc);

/* -------------------------
   Types & layout constants
   ------------------------- */

type LocalParams = Partial<Omit<ListPicoUnitReadingsParams, 'start' | 'end'>> & {
  start?: Dayjs | null;
  end?: Dayjs | null;
};

const DATE_TIME_PICKER_HEIGHT = 48;
const SELECTORS_HEIGHT = DATE_TIME_PICKER_HEIGHT + 8;

const controlSx: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    height: SELECTORS_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  '& .MuiInputBase-input': {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '12px',
    paddingRight: '12px',
    lineHeight: '1.2',
  },
  '& .MuiFormHelperText-root': {
    minHeight: '1.2em',
  },
};

/* -------------------------
   Helpers
   ------------------------- */

const dayjsToBackendIso = (d?: Dayjs | null) =>
  d ? dayjs(d).utc().format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;

const buildInitialLocalParams = (params?: ListPicoUnitReadingsParams): LocalParams => ({
  ...(params ?? {}),
  start: params?.start ? dayjs(params.start) : undefined,
  end: params?.end ? dayjs(params.end) : undefined,
});

export const BuildQueryForm: React.FC = () => {
  const { units: picoUnits = [] } = usePicoUnitsContext();
  const { params, setParams } = useChartsContext();

  // Local params: keep start/end strictly Dayjs | null when used in the UI
  const [localParams, setLocalParams] = useState<LocalParams>(() =>
    buildInitialLocalParams(params),
  );

  // sync when provider params change
  useEffect(() => {
    setLocalParams(buildInitialLocalParams(params));
  }, [params?.start, params?.end, params?.picoUnitId, params?.page, params?.limit]);

  /* validation & flags */
  const start = localParams.start ?? null;
  const end = localParams.end ?? null;
  const isEndBeforeStart = useMemo(() => {
    if (!start || !end) return false;
    return end.isBefore(start);
  }, [start, end]);

  const hasPicoUnit = Boolean(localParams?.picoUnitId ?? params?.picoUnitId);
  const isUpdateDisabled = !hasPicoUnit || isEndBeforeStart;
  const isDownloadDisabled = !start || !end || isUpdateDisabled;

  /* UI values */
  const currentPicoUnitValue = String(localParams?.picoUnitId ?? params?.picoUnitId ?? '');
  const currentLimitValue = String(localParams?.limit ?? params?.limit ?? 500);
  const currentStartValue: Dayjs | null = start;
  const currentEndValue: Dayjs | null = end;

  const exportCsv = useExportPicoUnitReadingsCmd();
  const [isFetchingCsv, setIsFetchingCsv] = useState(false);

  /* Actions */

  const update = () => {
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

  const download = async () => {
    if (!params?.picoUnitId || !start || !end) return;

    setIsFetchingCsv(true);
    try {
      const blob = await exportCsv({
        picoUnitId: params.picoUnitId,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `readings-${params.picoUnitId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsFetchingCsv(false);
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems="center"
      mb={2}
      sx={{ '& > *': { flexShrink: 0 } }}
    >
      <PicoUnitSelect
        picoUnits={picoUnits}
        value={currentPicoUnitValue}
        onChange={(val) => setLocalParams((prev) => ({ ...prev, picoUnitId: val }))}
        height={SELECTORS_HEIGHT}
        sx={controlSx}
      />

      <DateTimeField
        label="Start (local)"
        value={currentStartValue}
        onChange={(v) => setLocalParams((prev) => ({ ...prev, start: v ?? null }))}
        helperText={start && end && start.isAfter(end) ? 'Start must be ≤ End' : ' '}
      />

      <DateTimeField
        label="End (local)"
        value={currentEndValue}
        onChange={(v) => setLocalParams((prev) => ({ ...prev, end: v ?? null }))}
        helperText={isEndBeforeStart ? 'End must be ≥ Start' : ' '}
      />

      <LimitSelect
        value={currentLimitValue}
        onChange={(n) => setLocalParams((prev) => ({ ...prev, limit: n }))}
        height={SELECTORS_HEIGHT}
        sx={controlSx}
      />

      <AlignedButton tooltip="Reload data graphs">
        <span>
          <IconButton onClick={update} disabled={isUpdateDisabled} aria-label="update">
            <RefreshIcon />
          </IconButton>
        </span>
      </AlignedButton>

      <AlignedButton tooltip="Download data as CSV file">
        <Button
          variant="contained"
          onClick={download}
          disabled={isDownloadDisabled || isFetchingCsv}
          startIcon={<DownloadIcon />}
          aria-label="download"
          size="medium"
          color="secondary"
          sx={{
            minHeight: DATE_TIME_PICKER_HEIGHT,
            paddingLeft: 2,
            paddingRight: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {isFetchingCsv ? 'Fetching...' : 'CSV'}
        </Button>
      </AlignedButton>
    </Stack>
  );
};
