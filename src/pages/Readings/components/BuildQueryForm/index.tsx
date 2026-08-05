import { Stack, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { ReadingsCsvDownloadButton } from '~components';

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
    isEndBeforeStart,
    isUpdateDisabled,
    isDownloadDisabled,
    downloadTooltip,
    isFetchingCsv,
    onPicoUnitChange,
    onStartChange,
    onEndChange,
    onUpdateClick,
    onApplyPresetRange,
    download,
  } = useBuildQueryForm();

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
          isEndBeforeStart={isEndBeforeStart}
          isUpdateDisabled={isUpdateDisabled}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          onUpdateClick={onUpdateClick}
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
      </Stack>
    </Stack>
  );
};
