/**
 * Centralized query key factory for React Query.
 * Prevents typos and makes cache invalidation safer.
 *
 * Usage:
 *   queryKey: picoUnitsKeys.list({ page: 1 })
 *   queryKey: picoUnitKeys.detail(123)
 *   queryKey: readingsKeys.list(1, { kind: 'preset', preset: '1h' }, 200)
 *   queryKey: recipeKeys.detail(1)
 *   queryKey: batchKeys.list({ status: 'in-progress', picoUnitId: 2 })
 */
import type { TimeWindow } from '~utils/timeWindow';

import type {
  BatchesApiBatchesControllerListV1Request as ListBatchesParams,
  PicoUnitsApiPicoUnitsControllerListV1Request as ListPicoUnitsParams,
  RecipesApiRecipesControllerListV1Request as ListRecipesParams,
} from './generated';

export const picoUnitsKeys = {
  all: ['picoUnits'] as const,
  list: (params?: Partial<ListPicoUnitsParams>) => {
    const { page = 1, limit = 20, q, monitored } = params ?? {};
    return ['picoUnits', page, limit, q, monitored] as const;
  },
};

export const picoUnitKeys = {
  all: ['picoUnit'] as const,
  detail: (id: number) => ['picoUnit', id] as const,
};

export const readingsKeys = {
  all: ['picoReadings'] as const,
  list: (picoUnitId: number, timeWindow: TimeWindow, points?: number) =>
    ['picoReadings', picoUnitId, timeWindow, points ?? 200] as const,
  export: (picoUnitId: number, timeWindow: TimeWindow) =>
    ['exportPicoReadings', picoUnitId, timeWindow] as const,
};

export const serverHealthKeys = {
  all: ['serverHealth'] as const,
};

export const serverPingKeys = {
  all: ['serverPing'] as const,
};

export const recipeKeys = {
  all: ['recipes'] as const,
  list: (params?: Partial<ListRecipesParams>) => {
    const { page = 1, limit = 20, species } = params ?? {};
    return ['recipes', page, limit, species] as const;
  },
  detail: (id: number) => ['recipe', id] as const,
  image: (id: number) => ['recipe', id, 'image'] as const,
  batches: (id: number, params?: { page?: number; limit?: number; status?: string }) => {
    const { page = 1, limit = 20, status } = params ?? {};
    return ['recipe', id, 'batches', page, limit, status] as const;
  },
};

export const batchKeys = {
  all: ['batches'] as const,
  list: (params?: Partial<ListBatchesParams>) => {
    const { page = 1, limit = 20, status, picoUnitId, recipeId } = params ?? {};
    return ['batches', page, limit, status, picoUnitId, recipeId] as const;
  },
  detail: (id: number) => ['batch', id] as const,
  images: (id: number) => ['batch', id, 'images'] as const,
  forUnit: (picoUnitId: number, params?: { page?: number; limit?: number; status?: string }) => {
    const { page = 1, limit = 20, status } = params ?? {};
    return ['batches', 'unit', picoUnitId, page, limit, status] as const;
  },
  currentForUnit: (picoUnitId: number) => ['batches', 'unit', picoUnitId, 'current'] as const,
  readings: (batchId: number, start?: string | null, end?: string | null, points?: number) =>
    [
      'batchReadings',
      batchId,
      start || 'none',
      end || 'none',
      points ?? 200,
    ] as const,
};

export const dashboardKeys = {
  all: ['dashboard', 'summary'] as const,
};

export const settingsKeys = {
  all: ['settings'] as const,
};
