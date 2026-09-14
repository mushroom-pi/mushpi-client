import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';

import type { NavIconProps } from '../constants';

type NavItemProps = {
  to: string;
  label: string;
  icon: ComponentType<NavIconProps>;
  iconProps?: NavIconProps;
  end?: boolean;
  onClick?: () => void;
};

export function NavItem({ to, label, icon: Icon, iconProps, end, onClick }: NavItemProps) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={end}
      onClick={onClick}
      sx={{
        borderRadius: 1.25,
        px: 1.5,
        py: 1,
        mb: 0.5,
        color: 'text.secondary',
        fontWeight: 600,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)', color: 'text.primary' },
        '&[aria-current="page"]': {
          bgcolor: (theme) => theme.palette.warning.main,
          color: 'background.default',
          '& .MuiListItemIcon-root': { color: 'background.default' },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
        <Icon {...iconProps} />
      </ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
    </ListItemButton>
  );
}
