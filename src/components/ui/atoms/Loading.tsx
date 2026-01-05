import { Box, CircularProgress, Container, Typography } from '@mui/material';
import type React from 'react';

interface LoadingProps {
  item?: string;
}

export const Loading: React.FC<LoadingProps> = ({ item }) => (
  <Container sx={{ py: 6 }}>
    <Box display="flex" alignItems="center" gap={2}>
      <CircularProgress />
      <Typography>{`Loading${item ? ' ' + item : ''}…`}</Typography>
    </Box>
  </Container>
);
