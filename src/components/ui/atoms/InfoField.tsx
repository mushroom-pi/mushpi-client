import { Box, Stack, Typography } from '@mui/material';
import type React from 'react';

interface InfoFieldProps {
  label: string;
  extra?: string;
  children: React.ReactNode;
  display?: 'below' | 'beside';
}

export const InfoField: React.FC<InfoFieldProps> = ({
  label,
  extra,
  children,
  display = 'below',
}) => {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ color: 'text.secondary', fontSize: 12 }} mb={0.25} mt={0.5}>
          {label}
        </Typography>
        {extra && <Typography sx={{ fontWeight: 700 }}>{extra}</Typography>}
        {display === 'beside' && children}
      </Stack>
      {display === 'below' && children}
    </Box>
  );
};
