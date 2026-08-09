import { Typography } from '@mui/material';
import type React from 'react';

import { prettyDate } from '~utils/methods';

interface BigDisplayProps {
  content?: string | number;
  type?: 'text' | 'number' | 'date';
}

export const BigDisplay: React.FC<BigDisplayProps> = ({ content, type = 'text' }) => (
  <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
    {type === 'number' && (typeof content === 'number' ? content : '—')}
    {type === 'text' && (typeof content === 'string' ? content : '-')}
    {type === 'date' && (typeof content === 'string' ? prettyDate(content) : '-')}
  </Typography>
);
