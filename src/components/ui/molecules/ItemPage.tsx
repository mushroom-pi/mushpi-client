import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

import { Page } from '~layout/Page';

interface ItemPageProps {
  /** Primary heading text. */
  title: ReactNode;
  /** Optional badge/chip displayed inline beside the title. */
  titleAdornment?: ReactNode;
  /** Action buttons rendered in the top-right corner of the header. */
  actions?: ReactNode;
  /** Content rendered between the title row and the main body (e.g. status chips, description). */
  meta?: ReactNode;
  children: ReactNode;
}

export const ItemPage: React.FC<ItemPageProps> = ({
  title,
  titleAdornment,
  actions,
  meta,
  children,
}) => (
  <Page>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      gap={{ xs: 1.5, sm: 1 }}
      mb={2}
    >
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <Typography variant="h4" component="h1" sx={{ wordBreak: 'break-word' }}>
          {title}
        </Typography>
        {titleAdornment}
      </Box>
      {actions && <Box flexShrink={0}>{actions}</Box>}
    </Stack>
    {meta}
    {children}
  </Page>
);
