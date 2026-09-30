import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  type SxProps,
  type Theme,
} from '@mui/material';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';

import { veil } from '~theme/tokens';

import type { NavIconProps } from '../constants';

type NavItemProps = {
  to: string;
  label: string;
  icon: ComponentType<NavIconProps>;
  iconProps?: NavIconProps;
  end?: boolean;
  /**
   * When true, `to` is an absolute external URL: the item renders as an `<a>`
   * that opens in a new tab instead of a router `NavLink`. `end` is ignored.
   */
  external?: boolean;
  onClick?: () => void;
};

const itemSx: SxProps<Theme> = {
  borderRadius: 1.25,
  px: 1.5,
  py: 1,
  mb: 0.5,
  color: 'text.secondary',
  fontWeight: 600,
  '&:hover': { bgcolor: veil.subtle, color: 'text.primary' },
  '&[aria-current="page"]': {
    bgcolor: (theme) => theme.palette.warning.main,
    color: 'background.default',
    '& .MuiListItemIcon-root': { color: 'background.default' },
  },
};

export function NavItem({
  to,
  label,
  icon: Icon,
  iconProps,
  end,
  external,
  onClick,
}: NavItemProps) {
  const content = (
    <>
      <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
        <Icon {...iconProps} />
      </ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
    </>
  );

  if (external) {
    return (
      <ListItemButton
        component="a"
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        sx={itemSx}
      >
        {content}
      </ListItemButton>
    );
  }

  return (
    <ListItemButton component={NavLink} to={to} end={end} onClick={onClick} sx={itemSx}>
      {content}
    </ListItemButton>
  );
}
