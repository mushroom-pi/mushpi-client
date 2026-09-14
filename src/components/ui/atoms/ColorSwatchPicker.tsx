import ClearIcon from '@mui/icons-material/Clear';
import { Box, Tooltip } from '@mui/material';
import React from 'react';

/* eslint-disable no-restricted-syntax -- FACE_COLORS is a user-selectable data palette (DB face_color values), not styling */
// These hexes are persisted as `Recipe.face_color` data. They intentionally
// do NOT import from ~theme/tokens: recoloring the UI brand must never
// re-interpret stored user data. Two entries coincide with brand tokens by
// accident (Spore Gold == brand.accent2, Mushroom Cap == brand.accent) —
// that is a data/theme coincidence, not a coupling.
export const FACE_COLORS: readonly { hex: string; name: string }[] = [
  { hex: '#2E7D32', name: 'Forest Moss' },
  { hex: '#43A047', name: 'Fern' },
  { hex: '#689F38', name: 'Lichen' },
  { hex: '#558B2F', name: 'Sage Stem' },
  { hex: '#00796B', name: 'Deep Teal' },
  { hex: '#00695C', name: 'Wet Earth' },
  { hex: '#5D4037', name: 'Tree Bark' },
  { hex: '#795548', name: 'Rich Loam' },
  { hex: '#8D6E63', name: 'Clay Pot' },
  { hex: '#A27B35', name: 'Spore Gold' },
  { hex: '#C66F2F', name: 'Mushroom Cap' },
  { hex: '#E64A19', name: 'Burnt Sienna' },
  { hex: '#FF6F00', name: 'Amber Glow' },
  { hex: '#5E35B1', name: 'Spore Purple' },
  { hex: '#303F9F', name: 'Twilight Indigo' },
  { hex: '#00838F', name: 'Mist Cyan' },
] as const;
/* eslint-enable no-restricted-syntax */

export interface ColorSwatchPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
  colors?: readonly { hex: string; name: string }[];
}

const SWATCH_SIZE = 32;

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  value,
  onChange,
  colors = FACE_COLORS,
}) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
    {/* "No color" reset swatch */}
    <Tooltip title="No color">
      <Box
        role="button"
        tabIndex={0}
        aria-label="No color"
        onClick={() => onChange(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onChange(null);
        }}
        sx={{
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            width: SWATCH_SIZE,
            height: SWATCH_SIZE,
            borderRadius: '50%',
            border: value === null ? '2px solid' : '2px dashed',
            borderColor: value === null ? 'text.primary' : 'grey.500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
            '&:hover': { borderColor: 'text.primary' },
          }}
        >
          <ClearIcon sx={{ fontSize: 14, color: 'grey.500' }} />
        </Box>
      </Box>
    </Tooltip>
    {/* Color swatches */}
    {colors.map(({ hex, name }) => {
      const selected = value === hex;
      return (
        <Tooltip key={hex} title={`${name} (${hex})`} arrow>
          <Box
            role="button"
            tabIndex={0}
            aria-label={name}
            onClick={() => onChange(hex)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onChange(hex);
            }}
            sx={{
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: SWATCH_SIZE,
                height: SWATCH_SIZE,
                borderRadius: '50%',
                bgcolor: hex,
                boxShadow: selected
                  ? (theme) =>
                      `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.text.primary}`
                  : 'none',
                transform: selected ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s ease',
                '&:hover': { opacity: 0.85, transform: 'scale(1.1)' },
              }}
            />
          </Box>
        </Tooltip>
      );
    })}
  </Box>
);
