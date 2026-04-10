import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { TypographyProps } from '@mui/material/Typography';
import type { ReactNode } from 'react';

export const PageTitle = ({
  children,
  actions,
  mb = 2,
  ...props
}: TypographyProps<'h1'> & {
  children: ReactNode;
  actions?: ReactNode;
  mb?: number;
}) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={mb}>
    <Typography variant="h4" component="h1" {...props}>
      {children}
    </Typography>
    {actions ? <Box>{actions}</Box> : null}
  </Box>
);
