import EditIcon from '@mui/icons-material/Edit';
import {
  CardContent,
  Divider,
  IconButton,
  Card as MuiCard,
  Stack,
  Typography,
} from '@mui/material';
import type React from 'react';

import { HeaderAndIcon } from './HeaderAndIcon';

interface EditableInfoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClickEdit?: () => void;
  /** Extra action elements rendered to the left of the edit button */
  headerActions?: React.ReactNode;
}

export const EditableInfoCard: React.FC<EditableInfoCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  onClickEdit,
  headerActions,
}) => {
  return (
    <MuiCard>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <HeaderAndIcon title={title} icon={icon} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {headerActions}
            <IconButton disabled={!onClickEdit} onClick={onClickEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
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
