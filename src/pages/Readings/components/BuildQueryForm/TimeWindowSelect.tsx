import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';

import { DateTimeField } from '~components';
import type { RangePreset } from '~utils/timeWindow';

import { PeriodSelect, type PresetRange, type RangePreset as PeriodRangePreset } from './PeriodSelect';

type PresetState = RangePreset | 'recent' | 'custom';

export const TimeWindowSelect = ({
  start,
  end,
  rangePreset,
  isEndBeforeStart,
  isUpdateDisabled,
  height,
  onStartChange,
  onEndChange,
  onUpdateClick,
  onPresetChange,
  onApplyPresetRange,
}: {
  start: Dayjs | null;
  end: Dayjs | null;
  rangePreset: PresetState;
  isEndBeforeStart: boolean;
  isUpdateDisabled: boolean;
  height: number;
  onStartChange: (v: Dayjs | null) => void;
  onEndChange: (v: Dayjs | null) => void;
  onUpdateClick: () => void;
  onPresetChange: (preset: PresetState) => void;
  onApplyPresetRange: (preset: 'recent' | RangePreset, range: PresetRange) => void;
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [lastNonCustomPreset, setLastNonCustomPreset] = useState<Exclude<PresetState, 'custom'>>(
    rangePreset === 'custom' ? 'recent' : rangePreset,
  );

  const onPresetSelect = (preset: PeriodRangePreset, range?: PresetRange) => {
    if (preset === 'custom') {
      onPresetChange('custom');
      return;
    }

    const resolvedRange: PresetRange = {
      start: range?.start ?? null,
      end: range?.end ?? null,
    };

    setIsCustomOpen(false);
    setLastNonCustomPreset(preset as Exclude<PresetState, 'custom'>);
    onPresetChange(preset as PresetState);
    onApplyPresetRange(preset as 'recent' | RangePreset, resolvedRange);
  };

  const onCustomToggle = () => {
    setIsCustomOpen((prev) => {
      if (prev) {
        onPresetChange(lastNonCustomPreset);
      } else {
        onPresetChange('custom');
      }

      return !prev;
    });
  };

  return (
    <PeriodSelect
      value={rangePreset as PeriodRangePreset}
      onSelect={onPresetSelect}
      isCustomOpen={isCustomOpen}
      onCustomToggle={onCustomToggle}
      customContent={
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', md: 'flex-start' }}
        >
          <DateTimeField
            label="Start (local)"
            value={start}
            onChange={(v) => onStartChange(v ?? null)}
            helperText={start && end && start.isAfter(end) ? 'Start must be ≤ End' : ' '}
          />

          <DateTimeField
            label="End (local)"
            value={end}
            onChange={(v) => onEndChange(v ?? null)}
            helperText={isEndBeforeStart ? 'End must be ≥ Start' : ' '}
          />

          <Box sx={{ mt: { xs: 0, md: 0.75 }, display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Reload data graphs">
              <span>
                <IconButton onClick={onUpdateClick} disabled={isUpdateDisabled} aria-label="update">
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Stack>
      }
      height={height}
    />
  );
};
