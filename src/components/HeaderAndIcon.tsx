import { Stack, Typography } from '@mui/material';
import type React from 'react';

interface HeaderAndIconProps {
  title: string;
  icon?: React.ReactNode;
}

export const HeaderAndIcon: React.FC<HeaderAndIconProps> = ({ title, icon }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {icon}
    <Typography variant="h6">{title}</Typography>
  </Stack>
);
