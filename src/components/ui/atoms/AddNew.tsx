import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type React from 'react';

export const AddNew: React.FC<ButtonProps> = ({ children = 'New', ...rest }) => (
  <Button variant="contained" startIcon={<AddIcon />} {...rest}>
    {children}
  </Button>
);
