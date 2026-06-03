import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import TrackRecordChart from './TrackRecordChart';
import ProjectionChart from './ProjectionChart';

const TrackRecordPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Track Record
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="History" />
        <Tab label="Projection" />
      </Tabs>
      {tab === 0 && <TrackRecordChart />}
      {tab === 1 && <ProjectionChart />}
    </Box>
  );
};

export default TrackRecordPage;
