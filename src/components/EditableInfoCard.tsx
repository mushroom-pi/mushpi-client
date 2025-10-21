import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, Divider, IconButton, Stack, Typography } from '@mui/material';
import type React from 'react';

import { HeaderAndIcon } from './HeaderAndIcon';

interface EditableInfoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClickEdit?: () => void;
}

export const EditableInfoCard: React.FC<EditableInfoCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  onClickEdit,
}) => {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <HeaderAndIcon title={title} icon={icon} />
          <IconButton disabled={!onClickEdit} onClick={onClickEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
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
