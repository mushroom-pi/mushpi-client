import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';

import { useRecipeContext } from '~ctx/Recipe';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

export interface UploadImageDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UploadImageDialog({ open, onClose }: UploadImageDialogProps) {
  const { recipe, uploadImage } = useRecipeContext();
  const { run } = useAsyncWithToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

  function reset() {
    setTab('file');
    setFile(null);
    setUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  }

  const canSubmit = tab === 'file' ? !!file : url.trim().length > 0;

  async function handleSubmit() {
    if (!recipe || !canSubmit) return;

    const vars =
      tab === 'file'
        ? { recipeId: recipe.id, file: file! }
        : { recipeId: recipe.id, url: url.trim() };

    await run(() => uploadImage.mutateAsync(vars), {
      successMessage: 'Image uploaded',
      fallbackErrorMessage: 'Failed to upload image',
      onSuccess: () => handleClose(),
    });
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Recipe Image</DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab value="file" label="Upload File" />
          <Tab value="url" label="Paste URL" />
        </Tabs>

        {tab === 'file' ? (
          <Stack spacing={2}>
            <Button variant="outlined" component="label" startIcon={<span>📁</span>}>
              Choose file
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body2" color="text.secondary">
                Selected: {file.name}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              JPEG or PNG, max 5MB
            </Typography>
          </Stack>
        ) : (
          <TextField
            fullWidth
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploadImage.isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || uploadImage.isLoading}
        >
          {uploadImage.isLoading ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
