import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Savings,
  AccountBalanceWallet,
  Handshake,
  HomeWork,
  AccountBox,
  Repeat,
} from '@mui/icons-material';
import { useGetDashboardQuery } from '@/features/dashboard/dashboardAPI';
import { useGetLendMoneyQuery } from '@/features/lendMoney/lendMoneyAPI';
import { useGetRealEstateQuery } from '@/features/realEstate/realEstateAPI';
import { useGetAllGoldQuery } from '@/features/gold/goldAPI';
import { useGetBankAccountsQuery } from '@/features/bankAccounts/bankAccountsAPI';
import { useGetRecurringDepositsQuery } from '@/features/recurringDeposits/recurringDepositsAPI';
import { formatCurrency } from '@/utils/formatters';

interface AssetCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  value: string;
  count: number;
  countLabel: string;
  onClick: () => void;
}

function AssetCard({ title, icon, color, value, count, countLabel, onClick }: AssetCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              color: color,
              mx: 'auto',
              mb: 3,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" align="center" gutterBottom fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="h5" align="center" color="primary" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 1 }}>
            {count} {countLabel}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Assets() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useGetDashboardQuery();
  const { data: lendMoney = [] } = useGetLendMoneyQuery();
  const { data: realEstates = [] } = useGetRealEstateQuery();
  const { data: goldData } = useGetAllGoldQuery();
  const { data: bankAccountsData } = useGetBankAccountsQuery();
  const { data: recurringDepositsData } = useGetRecurringDepositsQuery();

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const assetCounts = dashboardData?.assetCounts || {
    stocks: 0,
    mutualFunds: 0,
    fixedDeposits: 0,
    epfAccounts: 0,
    crypto: 0,
    licPolicies: 0,
  };
  const stocksValue = dashboardData?.stocksValue || 0;
  const mutualFundsValue = dashboardData?.mutualFundsValue || 0;
  const fixedDepositsValue = dashboardData?.fixedDepositsValue || 0;
  const epfValue = dashboardData?.epfValue || 0;
  const cryptoValue = dashboardData?.cryptoValue || 0;
  const licValue = dashboardData?.licValue || 0;

  // Calculate lend money total (amount - amountReturned)
  const lendMoneyValue = lendMoney.reduce(
    (sum, item) => sum + (item.amount - item.amountReturned),
    0,
  );
  const lendMoneyCount = lendMoney.length;

  // Calculate real estate total
  const realEstateValue = realEstates.reduce(
    (sum, item) => sum + (item.currentValue || item.purchasePrice),
    0,
  );
  const realEstateCount = realEstates.length;

  // Calculate gold total
  const goldAssets = goldData?.goldAssets || [];
  const goldValue = goldAssets.reduce((sum, item) => sum + item.currentValue, 0);
  const goldCount = goldAssets.length;

  // Calculate bank accounts total
  const bankAccounts = bankAccountsData?.bankAccounts || [];
  const bankAccountsValue = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const bankAccountsCount = bankAccounts.length;

  // Calculate recurring deposits total
  const recurringDeposits = recurringDepositsData?.recurringDeposits || [];
  const recurringDepositsValue = recurringDeposits.reduce((sum, rd) => sum + rd.maturityAmount, 0);
  const recurringDepositsCount = recurringDeposits.length;

  const assetTypes = [
    {
      title: 'Stocks',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      value: formatCurrency(stocksValue),
      count: assetCounts.stocks,
      countLabel: assetCounts.stocks === 1 ? 'stock' : 'stocks',
      path: '/stocks',
    },
    {
      title: 'Mutual Funds',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      value: formatCurrency(mutualFundsValue),
      count: assetCounts.mutualFunds,
      countLabel: assetCounts.mutualFunds === 1 ? 'mutual fund' : 'mutual funds',
      path: '/mutual-funds',
    },
    {
      title: 'Fixed Deposits',
      icon: <Savings sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      value: formatCurrency(fixedDepositsValue),
      count: assetCounts.fixedDeposits,
      countLabel: assetCounts.fixedDeposits === 1 ? 'fixed deposit' : 'fixed deposits',
      path: '/fixed-deposits',
    },
    {
      title: 'Bank Accounts',
      icon: <AccountBox sx={{ fontSize: 40 }} />,
      color: '#00bcd4',
      value: formatCurrency(bankAccountsValue),
      count: bankAccountsCount,
      countLabel: bankAccountsCount === 1 ? 'account' : 'accounts',
      path: '/bank-accounts',
    },
    {
      title: 'Recurring Deposits',
      icon: <Repeat sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      value: formatCurrency(recurringDepositsValue),
      count: recurringDepositsCount,
      countLabel: recurringDepositsCount === 1 ? 'RD' : 'RDs',
      path: '/recurring-deposits',
    },
    {
      title: 'EPF / PF',
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      value: formatCurrency(epfValue),
      count: assetCounts.epfAccounts,
      countLabel: assetCounts.epfAccounts === 1 ? 'account' : 'accounts',
      path: '/epf',
    },
    {
      title: 'Cryptocurrency',
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      value: formatCurrency(cryptoValue),
      count: assetCounts.crypto,
      countLabel: assetCounts.crypto === 1 ? 'crypto' : 'crypto',
      path: '/crypto',
    },
    {
      title: 'LIC Policies',
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
      color: '#795548',
      value: formatCurrency(licValue),
      count: assetCounts.licPolicies,
      countLabel: assetCounts.licPolicies === 1 ? 'policy' : 'policies',
      path: '/lic',
    },
    {
      title: 'Lend Money',
      icon: <Handshake sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      value: formatCurrency(lendMoneyValue),
      count: lendMoneyCount,
      countLabel: lendMoneyCount === 1 ? 'person' : 'people',
      path: '/lend-money',
    },
    {
      title: 'Real Estate',
      icon: <HomeWork sx={{ fontSize: 40 }} />,
      color: '#5d4037',
      value: formatCurrency(realEstateValue),
      count: realEstateCount,
      countLabel: realEstateCount === 1 ? 'property' : 'properties',
      path: '/real-estate',
    },
    {
      title: 'Gold',
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
      color: '#FFD700',
      value: formatCurrency(goldValue),
      count: goldCount,
      countLabel: goldCount === 1 ? 'asset' : 'assets',
      path: '/gold',
    },
    {
      title: 'Others',
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
      color: '#607d8b',
      value: formatCurrency(0),
      count: 0,
      countLabel: 'assets',
      path: '/other-assets',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Assets
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Select an asset type to view and manage your investments
      </Typography>

      <Grid container spacing={3}>
        {assetTypes.map(asset => (
          <Grid item xs={12} sm={6} md={3} key={asset.title}>
            <AssetCard
              title={asset.title}
              icon={asset.icon}
              color={asset.color}
              value={asset.value}
              count={asset.count}
              countLabel={asset.countLabel}
              onClick={() => navigate(asset.path)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
