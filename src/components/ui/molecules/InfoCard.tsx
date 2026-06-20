import { CardContent, Divider, Card as MuiCard, Stack, Typography } from '@mui/material';
import React from 'react';

import { HeaderAndIcon } from '../atoms/HeaderAndIcon';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Optional action element rendered to the right of the title (e.g. an IconButton). */
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
}) => {
  return (
    <MuiCard>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <HeaderAndIcon title={title} icon={icon} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {headerAction}
          </Stack>
        </Stack>
        <Divider />

        <Stack spacing={1} mt={1.5}>
          {children}
        </Stack>
      </CardContent>
    </MuiCard>
  );
};
