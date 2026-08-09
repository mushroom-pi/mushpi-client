import { Box, Button, Container, Typography } from '@mui/material';
import React from 'react';

import sadMushroomSvg from '~assets/SadMushroom.svg';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary must be a class component — React's error boundary lifecycle methods
 * (getDerivedStateFromError, componentDidCatch) only exist on class components.
 * There is no functional hook equivalent. This is the one intentional exception
 * to the project's functional-components-only convention.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
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
            <img
              src={sadMushroomSvg}
              alt="Sad mushroom"
              style={{ width: 140, height: 'auto' }}
            />
            <Typography variant="h5" color="text.primary" sx={{ mt: 3, mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
              An unexpected error occurred while rendering this page.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
