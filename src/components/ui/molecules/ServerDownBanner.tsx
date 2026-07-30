import { Alert } from '@mui/material';
import React from 'react';

import { useIsServerReachable } from '~hook/useIsServerReachable';

export const ServerDownBanner: React.FC = () => {
  const { isError } = useIsServerReachable();

  if (!isError) return null;

  return (
    <Alert severity="warning" variant="filled" sx={{ borderRadius: 0 }}>
      Cannot reach server — check that the Raspberry Pi is running. Data may be stale.
    </Alert>
  );
};
