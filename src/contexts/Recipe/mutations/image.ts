import { useMutation, type useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Images } from '~api/client';
import type { Recipe } from '~api/generated';
import { recipeKeys } from '~api/queryKeys';

export const createUploadRecipeImageMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async ({
      recipeId,
      file,
      url,
    }: {
      recipeId: number;
      file?: File;
      url?: string;
    }) => {
      const res = await unwrap(
        Images.recipeIdImageControllerSetImageV1({ recipeId, image: file, url }),
      );
      return res as unknown as Recipe;
    },
    onSuccess: (_data, { recipeId }) => {
      qc.invalidateQueries({ queryKey: recipeKeys.detail(recipeId) });
      qc.invalidateQueries({ queryKey: recipeKeys.image(recipeId) });
      qc.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });

export const createDeleteRecipeImageMutation = (qc: ReturnType<typeof useQueryClient>) =>
  useMutation({
    mutationFn: async (recipeId: number) => {
      await unwrap(Images.recipeIdImageControllerRemoveImageV1({ recipeId }));
    },
    onSuccess: (_data, recipeId) => {
      qc.invalidateQueries({ queryKey: recipeKeys.detail(recipeId) });
      qc.invalidateQueries({ queryKey: recipeKeys.image(recipeId) });
      qc.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
