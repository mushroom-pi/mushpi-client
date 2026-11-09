import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import sadMushroomSvg from '~assets/SadMushroom.svg';
import { PageTitle } from '~components';
import { useDocumentTitle } from '~hook/useDocumentTitle';
import { Page } from '~layout/Page';

/** Single source for both the visible line and the illustration's text description. */
const NOT_FOUND_MESSAGE =
  "This page doesn't exist. It may have moved, or the address may be mistyped.";

export default function NotFound() {
  useDocumentTitle('404 — Not Found');
  const navigate = useNavigate();

  return (
    <Page>
      <PageTitle>404 — Not Found</PageTitle>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          py: 6,
        }}
      >
        <img src={sadMushroomSvg} alt={NOT_FOUND_MESSAGE} style={{ width: 140, height: 'auto' }} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3, maxWidth: 400 }}>
          {NOT_FOUND_MESSAGE}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Box>
    </Page>
  );
}
