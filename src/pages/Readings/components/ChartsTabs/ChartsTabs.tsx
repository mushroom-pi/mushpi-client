import { Box, Tab, Tabs } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { GraphTab } from '~components';

import { ControlLoopTab } from './ControlLoopTab';
import { DevicesTab } from './DevicesTab';
import { TempHumTab } from './TempHumTab';

const tabA11yProps = (index: number) => ({
  id: `readings-tab-${index}`,
  'aria-controls': `readings-tabpanel-${index}`,
});

const TabPanel = ({
  children,
  value,
  index,
  subtitle,
}: {
  children: ReactNode;
  value: number;
  index: number;
  subtitle: string;
}) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`readings-tabpanel-${index}`}
    aria-labelledby={`readings-tab-${index}`}
  >
    {value === index ? <GraphTab subtitle={subtitle}>{children}</GraphTab> : null}
  </Box>
);

export const ChartsTabs = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, nextTab: number) => setTab(nextTab)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Readings charts tabs"
      >
        <Tab label="Temperature and Humidity" {...tabA11yProps(0)} />
        <Tab label="Devices" {...tabA11yProps(1)} />
        <Tab label="Control Loop" {...tabA11yProps(2)} />
      </Tabs>

      <TabPanel
        value={tab}
        index={0}
        subtitle="Split view: humidity and temperature with individual targets"
      >
        <TempHumTab />
      </TabPanel>
      <TabPanel value={tab} index={1} subtitle="ON/OFF status of each connected component">
        <DevicesTab />
      </TabPanel>
      <TabPanel value={tab} index={2} subtitle="Whether the control loop is enabled or disabled">
        <ControlLoopTab />
      </TabPanel>
    </Box>
  );
};
