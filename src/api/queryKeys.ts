/**
 * Centralized query key factory for React Query.
 * Prevents typos and makes cache invalidation safer.
 *
 * Usage:
 *   queryKey: picoUnitsKeys.list({ page: 1 })
 *   queryKey: picoUnitKeys.detail(123)
 *   queryKey: readingsKeys.list({ picoUnitId: 1, start: '2025-01-01' })
 *   queryKey: recipeKeys.detail(1)
 *   queryKey: batchKeys.list({ status: 'in-progress', picoUnitId: 2 })
 */
import type {
  BatchesApiBatchesControllerListRequest as ListBatchesParams,
  PicoUnitsApiPicoUnitsControllerListRequest as ListPicoUnitsParams,
  RecipesApiRecipesControllerListRequest as ListRecipesParams,
} from './generated';

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
  forUnit: (picoUnitId: number, params?: { page?: number; limit?: number; status?: string }) => {
    const { page = 1, limit = 20, status } = params ?? {};
    return ['batches', 'unit', picoUnitId, page, limit, status] as const;
  },
  currentForUnit: (picoUnitId: number) => ['batches', 'unit', picoUnitId, 'current'] as const,
  readings: (
    batchId: number,
    start?: string | null,
    end?: string | null,
    page?: number,
    limit?: number,
  ) => ['batchReadings', batchId, start || 'none', end || 'none', page ?? 1, limit ?? 500] as const,
};
