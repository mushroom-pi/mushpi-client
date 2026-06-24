import FileUploadIcon from '@mui/icons-material/FileUpload';
import {
  Box,
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
import { useCallback, useRef, useState } from 'react';

import { useAsyncWithToast } from '~hook/useAsyncWithToast';

export interface UploadImageDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (input: { files?: File[]; url?: string }) => Promise<void>;
  isLoading: boolean;
  allowHotlink: boolean;
  multiple: boolean;
  maxFiles: number;
  accept?: string;
  maxSizeMb?: number;
  entityName: string;
}

export function UploadImageDialog({
  open,
  onClose,
  onUpload,
  isLoading,
  allowHotlink,
  multiple,
  maxFiles,
  accept = 'image/jpeg,image/png',
  maxSizeMb = 5,
  entityName,
}: UploadImageDialogProps) {
  const { run } = useAsyncWithToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'file' | 'url'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = accept.split(',').map((t) => t.trim());

  const filterFiles = useCallback(
    (input: FileList | File[]) => {
      const all = Array.from(input);
      const valid = all.filter((f) => acceptedTypes.some((t) => f.type === t));
      return valid.slice(0, maxFiles);
    },
    [acceptedTypes, maxFiles],
  );

  function reset() {
    setTab('file');
    setFiles([]);
    setUrl('');
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = filterFiles(e.target.files ?? []);
    setFiles(selected);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = filterFiles(e.dataTransfer.files);
    if (dropped.length > 0) setFiles(dropped);
  }

  const canSubmit = tab === 'file' ? files.length > 0 : url.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;

    const input =
      tab === 'file' ? { files: multiple ? files : files.slice(0, 1) } : { url: url.trim() };

    await run(() => onUpload(input), {
      successMessage: `${entityName} image${files.length > 1 ? 's' : ''} uploaded`,
      fallbackErrorMessage: `Failed to upload ${entityName.toLowerCase()} image`,
      onSuccess: () => handleClose(),
    });
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload {entityName} Image</DialogTitle>
      <DialogContent dividers>
        {allowHotlink && (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab value="file" label="Upload File" />
            <Tab value="url" label="Paste URL" />
          </Tabs>
        )}

        {tab === 'file' ? (
          <Stack spacing={2}>
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 1,
                bgcolor: isDragging ? 'action.hover' : 'transparent',
                transition: 'border-color 0.2s, background-color 0.2s',
                textAlign: 'center',
              }}
            >
              <FileUploadIcon
                sx={{ fontSize: 40, color: isDragging ? 'primary.main' : 'text.disabled', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Drag and drop image{multiple ? 's' : ''} here
              </Typography>
              <Button variant="outlined" component="label" size="small" sx={{ mt: 1 }}>
                Choose file{multiple ? 's' : ''}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
            {files.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {files.map((f) => f.name).join(', ')}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              JPEG or PNG, max {maxSizeMb}MB
              {multiple && ` · Up to ${maxFiles} file${maxFiles !== 1 ? 's' : ''}`}
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
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || isLoading}>
          {isLoading ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
