import React from 'react';
import TrackRecordChart from './TrackRecordChart';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

const TrackRecordPage: React.FC = () => {
  // Replace with your actual user selector logic
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  if (!userId) return <div>Please log in to view your track record.</div>;

  return (
    <div>
      <TrackRecordChart userId={userId} />
    </div>
  );
};

export default TrackRecordPage;
