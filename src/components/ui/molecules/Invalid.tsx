import { Button, Container, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface InvalidProps {
  item?: string;
}

export const Invalid: React.FC<InvalidProps> = ({ item }) => {
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 6 }}>
      <Typography color="error">{`Invalid${item ? ' ' + item : ''}`}</Typography>
      <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
        Back
      </Button>
    </Container>
  );
};
