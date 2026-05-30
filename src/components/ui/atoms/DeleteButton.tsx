import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type React from 'react';

export const DeleteButton: React.FC<ButtonProps> = ({ children = 'Delete', ...rest }) => (
  <Button color="error" variant="contained" startIcon={<DeleteIcon />} {...rest}>
    {children}
  </Button>
);
