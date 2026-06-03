import React, { useMemo, useState } from 'react';
import { useGetTrackRecordsQuery } from './trackRecordApi';
import { useGetSIPsQuery } from '../mutualFunds/sipAPI';
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
import {
  Box,
  Typography,
  Slider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { formatCurrency } from '@/utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const MONTHS = 120;

const EQUITY_KEYS = ['stocks', 'mutualFunds', 'crypto'] as const;
const DEBT_KEYS = [
  'bankAccounts',
  'fixedDeposits',
  'recurringDeposits',
  'bonds',
  'ppf',
  'nps',
  'epf',
] as const;

const MILESTONES = [
  { label: '₹25L', value: 25_00_000 },
  { label: '₹50L', value: 50_00_000 },
  { label: '₹1Cr', value: 1_00_00_000 },
  { label: '₹2Cr', value: 2_00_00_000 },
  { label: '₹5Cr', value: 5_00_00_000 },
  { label: '₹10Cr', value: 10_00_00_000 },
  { label: '₹25Cr', value: 25_00_00_000 },
  { label: '₹50Cr', value: 50_00_00_000 },
];

const TABLE_YEARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function sumKeys(breakdown: Record<string, number>, keys: readonly string[]): number {
  return keys.reduce((acc, k) => acc + (breakdown[k] ?? 0), 0);
}

function projectSeries(
  currentValue: number,
  monthlyContribution: number,
  annualRate: number,
): number[] {
  const r = annualRate / 12;
  return Array.from({ length: MONTHS + 1 }, (_, m) => {
    const lump = currentValue * Math.pow(1 + r, m);
    const sip =
      r > 0.00001 ? monthlyContribution * ((Math.pow(1 + r, m) - 1) / r) : monthlyContribution * m;
    return lump + sip;
  });
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, unit, onChange }) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {unit === '%' ? `${value}%` : formatCurrency(value)}
      </Typography>
    </Box>
    <Slider
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(_, v) => onChange(v as number)}
      size="small"
    />
  </Box>
);

const SUMMARY_YEARS = [
  { label: '1 Year', months: 12 },
  { label: '3 Years', months: 36 },
  { label: '5 Years', months: 60 },
  { label: '10 Years', months: 120 },
];

