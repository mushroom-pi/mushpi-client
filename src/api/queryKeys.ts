/**
 * Centralized query key factory for React Query.
 * Prevents typos and makes cache invalidation safer.
 *
 * Usage:
 *   queryKey: picoUnitsKeys.list({ page: 1 })
 *   queryKey: picoUnitKeys.detail(123)
 *   queryKey: readingsKeys.list({ picoUnitId: 1, start: '2025-01-01' })
 */
import type { PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams } from './generated';

export const picoUnitsKeys = {
  all: ['picoUnits'] as const,
  list: (params?: Partial<ListPicoUnitsParams>) => {
    const { page = 1, limit = 20, q } = params ?? {};
    return ['picoUnits', page, limit, q] as const;
  },
};

export const picoUnitKeys = {
  all: ['picoUnit'] as const,
  detail: (id: number) => ['picoUnit', id] as const,
};

export const readingsKeys = {
  all: ['picoReadings'] as const,
  list: (
    picoUnitId: number,
    start?: string | null,
    end?: string | null,
    page?: number,
    limit?: number,
  ) =>
    ['picoReadings', picoUnitId, start || 'none', end || 'none', page ?? 1, limit ?? 500] as const,
  export: (picoUnitId: number, start?: string | null, end?: string | null) =>
    ['exportPicoReadings', picoUnitId, start, end] as const,
};

export const serverHealthKeys = {
  all: ['serverHealth'] as const,
};
