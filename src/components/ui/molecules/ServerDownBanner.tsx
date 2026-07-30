import { Alert } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';

import { serverPingKeys } from '~api/queryKeys';
import { useIsServerReachable } from '~hook/useIsServerReachable';

export const ServerDownBanner: React.FC = () => {
  const { isError } = useIsServerReachable();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') return;
      const { query } = event;
      // Don't react to the ping query itself (circular)
      if (query.queryKey[0] === 'serverPing') return;
      // Any other query succeeding = server is reachable
      if (query.state.status === 'success') {
        queryClient.setQueryData(serverPingKeys.all, 'pong');
      }
    });
    return unsubscribe;
  }, [queryClient]);

  if (!isError) return null;

  return (
    <Alert severity="warning" variant="filled" sx={{ borderRadius: 0 }}>
      Cannot reach server — check that the Raspberry Pi is running. Data may be stale.
    </Alert>
  );
};
