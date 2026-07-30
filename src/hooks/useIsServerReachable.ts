import { useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Monitoring } from '~api/client';
import { serverPingKeys } from '~api/queryKeys';

export const useIsServerReachable = () =>
  useQuery<string, unknown, string>({
    queryKey: serverPingKeys.all,
    queryFn: async () => {
      const res = await unwrap(Monitoring.monitoringControllerPing());
      return res as unknown as string;
    },
    refetchInterval: 30_000,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ['isError', 'isSuccess'],
  });
