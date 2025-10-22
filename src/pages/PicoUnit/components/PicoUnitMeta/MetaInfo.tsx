import { Box, Chip, Stack, Typography } from '@mui/material';
import type React from 'react';

import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { MetaButtons } from './MetaButtons';

type MetaInfoProps = OptionalPicoUnitProps & {
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
};

export const MetaInfo: React.FC<MetaInfoProps> = ({
  pico: dataProp,
  setEditOpen,
  setDeleteOpen,
}) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return;

  const { enabled } = pico;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h4" sx={{ wordBreak: 'break-word' }}>
            {pico.name ?? 'No name'}
          </Typography>
        </Box>

        <MetaButtons setEditOpen={setEditOpen} setDeleteOpen={setDeleteOpen} />
      </Box>

      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start" mb={2}>
        <Chip
          label={enabled ? 'Enabled' : 'Disabled'}
          color={enabled ? 'info' : 'default'}
          size="small"
        />
        <Typography variant="subtitle2" color="text.secondary">
          {pico.handle ?? ''}
        </Typography>
      </Stack>

      <Box mb={3}>
        <Typography variant="body2">{pico.description ?? 'No description'}</Typography>
      </Box>
    </Box>
  );
};
