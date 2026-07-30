import { Box, Button, Container, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ErrorProps {
  compact?: boolean;
  item?: string;
  error?: any;
  refetch?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ compact, item, error, refetch }) => {
  const navigate = useNavigate();

  const inner = (
    <>
      <Typography color="error">{`Error loading${item ? ' ' + item : ''}: ${error?.message}`}</Typography>
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        {refetch && <Button onClick={() => refetch()}>Retry</Button>}
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </>
  );

  if (compact) return inner;

  return (
    <Container sx={{ py: 6 }}>
      {inner}
    </Container>
  );
};
