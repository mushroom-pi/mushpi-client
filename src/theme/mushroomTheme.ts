import { createTheme } from '@mui/material/styles';

const mushroom = {
  bg: '#0f1720',
  card: '#0f1b12',
  accent: '#C66F2F',
  accent2: '#A27B35',
  leaf: '#3C8D5A',
  muted: '#9AA6A0',
  text: '#E6F0EA',
  glass: 'rgba(255,255,255,0.04)',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: mushroom.bg,
      paper: mushroom.card,
    },
    primary: {
      main: mushroom.accent, // primary accent: mushroom cap
      contrastText: mushroom.bg,
    },
    secondary: {
      main: mushroom.leaf, // green for growth/actions
      contrastText: mushroom.bg,
    },
    text: {
      primary: mushroom.text,
      secondary: mushroom.muted,
    },
    warning: {
      // use accent2-ish as warning (or you can choose a brighter amber)
      main: mushroom.accent2,
      contrastText: mushroom.bg,
    },
    info: {
      main: '#7DD3FC',
    },
    success: {
      main: mushroom.leaf,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.03)',
        },
      },
    },
  },
});

export default theme;
