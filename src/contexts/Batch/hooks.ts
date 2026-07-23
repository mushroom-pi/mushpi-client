import { useQuery } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type { Batch } from '~api/generated';
import { batchKeys } from '~api/queryKeys';

export function useGetBatch(batchId: number | null) {
  return useQuery<Batch, unknown, Batch>({
    queryKey: batchKeys.detail(batchId ?? 0),
    queryFn: async () => {
      const res = await unwrap(Batches.batchIdControllerGetOneV1({ batchId: batchId! }));
      return res as unknown as Batch;
    },
    enabled: batchId != null,
  });
}
