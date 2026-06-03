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
  useGetFixedDepositsQuery,
  useCreateFixedDepositMutation,
  useUpdateFixedDepositMutation,
  useDeleteFixedDepositMutation,
} from './fixedDepositsAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { formatCurrency } from '@/utils/formatters';
import { DataTable } from '@/shared/components';

export default function FixedDepositsList() {
  const { data, isLoading } = useGetFixedDepositsQuery();
  const { data: goalsData } = useGetGoalsQuery();
  const [createFD] = useCreateFixedDepositMutation();
  const [updateFD] = useUpdateFixedDepositMutation();
  const [deleteFD] = useDeleteFixedDepositMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    amount: '',
    interestRate: '',
    startDate: '',
    maturityDate: '',
    goalId: '',
  });

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleOpen = () => {
    setFormData({
      bankName: '',
      amount: '',
      interestRate: '',
      startDate: getTodayDate(),
      maturityDate: '',
      goalId: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      bankName: '',
      amount: '',
      interestRate: '',
      startDate: '',
      maturityDate: '',
      goalId: '',
    });
  };

  const handleEdit = (fd: any) => {
    setEditingId(fd.id);
    setFormData({
      bankName: fd.bankName,
      amount: String(fd.amount),
      interestRate: String(fd.interestRate),
      startDate: fd.startDate.split('T')[0],
      maturityDate: fd.maturityDate.split('T')[0],
      goalId: fd.goalId || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    // Log form data for debugging
    console.log('Form data:', formData);

    // Validation
    if (
      !formData.bankName ||
      !formData.amount ||
      !formData.interestRate ||
      !formData.startDate ||
      !formData.maturityDate
    ) {
      const missingFields = [];
      if (!formData.bankName) missingFields.push('Bank Name');
      if (!formData.amount) missingFields.push('Amount');
      if (!formData.interestRate) missingFields.push('Interest Rate');
      if (!formData.startDate) missingFields.push('Start Date');
      if (!formData.maturityDate) missingFields.push('Maturity Date');

      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (Number(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (Number(formData.interestRate) <= 0) {
      alert('Interest rate must be greater than 0');
      return;
    }

    const startDate = new Date(formData.startDate);
    const maturityDate = new Date(formData.maturityDate);

    if (maturityDate <= startDate) {
      alert('Maturity date must be after start date');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateFD({
          id: editingId,
          data: {
            bankName: formData.bankName,
            amount: Number(formData.amount),
            interestRate: Number(formData.interestRate),
            startDate: formData.startDate,
            maturityDate: formData.maturityDate,
            goalId: formData.goalId || null,
          },
        }).unwrap();
      } else {
        await createFD({
          bankName: formData.bankName,
          amount: Number(formData.amount),
          interestRate: Number(formData.interestRate),
          startDate: formData.startDate,
          maturityDate: formData.maturityDate,
          goalId: formData.goalId || undefined,
        }).unwrap();
      }
      handleClose();
    } catch (error: any) {
      console.error('Error saving fixed deposit:', error);
      alert(`Error: ${error?.data?.error || 'Failed to save fixed deposit. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this fixed deposit?')) {
      try {
        await deleteFD(id).unwrap();
      } catch (error) {
        console.error('Error deleting fixed deposit:', error);
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

  const fixedDeposits = data?.fixedDeposits || [];

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
      id: 'amount',
      label: 'Amount',
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
      id: 'maturityAmount',
      label: 'Maturity Amount',
      align: 'right' as const,
      format: (value: any) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatCurrency(value)}
        </Typography>
      ),
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
        value ? <Chip label={value.name} size="small" color="primary" variant="outlined" /> : '-',
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
          Fixed Deposits
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Fixed Deposit
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={fixedDeposits}
        isLoading={isLoading}
        emptyMessage="No fixed deposits found. Add your first fixed deposit to get started!"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Fixed Deposit' : 'Add Fixed Deposit'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Bank Name"
              value={formData.bankName}
              onChange={e => setFormData({ ...formData, bankName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Principal Amount"
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
              inputProps={{ step: '1000' }}
            />
            <TextField
              fullWidth
              label="Interest Rate (% p.a.)"
              type="number"
              value={formData.interestRate}
              onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
              required
              inputProps={{ step: '0.1' }}
            />
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Maturity Date"
              type="date"
              value={formData.maturityDate}
              onChange={e => setFormData({ ...formData, maturityDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              fullWidth
              label="Link to Goal (Optional)"
              value={formData.goalId}
              onChange={e => setFormData({ ...formData, goalId: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {goalsData?.goals.map(goal => (
                <MenuItem key={goal.id} value={goal.id}>
                  {goal.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
