import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  Home,
  DirectionsCar,
  CreditCard,
  School,
  AccountBalance,
  Handshake,
} from '@mui/icons-material';
import { useGetLiabilitiesQuery, useCreateLiabilityMutation } from './liabilitiesAPI';
import { useGetBorrowedMoneyQuery } from '@/features/borrowedMoney/borrowedMoneyAPI';
import { formatCurrency } from '@/utils/formatters';

interface LiabilityFormData {
  name: string;
  type: 'home_loan' | 'car_loan' | 'personal_loan' | 'credit_card' | 'education_loan' | 'other';
  principalAmount: string;
  currentBalance: string;
  interestRate: string;
  emiAmount: string;
  startDate: string;
  endDate: string;
  lender: string;
}

const liabilityTypeOptions = [
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'education_loan', label: 'Education Loan' },
  { value: 'other', label: 'Other' },
];

interface LiabilityCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  value: string;
  count: number;
  countLabel: string;
  onClick: () => void;
}

function LiabilityCard({
  title,
  icon,
  color,
  value,
  count,
  countLabel,
  onClick,
}: LiabilityCardProps) {
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
          <Typography variant="h5" align="center" color="error" fontWeight="bold">
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

export default function Liabilities() {
  const navigate = useNavigate();
  const { data: liabilities = [], isLoading } = useGetLiabilitiesQuery();
  const { data: borrowedMoney = [] } = useGetBorrowedMoneyQuery();
  const [createLiability] = useCreateLiabilityMutation();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LiabilityFormData>({
    name: '',
    type: 'home_loan',
    principalAmount: '',
    currentBalance: '',
    interestRate: '',
    emiAmount: '',
    startDate: '',
    endDate: '',
    lender: '',
  });

  const handleOpen = () => {
    setFormData({
      name: '',
      type: 'home_loan',
      principalAmount: '',
      currentBalance: '',
      interestRate: '',
      emiAmount: '',
      startDate: '',
      endDate: '',
      lender: '',
    });
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setIsSubmitting(true);

      const payload = {
        name: formData.name,
        type: formData.type,
        principalAmount: parseFloat(formData.principalAmount),
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate),
        emiAmount: formData.emiAmount ? parseFloat(formData.emiAmount) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        lender: formData.lender || undefined,
      };

      await createLiability(payload).unwrap();
      handleClose();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to add liability');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Calculate totals by type
  const homeLoanTotal = liabilities
    .filter(l => l.type === 'home_loan')
    .reduce((sum, l) => sum + l.currentBalance, 0);
  const carLoanTotal = liabilities
    .filter(l => l.type === 'car_loan')
    .reduce((sum, l) => sum + l.currentBalance, 0);
  const personalLoanTotal = liabilities
    .filter(l => l.type === 'personal_loan')
    .reduce((sum, l) => sum + l.currentBalance, 0);
  const creditCardTotal = liabilities
    .filter(l => l.type === 'credit_card')
    .reduce((sum, l) => sum + l.currentBalance, 0);
  const educationLoanTotal = liabilities
    .filter(l => l.type === 'education_loan')
    .reduce((sum, l) => sum + l.currentBalance, 0);
  const otherTotal = liabilities
    .filter(l => l.type === 'other')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const homeLoanCount = liabilities.filter(l => l.type === 'home_loan').length;
  const carLoanCount = liabilities.filter(l => l.type === 'car_loan').length;
  const personalLoanCount = liabilities.filter(l => l.type === 'personal_loan').length;
  const creditCardCount = liabilities.filter(l => l.type === 'credit_card').length;
  const educationLoanCount = liabilities.filter(l => l.type === 'education_loan').length;
  const otherCount = liabilities.filter(l => l.type === 'other').length;

  // Calculate borrowed money total (amount - amountReturned)
  const borrowedMoneyValue = borrowedMoney.reduce(
    (sum, item) => sum + (item.amount - item.amountReturned),
    0,
  );
  const borrowedMoneyCount = borrowedMoney.length;

  const liabilityTypes = [
    {
      title: 'Home Loans',
      icon: <Home sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      value: formatCurrency(homeLoanTotal),
      count: homeLoanCount,
      countLabel: homeLoanCount === 1 ? 'loan' : 'loans',
      path: '/liabilities/home_loan',
    },
    {
      title: 'Car Loans',
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      value: formatCurrency(carLoanTotal),
      count: carLoanCount,
      countLabel: carLoanCount === 1 ? 'loan' : 'loans',
      path: '/liabilities/car_loan',
    },
    {
      title: 'Personal Loans',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#c62828',
      value: formatCurrency(personalLoanTotal),
      count: personalLoanCount,
      countLabel: personalLoanCount === 1 ? 'loan' : 'loans',
      path: '/liabilities/personal_loan',
    },
    {
      title: 'Credit Cards',
      icon: <CreditCard sx={{ fontSize: 40 }} />,
      color: '#ad1457',
      value: formatCurrency(creditCardTotal),
      count: creditCardCount,
      countLabel: creditCardCount === 1 ? 'card' : 'cards',
      path: '/liabilities/credit_card',
    },
    {
      title: 'Education Loans',
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#6a1b9a',
      value: formatCurrency(educationLoanTotal),
      count: educationLoanCount,
      countLabel: educationLoanCount === 1 ? 'loan' : 'loans',
      path: '/liabilities/education_loan',
    },
    {
      title: 'Others',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#4e342e',
      value: formatCurrency(otherTotal),
      count: otherCount,
      countLabel: otherCount === 1 ? 'liability' : 'liabilities',
      path: '/liabilities/other',
    },
    {
      title: 'Borrowed Money',
      icon: <Handshake sx={{ fontSize: 40 }} />,
      color: '#b71c1c',
      value: formatCurrency(borrowedMoneyValue),
      count: borrowedMoneyCount,
      countLabel: borrowedMoneyCount === 1 ? 'person' : 'people',
      path: '/borrowed-money',
    },
  ];

  const totalLiabilities =
    liabilities.reduce((sum, l) => sum + l.currentBalance, 0) + borrowedMoneyValue;

  return (
    <Box>
      <Box
        sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            My Liabilities
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Track and manage your loans and debts
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{ ml: 2 }}
        >
          Add Liability
        </Button>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography variant="h5" color="error.dark" fontWeight="bold">
            Total Outstanding: {formatCurrency(totalLiabilities)}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {liabilityTypes.map(liability => (
          <Grid item xs={12} sm={6} md={3} key={liability.title}>
            <LiabilityCard
              title={liability.title}
              icon={liability.icon}
              color={liability.color}
              value={liability.value}
              count={liability.count}
              countLabel={liability.countLabel}
              onClick={() => navigate(liability.path)}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Liability</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Type"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
            margin="normal"
            required
          >
            {liabilityTypeOptions.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Principal Amount"
            type="number"
            value={formData.principalAmount}
            onChange={e => setFormData({ ...formData, principalAmount: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Current Outstanding Balance"
            type="number"
            value={formData.currentBalance}
            onChange={e => setFormData({ ...formData, currentBalance: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Interest Rate (%)"
            type="number"
            value={formData.interestRate}
            onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Monthly EMI"
            type="number"
            value={formData.emiAmount}
            onChange={e => setFormData({ ...formData, emiAmount: e.target.value })}
            margin="normal"
            helperText="Optional"
          />
          <TextField
            fullWidth
            label="Lender"
            value={formData.lender}
            onChange={e => setFormData({ ...formData, lender: e.target.value })}
            margin="normal"
            helperText="Optional"
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText="Optional"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
