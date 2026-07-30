import { Box, Button, Container, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import sadMushroomSvg from '../../../assets/SadMushroom.svg';

interface ErrorProps {
  compact?: boolean;
  item?: string;
  error?: any;
  refetch?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ compact, item, error, refetch }) => {
  const navigate = useNavigate();

  const errorMessage = error?.message || 'Something went wrong. Please try again.';
  const itemLabel = item ?? 'this page';

  if (compact) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Couldn&apos;t load {itemLabel}. {errorMessage}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {refetch && (
            <Button size="small" variant="contained" onClick={() => refetch()}>
              Try Again
            </Button>
          )}
          <Button size="small" variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <img src={sadMushroomSvg} alt="Sad mushroom" style={{ width: 140, height: 'auto' }} />
        <Typography variant="h5" color="text.primary" sx={{ mt: 3, mb: 1 }}>
          Oops! Couldn&apos;t load {itemLabel}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 400 }}
        >
          {errorMessage}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {refetch && (
            <Button variant="contained" onClick={() => refetch()}>
              Try Again
            </Button>
          )}
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
