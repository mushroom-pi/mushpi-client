import { Button, Container, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface InvalidProps {
  compact?: boolean;
  item?: string;
}

export const Invalid: React.FC<InvalidProps> = ({ compact, item }) => {
  const navigate = useNavigate();

  const inner = (
    <>
      <Typography color="error">{`Invalid${item ? ' ' + item : ''}`}</Typography>
      <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
        Back
      </Button>
    </>
  );

  if (compact) return inner;

  return (
    <Container sx={{ py: 6 }}>
      {inner}
    </Container>
  );
};
