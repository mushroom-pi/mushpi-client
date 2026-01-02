import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type { Theme } from '@mui/material';
import { FiActivity as ActivityIcon } from 'react-icons/fi';

export const navItems = [
  { to: '/', label: 'Dashboard', icon: <HomeIcon />, end: true },
  { to: '/pico-units', label: 'Pico Units', icon: <ActivityIcon size={24} /> },
  { to: '/readings', label: 'Readings', icon: <ShowChartIcon /> },
  { to: '/server', label: 'Server', icon: <SettingsIcon /> },
];

export const activeSx = (theme: Theme) => ({
  '&[aria-current="page"]': {
    bgcolor: theme.palette.warning.main,
    color: 'background.default',
    '& .MuiListItemIcon-root': { color: 'background.default' },
  },
});
