import React from 'react';
import { useGetTrackRecordsQuery } from './trackRecordApi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
}

const TrackRecordChart: React.FC<Props> = () => {
  const { data, isLoading, error } = useGetTrackRecordsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading track records.</div>;
  if (!data || data.length === 0) return <div>No track records found.</div>;

  const labels = data.map(rec => new Date(rec.snapshotDate).toLocaleDateString());
  const netWorth = data.map(rec => rec.netWorth);
  const assets = data.map(rec => rec.totalAssets);
  const liabilities = data.map(rec => rec.totalLiabilities);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Worth',
        data: netWorth,
        borderColor: 'green',
        backgroundColor: 'rgba(0,128,0,0.1)',
      },
      {
        label: 'Total Assets',
        data: assets,
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
      },
      {
        label: 'Total Liabilities',
        data: liabilities,
        borderColor: 'red',
        backgroundColor: 'rgba(255,0,0,0.1)',
      },
    ],
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>Track Record (Monthly Snapshot)</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true },
          },
        }}
      />
    </div>
  );
};

export default TrackRecordChart;
