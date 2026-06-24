import ClearIcon from '@mui/icons-material/Clear';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Box, CardMedia, Grid, IconButton, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';

import { AddImageTile, EmptyImagePlaceholder, ImageTile } from './ImageTile';
import { RemoveImageDialog } from './RemoveImageDialog';
import { UploadImageDialog } from './UploadImageDialog';

export interface ImageManagerImage {
  url: string;
  filename?: string;
  label?: string;
}

export interface ImageManagerProps {
  images: ImageManagerImage[];
  remainingSlots: number;
  maxImages: number;
  allowHotlink: boolean;
  entityName: string;
  onUpload: (input: { files?: File[]; url?: string }) => Promise<void>;
  onRemove: (image: ImageManagerImage) => Promise<void>;
  uploading: boolean;
  removing: boolean;
  accept?: string;
  maxSizeMb?: number;
}

function FeatureMode({
  images,
  remainingSlots,
  onOpenUpload,
  onOpenRemove,
  entityName,
}: {
  images: ImageManagerImage[];
  remainingSlots: number;
  onOpenUpload: () => void;
  onOpenRemove: (image: ImageManagerImage) => void;
  entityName: string;
}) {
  const image = images[0];
  const hasImage = !!image;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minHeight: 200,
      }}
    >
      {hasImage ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <CardMedia
            component="img"
            src={image.url}
            alt={image.label ?? entityName}
            sx={{
              maxWidth: '100%',
              maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 1,
              p: 0.5,
            }}
          >
            {remainingSlots > 0 && (
              <Tooltip title="Replace image">
                <IconButton size="small" color="secondary" onClick={onOpenUpload}>
                  <FileUploadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete image">
              <IconButton size="small" color="error" onClick={() => onOpenRemove(image)}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      ) : (
        <EmptyImagePlaceholder onUpload={onOpenUpload} />
      )}
    </Box>
  );
}

function GalleryMode({
  images,
  remainingSlots,
  onOpenUpload,
  onOpenRemove,
  entityName,
}: {
  images: ImageManagerImage[];
  remainingSlots: number;
  onOpenUpload: () => void;
  onOpenRemove: (image: ImageManagerImage) => void;
  entityName: string;
}) {
  if (images.length === 0 && remainingSlots === 0) {
    return <EmptyImagePlaceholder onUpload={onOpenUpload} />;
  }

  return (
    <Grid container spacing={1}>
      {images.map((img) => (
        <Grid key={img.url} size={{ xs: 6 }}>
          <ImageTile
            src={img.url}
            alt={img.label ?? `${entityName} image`}
            onDelete={() => onOpenRemove(img)}
          />
        </Grid>
      ))}
      {remainingSlots > 0 && (
        <Grid size={{ xs: 6 }}>
          <AddImageTile onClick={onOpenUpload} />
        </Grid>
      )}
    </Grid>
  );
}

export function ImageManager({
  images,
  remainingSlots,
  maxImages,
  allowHotlink,
  entityName,
  onUpload,
  onRemove,
  uploading,
  removing,
  accept,
  maxSizeMb,
}: ImageManagerProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ImageManagerImage | null>(null);

  const isFeature = maxImages === 1;

  return (
    <>
      {isFeature ? (
        <FeatureMode
          images={images}
          remainingSlots={remainingSlots}
          onOpenUpload={() => setUploadOpen(true)}
          onOpenRemove={(img) => setRemoveTarget(img)}
          entityName={entityName}
        />
      ) : (
        <GalleryMode
          images={images}
          remainingSlots={remainingSlots}
          onOpenUpload={() => setUploadOpen(true)}
          onOpenRemove={(img) => setRemoveTarget(img)}
          entityName={entityName}
        />
      )}

      <UploadImageDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={onUpload}
        isLoading={uploading}
        allowHotlink={allowHotlink}
        multiple={!isFeature}
        maxFiles={isFeature ? 1 : remainingSlots}
        accept={accept}
        maxSizeMb={maxSizeMb}
        entityName={entityName}
      />

      {removeTarget && (
        <RemoveImageDialog
          open
          onClose={() => setRemoveTarget(null)}
          onConfirm={() => onRemove(removeTarget)}
          isLoading={removing}
          entityName={entityName}
          imageLabel={removeTarget.label ?? removeTarget.filename}
        />
      )}
    </>
  );
}
