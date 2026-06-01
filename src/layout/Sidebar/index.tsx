import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React from 'react';

import { NavItem } from './components/NavItem';
import { drawerWidth, navItems } from './constants';

export default function Sidebar() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        gap: 2,
        bgcolor: 'transparent',
        // subtle right border to match your CSS
        borderRight: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      {/* Brand */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            borderRadius: 1.25,
            bgcolor: 'rgba(255,255,255,0.04)', // theme.glass
          }}
        >
          <span role="img" aria-label="mushroom">
            🍄
          </span>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 18 }}>
          MushPi
        </Typography>

        {/* Close button — only shown on mobile */}
        {!mdUp && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            aria-label="close drawer"
            size="small"
            sx={{ ml: 'auto', color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box component="nav" sx={{ mt: 0.75 }}>
        <List sx={{ p: 0 }}>
          {navItems.map((it) => (
            <NavItem key={it.to} {...it} onClick={() => setMobileOpen(false)} />
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.02)' }} />

      {/* footer pushed to bottom */}
      <Box sx={{ mt: 'auto', color: 'text.secondary', fontSize: 12 }}>
        <Typography variant="caption">v0.1 • offline</Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* AppBar for small screens */}
      {!mdUp && (
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: `linear-gradient(180deg, ${theme.palette.background.default}, rgba(0,0,0,0.25))`,
            borderBottom: '1px solid rgba(255,255,255,0.02)',
            height: 56,
            justifyContent: 'center',
          }}
        >
          <Toolbar sx={{ minHeight: '56px !important', px: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              sx={{ ml: 1, fontWeight: 700, color: 'primary.main', fontSize: 16 }}
            >
              MushPi
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer for md+ (permanent) */}
      {mdUp ? (
        <Drawer
          variant="permanent"
          open
          PaperProps={{
            sx: {
              width: drawerWidth,
              boxSizing: 'border-box',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
              borderRight: '1px solid rgba(255,255,255,0.03)',
              boxShadow: 'var(--shadow)',
            },
          }}
        >
          <Box sx={{ width: drawerWidth, height: '100%' }}>{drawerContent}</Box>
        </Drawer>
      ) : (
        /* Temporary drawer for mobile */
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(255,255,255,0.03)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* When permanent drawer is present, consume left space.
          Note: your App layout should account for the drawerWidth on md+ screens.
          Example: <Box component="main" sx={{ ml: { md: `${drawerWidth}px` } }}> ... </Box>
      */}
    </>
  );
}
