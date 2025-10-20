import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type React from 'react';

interface EditableInfoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const EditableInfoCard: React.FC<EditableInfoCardProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography variant="h6">{title}</Typography>
          </Stack>

          <EditIcon fontSize="small" />
        </Stack>
        <Divider />

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <Stack spacing={1} mt={1.5}>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
};
