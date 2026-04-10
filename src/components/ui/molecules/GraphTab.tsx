import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const GraphTab = ({ subtitle, children }: { subtitle: string; children: ReactNode }) => (
  <Box
    sx={{
      mt: 1.5,
      px: { xs: 1.5, md: 2 },
      py: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
      {subtitle}
    </Typography>
    {children}
  </Box>
);
