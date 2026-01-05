import { Box, Chip, Grid, Stack, Switch, Typography } from '@mui/material';
import type React from 'react';

interface OnOffInputProps {
  label: string;
  value: boolean;
  setter: (v: boolean) => void;
  disabled?: boolean;
}

export const OnOffInput: React.FC<OnOffInputProps> = ({
  label,
  value,
  setter,
  disabled = false,
}) => (
  <Grid container alignItems="center" columnSpacing={2}>
    <Grid size={4}>
      <Typography variant="body2">{label}</Typography>
    </Grid>
    <Grid size={8}>
      <Box display="flex" justifyContent="flex-start" alignItems="center">
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip label="Off" color={value ? 'default' : 'info'} size="medium" />
          <Switch
            checked={value}
            onChange={(e) => setter(e.target.checked)}
            inputProps={{ 'aria-label': 'enabled-toggle' }}
            size="medium"
            disabled={disabled}
          />
          <Chip label="On" color={value ? 'info' : 'default'} size="medium" />
        </Stack>
      </Box>
    </Grid>
  </Grid>
);
