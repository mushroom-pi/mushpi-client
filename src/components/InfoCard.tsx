import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type React from 'react';

import { HeaderAndIcon } from './HeaderAndIcon';

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
          <HeaderAndIcon title={title} icon={icon} />
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        <Divider />

        <Stack spacing={1} mt={1.5}>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
};
