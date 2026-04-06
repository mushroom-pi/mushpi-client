import { useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Monitoring } from '~api/client';
import type { HealthCheckResponseDto as ServerHealth } from '~api/generated';
import { serverHealthKeys } from '~api/queryKeys';

export const useServerHealth = () =>
  useQuery<ServerHealth, unknown, ServerHealth>({
    queryKey: serverHealthKeys.all,
    queryFn: async () => {
      const res = await unwrap(Monitoring.monitoringControllerHealth());
      return res as unknown as ServerHealth;
    },
  });
