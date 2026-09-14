import DnsIcon from '@mui/icons-material/Dns';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type { Theme } from '@mui/material';
import type { ComponentType } from 'react';
import { FiActivity as ActivityIcon } from 'react-icons/fi';

/**
 * Props accepted by every sidebar icon. Covers MUI `SvgIcon` components and
 * `react-icons` components (which default to `1em` and need an explicit
 * `size` to match MUI's 24px default). `className` is the shared-prop anchor
 * that keeps both ecosystems' (all-optional) prop contracts assignable to
 * `ComponentType<NavIconProps>`.
 */
export type NavIconProps = {
  size?: string | number;
  className?: string;
};

/**
 * Sidebar nav entry. `icon` stores the component *reference* (not JSX) so this
 * module stays JSX-free; `NavItem` renders it as `<Icon {...iconProps} />`.
 */
export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<NavIconProps>;
  iconProps?: NavIconProps;
  end?: boolean;
};

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/pico-units', label: 'Pico Units', icon: ActivityIcon, iconProps: { size: 24 } },
  { to: '/batches', label: 'Batches', icon: Inventory2Icon },
  { to: '/recipes', label: 'Recipes', icon: MenuBookIcon },
  { to: '/readings', label: 'Readings', icon: ShowChartIcon },
  { to: '/server', label: 'Server', icon: DnsIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export const activeSx = (theme: Theme) => ({
  '&[aria-current="page"]': {
    bgcolor: theme.palette.warning.main,
    color: 'background.default',
    '& .MuiListItemIcon-root': { color: 'background.default' },
  },
});

export const drawerWidth = 200;
