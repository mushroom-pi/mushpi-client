import DownloadIcon from '@mui/icons-material/Download';
import { Button, Stack, type SxProps, type Theme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useMemo, useState } from 'react';

import type { ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams } from '~api/generated';
import { useChartsContext } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { useExportPicoUnitReadingsCmd } from '~hook/useReadings';

import { AlignedButton } from './AlignedButton';
import { LimitSelect } from './LimitSelect';
import { PicoUnitSelect } from './PicoUnitSelect';
import { TimeWindowSelect } from './TimeWindowSelect';

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

const resolveBoundaryParam = (
  value: Dayjs | null | undefined,
  previous?: string,
): string | undefined => {
  if (value === null) return undefined;
  if (value === undefined) return previous;
  return dayjsToBackendIso(value);
};

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
  const downloadTooltip =
    !start || !end
      ? 'Select a start and end time window to enable CSV download'
      : 'Download data as CSV file';

  /* UI values */
  const currentPicoUnitValue = String(localParams?.picoUnitId ?? params?.picoUnitId ?? '');
  const currentLimitValue = String(localParams?.limit ?? params?.limit ?? 500);
  const currentStartValue: Dayjs | null = start;
  const currentEndValue: Dayjs | null = end;

  const exportCsv = useExportPicoUnitReadingsCmd();
  const [isFetchingCsv, setIsFetchingCsv] = useState(false);

  /* Actions */

  const update = (overrideParams?: LocalParams) => {
    const source = overrideParams ?? localParams;
    const picoUnitId = source?.picoUnitId != null ? Number(source.picoUnitId) : params?.picoUnitId;
    if (!picoUnitId) return;

    const merged: ListPicoUnitReadingsParams = {
      ...(params ?? {}),
      picoUnitId,
      start: resolveBoundaryParam(source.start, params?.start),
      end: resolveBoundaryParam(source.end, params?.end),
      page: source?.page ?? params?.page,
      limit: source?.limit ?? params?.limit,
    };

    setParams(merged);
  };

  const onUpdateClick = () => {
    update();
  };

  const onApplyPresetRange = (
    _preset: 'recent' | '1h' | '6h' | '24h' | '7d',
    range: { start: Dayjs | null; end: Dayjs | null },
  ) => {
    const nextParams: LocalParams = {
      ...localParams,
      start: range.start,
      end: range.end,
    };

    setLocalParams(nextParams);
    update(nextParams);
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
    <Stack spacing={1.5} mb={0.25} sx={{ '& > *': { flexShrink: 0 } }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
        <PicoUnitSelect
          picoUnits={picoUnits}
          value={currentPicoUnitValue}
          onChange={(val) => setLocalParams((prev) => ({ ...prev, picoUnitId: val }))}
          height={SELECTORS_HEIGHT}
          sx={controlSx}
        />

        <TimeWindowSelect
          start={currentStartValue}
          end={currentEndValue}
          isEndBeforeStart={isEndBeforeStart}
          isUpdateDisabled={isUpdateDisabled}
          onStartChange={(v) => setLocalParams((prev) => ({ ...prev, start: v }))}
          onEndChange={(v) => setLocalParams((prev) => ({ ...prev, end: v }))}
          onUpdateClick={onUpdateClick}
          onApplyPresetRange={onApplyPresetRange}
          height={SELECTORS_HEIGHT}
        />

        <LimitSelect
          value={currentLimitValue}
          onChange={(n) => setLocalParams((prev) => ({ ...prev, limit: n }))}
          height={SELECTORS_HEIGHT}
          sx={controlSx}
        />

        <AlignedButton tooltip={downloadTooltip}>
          <span>
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
          </span>
        </AlignedButton>
      </Stack>
    </Stack>
  );
};
