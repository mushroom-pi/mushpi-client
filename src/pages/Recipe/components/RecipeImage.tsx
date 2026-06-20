import ClearIcon from '@mui/icons-material/Clear';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ImageIcon from '@mui/icons-material/Image';
import { Box, Button, CardMedia, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

import { useRecipeContext } from '~ctx/Recipe';

import { DeleteImageDialog } from './DeleteImageDialog';
import { UploadImageDialog } from './UploadImageDialog';

export function RecipeImage() {
  const { recipe } = useRecipeContext();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!recipe) return null;

  const hasImage = !!recipe.image_url;
  const imageUrl = recipe.image_url ?? undefined;

  return (
    <>
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
              src={imageUrl}
              alt={recipe.name}
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
              <Tooltip title="Replace image">
                <IconButton size="small" color="secondary" onClick={() => setUploadOpen(true)}>
                  <FileUploadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete image">
                <IconButton size="small" color="error" onClick={() => setDeleteOpen(true)}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ) : (
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{
              width: '100%',
              minHeight: 200,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <ImageIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              No image uploaded
            </Typography>
            <Button variant="outlined" size="small" onClick={() => setUploadOpen(true)}>
              Upload Image
            </Button>
          </Stack>
        )}
      </Box>

      <UploadImageDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DeleteImageDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}
