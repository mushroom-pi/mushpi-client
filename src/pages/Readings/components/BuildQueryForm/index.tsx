import { Box, Stack, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { ReadingsCsvDownloadButton, RefreshButton } from '~components';
import { useChartsContext } from '~ctx/Charts';
import { usePollPicoUnit } from '~ctx/PicoUnit';

import { AlignedButton } from './AlignedButton';
import { DisplayPointsSelect } from './DisplayPointsSelect';
import { PicoUnitSelect } from './PicoUnitSelect';
import { TimeWindowSelect } from './TimeWindowSelect';
import { useBuildQueryForm } from './useBuildQueryForm';

/* -------------------------
   Layout constants
   ------------------------- */

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
   Component
   ------------------------- */

export const BuildQueryForm: React.FC = () => {
  const {
    picoUnits,
    points,
    setPoints,
    currentPicoUnitValue,
    currentStartValue,
    currentEndValue,
    preset,
    isEndBeforeStart,
    isUpdateDisabled,
    isDownloadDisabled,
    downloadTooltip,
    isFetchingCsv,
    onPicoUnitChange,
    onStartChange,
    onEndChange,
    onUpdateClick,
    onPresetChange,
    onApplyPresetRange,
    download,
  } = useBuildQueryForm();

  const { params } = useChartsContext();
  const pollPico = usePollPicoUnit();

  return (
    <Stack spacing={1.5} mb={0.25} sx={{ '& > *': { flexShrink: 0 } }}>
      <Stack
        direction={{ xs: 'column', xl: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', xl: 'center' }}
      >
        <PicoUnitSelect
          picoUnits={picoUnits}
          value={currentPicoUnitValue}
          onChange={onPicoUnitChange}
          height={SELECTORS_HEIGHT}
          sx={controlSx}
        />

        <TimeWindowSelect
          start={currentStartValue}
          end={currentEndValue}
          rangePreset={preset}
          isEndBeforeStart={isEndBeforeStart}
          isUpdateDisabled={isUpdateDisabled}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          onUpdateClick={onUpdateClick}
          onPresetChange={onPresetChange}
          onApplyPresetRange={onApplyPresetRange}
          height={SELECTORS_HEIGHT}
        />

        <DisplayPointsSelect
          value={points}
          onChange={setPoints}
          height={SELECTORS_HEIGHT}
          sx={controlSx}
        />

        <AlignedButton>
          <ReadingsCsvDownloadButton
            onClick={download}
            isLoading={isFetchingCsv}
            disabled={isDownloadDisabled}
            tooltip={downloadTooltip}
          />
        </AlignedButton>

        <Box sx={{ flexGrow: 1 }} />

        <AlignedButton>
          <RefreshButton
            onClick={() => {
              const id = params?.picoUnitId;
              if (id) pollPico.mutate({ picoUnitId: id });
            }}
            isLoading={pollPico.isPending}
            tooltip="Poll Pico and refresh charts"
          />
        </AlignedButton>
      </Stack>
    </Stack>
  );
};
