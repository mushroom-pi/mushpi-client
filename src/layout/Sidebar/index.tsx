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

import mushPiSquareLogo from '~assets/MushPiSquareLogo.svg';
import mushroomPiHorizontalLogo from '~assets/MushroomPiHorizontalLogo.svg';
import { cardShadow, scrim, veil } from '~theme/tokens';

import { NavItem } from './components/NavItem';
import { drawerWidth, navItems } from './constants';

/** Mobile AppBar height — AppBar `height` and the Toolbar `minHeight` below are intentionally coupled. */
const appBarHeight = 56;

export default function Sidebar() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const appBarGradient = `linear-gradient(180deg, ${theme.palette.background.default}, ${scrim.appBar})`;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        gap: 2,
        bgcolor: 'transparent',
        // Intentionally overlaps the drawer Paper's borderRight below (both the
        // permanent and temporary branches): the two 1px veil.hairline borders
        // stack to ~1-(1-0.03)^2 ≈ 5.9% effective alpha. Do NOT dedupe —
        // removing either layer would change the rendered border.
        borderRight: `1px solid ${veil.hairline}`,
      }}
    >
      {/* Brand */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {mdUp ? (
          /* Desktop: width-driven horizontal lockup. The row is as wide as the
             drawer's inner content box (drawerWidth minus the p:2.5 padding),
             so width:100% fills it and height:auto keeps the aspect ratio —
             it can never overflow or clip the drawer. */
          <img
            src={mushroomPiHorizontalLogo}
            alt="MushPi"
            style={{ width: '100%', height: 'auto', display: 'block', maxWidth: '100%' }}
          />
        ) : (
          /* Mobile: compact square lockup at a fixed small height so the close
             button beside it is never crowded out. */
          <img
            src={mushPiSquareLogo}
            alt="MushPi"
            style={{ height: 44, width: 'auto', maxWidth: '100%', display: 'block' }}
          />
        )}

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

      <Divider sx={{ borderColor: veil.subtle }} />

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
            bgcolor: appBarGradient,
            borderBottom: `1px solid ${veil.subtle}`,
            height: appBarHeight,
            justifyContent: 'center',
          }}
        >
          <Toolbar sx={{ minHeight: `${appBarHeight}px !important`, px: 1 }}>
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

            <img
              src={mushroomPiHorizontalLogo}
              alt="Mushroom Pi"
              style={{ marginLeft: 8, height: 30, width: 'auto', display: 'block' }}
            />
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
              background: `linear-gradient(180deg, ${veil.subtle}, ${veil.faint})`,
              borderRight: `1px solid ${veil.hairline}`,
              boxShadow: cardShadow,
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
              borderRight: `1px solid ${veil.hairline}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* The main-content offset for this permanent drawer is already applied in
          App.tsx: the main <Box> sets `marginLeft: { xs: 0, md: `${drawerWidth}px` }`. */}
    </>
  );
}
