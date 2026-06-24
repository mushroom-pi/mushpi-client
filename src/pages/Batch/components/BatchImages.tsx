import { ImageManager, type ImageManagerImage } from '~components';
import { useBatchContext } from '~ctx/Batch';

export function BatchImages() {
  const { batch, uploadImages, removeImage } = useBatchContext();

  if (!batch) return null;

  const urls = batch.images_url ?? [];
  const filenames = batch.images ?? [];
  const images: ImageManagerImage[] = urls.map((url, i) => ({
    url,
    filename: filenames[i],
  }));

  return (
    <ImageManager
      entityName="Batch"
      maxImages={5}
      remainingSlots={batch.images_left}
      allowHotlink={false}
      images={images}
      uploading={uploadImages.isLoading}
      removing={removeImage.isLoading}
      onUpload={async ({ files }) => {
        await uploadImages.mutateAsync({ batchId: batch.id, images: files ?? [] });
      }}
      onRemove={async (img) => {
        if (img.filename) {
          await removeImage.mutateAsync({ batchId: batch.id, filename: img.filename });
        }
      }}
    />
  );
}
