import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type React from 'react';

export const EditButton: React.FC<ButtonProps> = ({ children = 'Edit', ...rest }) => (
  <Button color="secondary" variant="contained" startIcon={<EditIcon />} {...rest}>
    {children}
  </Button>
);
