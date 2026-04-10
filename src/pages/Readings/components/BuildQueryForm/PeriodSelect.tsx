import {
  Box,
  FormControl,
  FormHelperText,
  Paper,
  Popper,
  type SxProps,
  type Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useRef } from 'react';

export type RangePreset = 'recent' | '1h' | '6h' | '24h' | '7d' | 'custom';

export type PresetRange = {
  start: Dayjs | null;
  end: Dayjs | null;
};

const getPresetStart = (preset: Exclude<RangePreset, 'custom' | 'recent'>): Dayjs => {
  const now = dayjs();

  switch (preset) {
    case '1h':
      return now.subtract(1, 'hour');
    case '6h':
      return now.subtract(6, 'hour');
    case '24h':
      return now.subtract(24, 'hour');
    case '7d':
      return now.subtract(7, 'day');
    default:
      return now.subtract(24, 'hour');
  }
};

const buildPresetRange = (preset: Exclude<RangePreset, 'custom'>): PresetRange => {
  if (preset === 'recent') {
    return { start: null, end: null };
  }

  return {
    start: getPresetStart(preset),
    end: dayjs(),
  };
};

export const PeriodSelect = ({
  value,
  onSelect,
  isCustomOpen,
  onCustomToggle,
  customContent,
  height,
  sx,
}: {
  value: RangePreset;
  onSelect: (preset: RangePreset, range?: PresetRange) => void;
  isCustomOpen: boolean;
  onCustomToggle: () => void;
  customContent?: React.ReactNode;
  height?: number;
  sx?: SxProps<Theme>;
}) => {
  const customButtonRef = useRef<HTMLButtonElement | null>(null);

  const onChange = (_: React.MouseEvent<HTMLElement>, nextValue: RangePreset | null) => {
    if (!nextValue) {
      if (isCustomOpen) onCustomToggle();
      return;
    }

    if (nextValue === 'custom') {
      onCustomToggle();
      return;
    }

    onSelect(nextValue, buildPresetRange(nextValue));
  };

  return (
    <FormControl sx={{ minWidth: 430, ...sx }} size="medium">
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={onChange}
        aria-label="Quick time ranges"
        size="small"
        sx={{
          flexWrap: 'wrap',
          '& .MuiToggleButton-root': {
            minHeight: height,
            textTransform: 'none',
            px: 1.5,
            borderColor: 'divider',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
          },
          '& .MuiToggleButton-root.Mui-selected': {
            backgroundColor: 'action.selected',
            color: 'text.primary',
          },
        }}
      >
        <ToggleButton value="recent">Most recent</ToggleButton>
        <ToggleButton value="1h">Last 1h</ToggleButton>
        <ToggleButton value="6h">Last 6h</ToggleButton>
        <ToggleButton value="24h">Last 24h</ToggleButton>
        <ToggleButton value="7d">Last 7d</ToggleButton>
        <ToggleButton value="custom" ref={customButtonRef}>
          Custom
        </ToggleButton>
      </ToggleButtonGroup>
      <FormHelperText sx={{ minHeight: '1.2em' }}> </FormHelperText>

      <Popper
        open={isCustomOpen}
        anchorEl={customButtonRef.current}
        placement="bottom"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        <Paper elevation={4} sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Select your time window
          </Typography>
          <Box sx={{ minWidth: { xs: 280, md: 'auto' } }}>{customContent}</Box>
        </Paper>
      </Popper>
    </FormControl>
  );
};
