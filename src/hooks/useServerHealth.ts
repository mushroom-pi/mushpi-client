import { useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Monitoring } from '~api/client';
import type { HealthCheckResponseDto as ServerHealth } from '~api/generated';

export const useServerHealth = () =>
  useQuery<ServerHealth, unknown, ServerHealth>({
    queryKey: ['serverHealth'] as const,
    queryFn: async () => {
      const res = await unwrap(Monitoring.monitoringControllerHealth());
      return res as unknown as ServerHealth;
    },
  });
