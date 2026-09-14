import { ArrowForward } from '@mui/icons-material';
import { Box, Chip, Stack, Typography } from '@mui/material';
import type React from 'react';

import { formatGp } from './picoPinout';

type PinValues = { dht: number; humidifier: number; fan: number; heater: number };

interface MappingPreviewProps {
  current: { pins: PinValues };
  proposed: { pins: PinValues };
}

interface RowProps {
  label: string;
  currentVal: number;
  proposedVal: number;
}

const PreviewRow: React.FC<RowProps> = ({ label, currentVal, proposedVal }) => {
  const changed = currentVal !== proposedVal;

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
      <Typography variant="body2" sx={{ minWidth: 90, fontWeight: 500 }}>
        {label}
      </Typography>
      <Chip label={formatGp(currentVal)} size="small" color="default" variant="outlined" />
      <ArrowForward fontSize="small" color="action" />
      <Chip
        label={formatGp(proposedVal)}
        size="small"
        color={changed ? 'warning' : 'success'}
        variant={changed ? 'filled' : 'outlined'}
      />
      {changed && (
        <Typography variant="caption" color="warning.main">
          changed
        </Typography>
      )}
    </Stack>
  );
};

export const MappingPreview: React.FC<MappingPreviewProps> = ({ current, proposed }) => (
  <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
    <Typography variant="subtitle2" gutterBottom>
      Live Preview
    </Typography>
    <Stack spacing={0.5}>
      <PreviewRow label="DHT11" currentVal={current.pins.dht} proposedVal={proposed.pins.dht} />
      <PreviewRow
        label="Humidifier"
        currentVal={current.pins.humidifier}
        proposedVal={proposed.pins.humidifier}
      />
      <PreviewRow label="Fan" currentVal={current.pins.fan} proposedVal={proposed.pins.fan} />
      <PreviewRow
        label="Heater"
        currentVal={current.pins.heater}
        proposedVal={proposed.pins.heater}
      />
    </Stack>
  </Box>
);
