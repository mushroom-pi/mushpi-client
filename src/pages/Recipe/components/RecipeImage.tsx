import { ImageManager, type ImageManagerImage } from '~components';
import { useRecipeContext } from '~ctx/Recipe';
import { resolveApiUrl } from '~utils/apiUrl';

export function RecipeImage() {
  const { recipe, uploadImage, deleteImage } = useRecipeContext();

  if (!recipe) return null;

  const imageUrl = resolveApiUrl(recipe.image_url);
  const hasImage = !!imageUrl;
  const images: ImageManagerImage[] = hasImage ? [{ url: imageUrl!, label: recipe.name }] : [];

  return (
    <ImageManager
      entityName="Recipe"
      maxImages={1}
      remainingSlots={hasImage ? 0 : 1}
      allowHotlink
      images={images}
      uploading={uploadImage.isLoading}
      removing={deleteImage.isLoading}
      onUpload={async ({ files, url }) => {
        await uploadImage.mutateAsync({ recipeId: recipe.id, file: files?.[0], url });
      }}
      onRemove={async () => {
        await deleteImage.mutateAsync(recipe.id);
      }}
    />
  );
}
