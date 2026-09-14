import { createTheme } from '@mui/material/styles';

import { brand, cardRadius, scrim, veil } from '~theme/tokens';

// Typed `palette.custom` escape hatch so any consumer (including sx callbacks)
// can reach the veil/scrim token groups via theme.palette instead of importing
// tokens directly.
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      /** White-alpha overlays for dark glass surfaces */
      veil: typeof veil;
      /** Black scrims (AppBar gradient end, image button backdrops) */
      scrim: typeof scrim;
    };
  }
  interface PaletteOptions {
    custom?: {
      veil: typeof veil;
      scrim: typeof scrim;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: brand.bg,
      paper: brand.card,
    },
    primary: {
      main: brand.accent, // primary accent: mushroom cap
      contrastText: brand.bg,
    },
    secondary: {
      main: brand.leaf, // green for growth/actions
      contrastText: brand.bg,
    },
    text: {
      primary: brand.text,
      secondary: brand.muted,
    },
    warning: {
      // use accent2-ish as warning (or you can choose a brighter amber)
      main: brand.accent2,
      contrastText: brand.bg,
    },
    info: {
      main: brand.info,
    },
    success: {
      main: brand.leaf,
    },
    custom: {
      veil,
      scrim,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: cardRadius,
          border: `1px solid ${veil.hairline}`,
        },
      },
    },
  },
});

export default theme;
