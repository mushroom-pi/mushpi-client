import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import type { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { DateTimeField } from '~components';

import { PeriodSelect, type PresetRange, type RangePreset } from './PeriodSelect';

type NonCustomRangePreset = Exclude<RangePreset, 'custom'>;

export const TimeWindowSelect = ({
  start,
  end,
  isEndBeforeStart,
  isUpdateDisabled,
  height,
  onStartChange,
  onEndChange,
  onUpdateClick,
  onApplyPresetRange,
}: {
  start: Dayjs | null;
  end: Dayjs | null;
  isEndBeforeStart: boolean;
  isUpdateDisabled: boolean;
  height: number;
  onStartChange: (v: Dayjs | null) => void;
  onEndChange: (v: Dayjs | null) => void;
  onUpdateClick: () => void;
  onApplyPresetRange: (preset: NonCustomRangePreset, range: PresetRange) => void;
}) => {
  const [rangePreset, setRangePreset] = useState<RangePreset>('recent');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [lastNonCustomPreset, setLastNonCustomPreset] = useState<NonCustomRangePreset>('recent');

  useEffect(() => {
    if (!start && !end) {
      setRangePreset('recent');
      setLastNonCustomPreset('recent');
      return;
    }

    if (!start || !end) {
      setRangePreset('custom');
    }
  }, [start, end]);

  const onPresetSelect = (preset: RangePreset, range?: PresetRange) => {
    if (preset === 'custom') {
      setRangePreset('custom');
      return;
    }

    const resolvedRange: PresetRange = {
      start: range?.start ?? null,
      end: range?.end ?? null,
    };

    setIsCustomOpen(false);
    setLastNonCustomPreset(preset);
    setRangePreset(preset);
    onApplyPresetRange(preset, resolvedRange);
  };

  const onCustomToggle = () => {
    setIsCustomOpen((prev) => {
      if (prev) {
        setRangePreset(lastNonCustomPreset);
      } else {
        setRangePreset('custom');
      }

      return !prev;
    });
  };

  return (
    <PeriodSelect
      value={rangePreset}
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
