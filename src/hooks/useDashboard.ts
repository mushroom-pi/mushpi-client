import { useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Dashboard } from '~api/client';
import type { DashboardSummaryDto } from '~api/generated';
import { dashboardKeys } from '~api/queryKeys';

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: async (): Promise<DashboardSummaryDto> => {
      const res = await unwrap(Dashboard.dashboardControllerGetSummaryV1());
      return res as unknown as DashboardSummaryDto;
    },
    refetchInterval: 60_000,
  });
}
