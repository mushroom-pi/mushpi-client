import { Card, CardContent, Stack, Typography } from '@mui/material';
import type React from 'react';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, icon, children }) => {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography variant="h6">{title}</Typography>
          </Stack>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>

        <Stack spacing={1}>{children}</Stack>
      </CardContent>
    </Card>
  );
};