const ProjectionChart: React.FC = () => {
  const { data: trackRecords, isLoading: trLoading } = useGetTrackRecordsQuery();
  const { data: sipData, isLoading: sipLoading } = useGetSIPsQuery();

  const [equityRate, setEquityRate] = useState(12);
  const [debtRate, setDebtRate] = useState(7);
  const [goldRate, setGoldRate] = useState(8);
  const [realEstateRate, setRealEstateRate] = useState(6);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const { baseNW, optimisticNW, pessimisticNW, monthlySIP, currentNW, labels } = useMemo(() => {
    if (!trackRecords || trackRecords.length === 0) return {} as any;

    const latest = trackRecords[trackRecords.length - 1];
    const bd = (latest.breakdown ?? {}) as Record<string, number>;

    const currentEquity = sumKeys(bd, EQUITY_KEYS);
    const currentDebt = sumKeys(bd, DEBT_KEYS);
    const currentGold = bd.gold ?? 0;
    const currentRealEstate = bd.realEstate ?? 0;
    const currentLiabilities = latest.totalLiabilities;

    const monthlySIP = (sipData?.sips ?? [])
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.frequency === 'monthly' ? s.amount : s.amount / 3), 0);

    const totalContribution = monthlySIP + extraMonthly;

    const compute = (eqR: number, dtR: number, glR: number, reR: number) => {
      const eq = projectSeries(currentEquity, totalContribution, eqR / 100);
      const dt = projectSeries(currentDebt, 0, dtR / 100);
      const gl = projectSeries(currentGold, 0, glR / 100);
      const re = projectSeries(currentRealEstate, 0, reR / 100);
      return Array.from(
        { length: MONTHS + 1 },
        (_, m) => eq[m] + dt[m] + gl[m] + re[m] - currentLiabilities,
      );
    };

    const baseNW = compute(equityRate, debtRate, goldRate, realEstateRate);
    const optimisticNW = compute(equityRate + 3, debtRate + 3, goldRate + 3, realEstateRate + 3);
    const pessimisticNW = compute(equityRate - 3, debtRate - 3, goldRate - 3, realEstateRate - 3);

    const now = new Date();
    const labels = Array.from({ length: MONTHS + 1 }, (_, m) => {
      const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    });

    return { baseNW, optimisticNW, pessimisticNW, monthlySIP, currentNW: baseNW[0], labels };
  }, [trackRecords, sipData, equityRate, debtRate, goldRate, realEstateRate, extraMonthly]);

  if (trLoading || sipLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trackRecords || trackRecords.length === 0) {
    return (
      <Typography sx={{ p: 2 }} color="text.secondary">
        No portfolio data yet. Your first track record snapshot is created automatically — check
        back next month.
      </Typography>
    );
  }

  const nextMilestone = MILESTONES.find(m => m.value > currentNW);
  let milestoneText = '';
  if (nextMilestone) {
    const crossMonth = baseNW.findIndex((v: number) => v >= nextMilestone.value);
    if (crossMonth > 0) {
      const yrs = Math.floor(crossMonth / 12);
      const mos = crossMonth % 12;
      milestoneText = `At this rate, you'll reach ${nextMilestone.label} in ~${yrs > 0 ? `${yrs}y ` : ''}${mos > 0 ? `${mos}m` : ''}`;
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Optimistic (+3%)',
        data: optimisticNW,
        borderColor: '#16a34a',
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        tension: 0.3,
      },
      {
        label: 'Base Case',
        data: baseNW,
        borderColor: '#2563eb',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.3,
      },
      {
        label: 'Pessimistic (-3%)',
        data: pessimisticNW,
        borderColor: '#dc2626',
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: { duration: 300 },
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 11, autoSkip: true } },
      y: { ticks: { callback: (v: any) => formatCurrency(Number(v ?? 0)) } },
    },
  };

  // Build year-by-year table rows
  const now = new Date();
  const tableRows = TABLE_YEARS.map(yr => {
    const m = yr * 12;
    const prevM = yr === 0 ? 0 : (yr - 1) * 12;
    const base = baseNW[m];
    const prevBase = baseNW[prevM];
    const yoyGrowth = yr === 0 ? null : ((base - prevBase) / Math.abs(prevBase)) * 100;
    const yearLabel =
      yr === 0
        ? `Now (${now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})`
        : `Year ${yr}`;
    return {
      yr,
      yearLabel,
      base,
      optimistic: optimisticNW[m],
      pessimistic: pessimisticNW[m],
      yoyGrowth,
    };
  });

  return (
    <Box>
      {/* Disclaimer + view toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Projections are estimates based on assumed return rates. Actual returns may differ.
        </Typography>
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
          <ToggleButton value="chart">Chart</ToggleButton>
          <ToggleButton value="table">Table</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Sliders */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SliderRow
            label="Equity returns (Stocks / MF / Crypto)"
            value={equityRate}
            min={3}
            max={25}
            step={0.5}
            unit="%"
            onChange={setEquityRate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SliderRow
            label="Debt returns (FD / Bonds / PPF / EPF)"
            value={debtRate}
            min={2}
            max={15}
            step={0.5}
            unit="%"
            onChange={setDebtRate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SliderRow
            label="Gold appreciation"
            value={goldRate}
            min={2}
            max={15}
            step={0.5}
            unit="%"
            onChange={setGoldRate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SliderRow
            label="Real estate appreciation"
            value={realEstateRate}
            min={1}
            max={12}
            step={0.5}
            unit="%"
            onChange={setRealEstateRate}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SliderRow
            label="Extra monthly investment (beyond active SIPs)"
            value={extraMonthly}
            min={0}
            max={2_00_000}
            step={1000}
            unit="₹"
            onChange={setExtraMonthly}
          />
          {monthlySIP > 0 && (
            <Chip
              label={`Auto-detected SIPs: ${formatCurrency(monthlySIP)}/month`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
        </Grid>
      </Grid>

      {/* Chart view */}
      {view === 'chart' && (
        <Box sx={{ mb: 4 }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      )}

      {/* Table view */}
      {view === 'table' && (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Year</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  Pessimistic (−3%)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Base Case
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  Optimistic (+3%)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  YoY Growth
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map(({ yr, yearLabel, base, optimistic, pessimistic, yoyGrowth }) => (
                <TableRow
                  key={yr}
                  sx={{
                    bgcolor: yr === 0 ? 'action.hover' : 'inherit',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <TableCell sx={{ fontWeight: yr === 0 ? 'bold' : 'normal' }}>
                    {yearLabel}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {formatCurrency(pessimistic)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(base)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {formatCurrency(optimistic)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {yoyGrowth !== null ? `+${yoyGrowth.toFixed(1)}%` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Summary cards */}
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
        Projected Net Worth — Base Case
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {SUMMARY_YEARS.map(({ label, months }) => (
          <Grid item xs={6} sm={3} key={label}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatCurrency(baseNW[months])}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="success.main">
                    ↑ {formatCurrency(optimisticNW[months])}
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    ↓ {formatCurrency(pessimisticNW[months])}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Milestone callout */}
      {milestoneText && (
        <Card variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.200' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" fontWeight="medium">
              🎯 {milestoneText}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Based on {equityRate}% equity / {debtRate}% debt returns with{' '}
              {formatCurrency(monthlySIP + extraMonthly)}/month contributions
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProjectionChart;
