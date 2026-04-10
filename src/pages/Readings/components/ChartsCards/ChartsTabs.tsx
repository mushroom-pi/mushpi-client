import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { ControlLoopCard } from './ControlLoopCard';
import { DevicesCard } from './DevicesCard';
import { TempHumCard } from './TempHumCard';

const tabA11yProps = (index: number) => ({
  id: `readings-tab-${index}`,
  'aria-controls': `readings-tabpanel-${index}`,
});

const TabPanel = ({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`readings-tabpanel-${index}`}
    aria-labelledby={`readings-tab-${index}`}
  >
    {value === index ? children : null}
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
        <Tab label="Temp & Humidity" {...tabA11yProps(0)} />
        <Tab label="Devices" {...tabA11yProps(1)} />
        <Tab label="Control Loop" {...tabA11yProps(2)} />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <TempHumCard />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <DevicesCard />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <ControlLoopCard />
      </TabPanel>
    </Box>
  );
};
