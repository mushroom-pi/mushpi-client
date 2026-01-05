import EditIcon from '@mui/icons-material/Edit';
import {
  CardContent,
  Divider,
  IconButton,
  Card as MuiCard,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

import { HeaderAndIcon } from '../atoms/HeaderAndIcon';

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
    <MuiCard>
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
    </MuiCard>
  );
};
