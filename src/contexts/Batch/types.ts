import type { Batch, CreateBatchDto, UpdateBatchDto } from '~api/generated';

export type BatchCtx = {
  batch?: Batch;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
  updateBatch: {
    mutate: (vars: { batchId: number; body: Partial<UpdateBatchDto> }) => void;
    mutateAsync: (vars: { batchId: number; body: Partial<UpdateBatchDto> }) => Promise<Batch>;
    isLoading: boolean;
  };
  deleteBatch: {
    mutate: (id: number) => void;
    mutateAsync: (id: number) => Promise<void>;
    isLoading: boolean;
  };
  createRecipeFromBatch: {
    mutate: (vars: { batchId: number; name: string; notes?: string }) => void;
    mutateAsync: (vars: {
      batchId: number;
      name: string;
      notes?: string;
    }) => Promise<import('~api/generated').Recipe>;
    isLoading: boolean;
  };
  createBatch?: {
    mutate: (body: CreateBatchDto) => void;
    mutateAsync: (body: CreateBatchDto) => Promise<Batch>;
    isLoading: boolean;
  };
  uploadImages: {
    mutate: (vars: { batchId: number; images: File[] }) => void;
    mutateAsync: (vars: { batchId: number; images: File[] }) => Promise<Batch>;
    isLoading: boolean;
  };
  removeImage: {
    mutate: (vars: { batchId: number; filename: string }) => void;
    mutateAsync: (vars: { batchId: number; filename: string }) => Promise<void>;
    isLoading: boolean;
  };
};
