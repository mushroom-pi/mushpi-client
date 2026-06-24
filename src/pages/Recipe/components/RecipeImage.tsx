import { ImageManager, type ImageManagerImage } from '~components';
import { useRecipeContext } from '~ctx/Recipe';

export function RecipeImage() {
  const { recipe, uploadImage, deleteImage } = useRecipeContext();

  if (!recipe) return null;

  const hasImage = !!recipe.image_url;
  const images: ImageManagerImage[] = hasImage
    ? [{ url: recipe.image_url!, label: recipe.name }]
    : [];

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
