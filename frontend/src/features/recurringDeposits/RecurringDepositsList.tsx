import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, CalendarToday } from '@mui/icons-material';
import {
  useGetRecurringDepositsQuery,
  useCreateRecurringDepositMutation,
  useUpdateRecurringDepositMutation,
  useDeleteRecurringDepositMutation,
} from './recurringDepositsAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { useGetBankAccountsQuery } from '@/features/bankAccounts/bankAccountsAPI';
import { formatCurrency } from '@/utils/formatters';
import { DataTable } from '@/shared/components';

export default function RecurringDepositsList() {
  const { data, isLoading } = useGetRecurringDepositsQuery();
  const { data: goalsData } = useGetGoalsQuery();
  const { data: bankAccountsData } = useGetBankAccountsQuery();
  const [createRD] = useCreateRecurringDepositMutation();
  const [updateRD] = useUpdateRecurringDepositMutation();
  const [deleteRD] = useDeleteRecurringDepositMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankAccountId: '',
    bankName: '',
    monthlyAmount: '',
    interestRate: '',
    startDate: '',
    maturityDate: '',
    tenure: '',
    goalId: '',
  });

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateMaturityDate = (startDate: string, tenureMonths: number) => {
    if (!startDate || !tenureMonths) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + tenureMonths);
    return date.toISOString().split('T')[0];
  };

  const calculateTenureFromDates = (startDate: string, maturityDate: string) => {
    if (!startDate || !maturityDate) return 0;
    const start = new Date(startDate);
    const end = new Date(maturityDate);
    const diffTime = end.getTime() - start.getTime();
    const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
    return diffMonths;
  };

  const calculateCurrentDepositedAmount = (startDate: string, monthlyAmount: number) => {
    const start = new Date(startDate);
    const today = new Date();
    if (start > today) return 0;
    const diffTime = today.getTime() - start.getTime();
    const monthsPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return monthsPassed * monthlyAmount;
  };

  const handleOpen = () => {
    setFormData({
      bankAccountId: '',
      bankName: '',
      monthlyAmount: '',
      interestRate: '',
      startDate: getTodayDate(),
      maturityDate: '',
      tenure: '',
      goalId: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      bankAccountId: '',
      bankName: '',
      monthlyAmount: '',
      interestRate: '',
      startDate: '',
      maturityDate: '',
      tenure: '',
      goalId: '',
    });
  };

  const handleEdit = (rd: any) => {
    setEditingId(rd.id);
    setFormData({
      bankAccountId: '',
      bankName: rd.bankName,
      monthlyAmount: String(rd.monthlyAmount),
      interestRate: String(rd.interestRate),
      startDate: rd.startDate.split('T')[0],
      maturityDate: rd.maturityDate.split('T')[0],
      tenure: String(rd.tenure),
      goalId: rd.goalId || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.bankName || !formData.monthlyAmount || !formData.interestRate || !formData.startDate || !formData.tenure) {
      alert('Please fill in all required fields');
      return;
    }

    if (Number(formData.monthlyAmount) <= 0) {
      alert('Monthly amount must be greater than 0');
      return;
    }

    if (Number(formData.interestRate) <= 0) {
      alert('Interest rate must be greater than 0');
      return;
    }

    if (Number(formData.tenure) <= 0) {
      alert('Tenure must be greater than 0');
      return;
    }

    const startDate = new Date(formData.startDate);
    const calculatedMaturityDate = calculateMaturityDate(formData.startDate, Number(formData.tenure));
    const maturityDate = new Date(calculatedMaturityDate);
    
    if (maturityDate <= startDate) {
      alert('Maturity date must be after start date');
      return;
    }

    // Validate tenure matches date range
    if (formData.maturityDate) {
      const calculatedTenure = calculateTenureFromDates(formData.startDate, formData.maturityDate);
      if (Math.abs(calculatedTenure - Number(formData.tenure)) > 1) {
        alert(`Tenure (${formData.tenure} months) doesn't match the date range (${calculatedTenure} months). Please adjust either tenure or maturity date.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const finalMaturityDate = formData.maturityDate || calculatedMaturityDate;
      
      if (editingId) {
        await updateRD({
          id: editingId,
          data: {
            bankName: formData.bankName,
            monthlyAmount: Number(formData.monthlyAmount),
            interestRate: Number(formData.interestRate),
            startDate: formData.startDate,
            maturityDate: finalMaturityDate,
            tenure: Number(formData.tenure),
            goalId: formData.goalId || null,
          },
        }).unwrap();
      } else {
        await createRD({
          bankName: formData.bankName,
          monthlyAmount: Number(formData.monthlyAmount),
          interestRate: Number(formData.interestRate),
          startDate: formData.startDate,
          maturityDate: finalMaturityDate,
          tenure: Number(formData.tenure),
          goalId: formData.goalId || undefined,
        }).unwrap();
      }
      handleClose();
    } catch (error: any) {
      console.error('Error saving recurring deposit:', error);
      alert(`Error: ${error?.data?.error || 'Failed to save recurring deposit. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring deposit?')) {
      try {
        await deleteRD(id).unwrap();
      } catch (error) {
        console.error('Error deleting recurring deposit:', error);
      }
    }
  };

  const calculateDaysRemaining = (maturityDate: string) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const recurringDeposits = data?.recurringDeposits || [];

  const columns = [
    {
      id: 'bankName',
      label: 'Bank Name',
      format: (value: any) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      ),
    },
    {
      id: 'monthlyAmount',
      label: 'Monthly Amount',
      align: 'right' as const,
      format: (value: any) => formatCurrency(value),
    },
    {
      id: 'interestRate',
      label: 'Interest Rate',
      align: 'right' as const,
      format: (value: any) => `${value}% p.a.`,
    },
    {
      id: 'tenure',
      label: 'Tenure (months)',
      align: 'center' as const,
    },
    {
      id: 'startDate',
      label: 'Start Date',
      format: (value: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          {new Date(value).toLocaleDateString()}
        </Box>
      ),
    },
    {
      id: 'maturityDate',
      label: 'Maturity Date',
      format: (value: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          {new Date(value).toLocaleDateString()}
        </Box>
      ),
    },
    {
      id: 'currentAmount',
      label: 'Current Amount',
      align: 'right' as const,
      format: (_: any, row: any) => {
        const currentAmount = calculateCurrentDepositedAmount(row.startDate, row.monthlyAmount);
        return (
          <Box>
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {formatCurrency(currentAmount)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {currentAmount > 0 ? 'Deposited so far' : 'Not started yet'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'maturityAmount',
      label: 'Maturity Amount',
      align: 'right' as const,
      format: (value: any, row: any) => {
        const totalInvested = row.monthlyAmount * row.tenure;
        return (
          <Box>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {formatCurrency(value)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              (Total: {formatCurrency(totalInvested)})
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      format: (_: any, row: any) => {
        const daysRemaining = calculateDaysRemaining(row.maturityDate);
        const isMatured = daysRemaining <= 0;
        return isMatured ? (
          <Chip label="Matured" size="small" color="success" />
        ) : (
          <Chip 
            label={`${daysRemaining} days left`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'goal',
      label: 'Goal',
      format: (value: any) =>
        value ? (
          <Chip label={value.name} size="small" color="primary" variant="outlined" />
        ) : (
          '-'
        ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right' as const,
      format: (_: any, row: any) => (
        <>
          <IconButton size="small" onClick={() => handleEdit(row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Recurring Deposits
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Recurring Deposit
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={recurringDeposits}
        isLoading={isLoading}
        emptyMessage="No recurring deposits found. Add your first recurring deposit to get started!"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Recurring Deposit' : 'Add Recurring Deposit'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Bank Account"
              value={formData.bankAccountId}
              onChange={(e) => {
                const selectedAccount = bankAccountsData?.bankAccounts.find(acc => acc.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  bankAccountId: e.target.value,
                  bankName: selectedAccount?.bankName || ''
                });
              }}
              required
              helperText="Select bank account from your saved accounts"
            >
              <MenuItem value="">Select Bank Account</MenuItem>
              {bankAccountsData?.bankAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.bankName} - {account.accountType} ({formatCurrency(account.balance)})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Monthly Amount"
              type="number"
              value={formData.monthlyAmount}
              onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
              required
              inputProps={{ step: '500' }}
            />
            <TextField
              fullWidth
              label="Interest Rate (% p.a.)"
              type="number"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              required
              inputProps={{ step: '0.1' }}
            />
            <TextField
              fullWidth
              label="Tenure (in months)"
              type="number"
              value={formData.tenure}
              onChange={(e) => {
                const tenure = e.target.value;
                setFormData({ ...formData, tenure });
                // Auto-calculate maturity date when tenure changes
                if (formData.startDate && tenure) {
                  const maturityDate = calculateMaturityDate(formData.startDate, Number(tenure));
                  setFormData(prev => ({ ...prev, tenure, maturityDate }));
                }
              }}
              required
              inputProps={{ step: '1', min: '1' }}
              helperText="Maturity date will be auto-calculated"
            />
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                const startDate = e.target.value;
                setFormData({ ...formData, startDate });
                // Auto-calculate maturity date when start date changes
                if (formData.tenure) {
                  const maturityDate = calculateMaturityDate(startDate, Number(formData.tenure));
                  setFormData(prev => ({ ...prev, startDate, maturityDate }));
                }
              }}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Maturity Date (Auto-calculated)"
              type="date"
              value={formData.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Auto-calculated from tenure. You can adjust if needed."
            />
            {formData.startDate && formData.monthlyAmount && new Date(formData.startDate) < new Date() && (
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark" fontWeight="bold">
                  Current Deposited Amount: {formatCurrency(calculateCurrentDepositedAmount(formData.startDate, Number(formData.monthlyAmount)))}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on {Math.floor((new Date().getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44))} months elapsed
                </Typography>
              </Box>
            )}
            <TextField
              select
              fullWidth
              label="Link to Goal (Optional)"
              value={formData.goalId}
              onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {goalsData?.goals.map((goal) => (
                <MenuItem key={goal.id} value={goal.id}>
                  {goal.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : (editingId ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
