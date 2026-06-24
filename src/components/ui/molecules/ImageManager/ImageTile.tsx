import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ClearIcon from '@mui/icons-material/Clear';
import ImageIcon from '@mui/icons-material/Image';
import { Box, Button, CardMedia, IconButton, Stack, Tooltip, Typography } from '@mui/material';

export interface ImageTileProps {
  src: string;
  alt?: string;
  onDelete?: () => void;
}

export function ImageTile({ src, alt, onDelete }: ImageTileProps) {
  return (
    <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
      <CardMedia
        component="img"
        src={src}
        alt={alt}
        sx={{ width: '100%', height: 160, objectFit: 'cover' }}
      />
      {onDelete && (
        <Tooltip title="Remove image">
          <IconButton
            size="small"
            color="error"
            onClick={onDelete}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export interface AddImageTileProps {
  onClick: () => void;
}

export function AddImageTile({ onClick }: AddImageTileProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      onClick={onClick}
      sx={{
        width: '100%',
        height: 160,
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <AddPhotoAlternateIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
      <Typography variant="caption" color="text.secondary">
        Add image
      </Typography>
    </Stack>
  );
}

export interface EmptyImagePlaceholderProps {
  onUpload: () => void;
}

export function EmptyImagePlaceholder({ onUpload }: EmptyImagePlaceholderProps) {
  return (
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
      <Button variant="outlined" size="small" onClick={onUpload}>
        Upload Image
      </Button>
    </Stack>
  );
}
