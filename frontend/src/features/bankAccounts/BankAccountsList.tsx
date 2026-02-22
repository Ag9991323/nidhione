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
import { Add, Edit, Delete, AccountBalance } from '@mui/icons-material';
import {
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} from './bankAccountsAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { formatCurrency } from '@/utils/formatters';
import { DataTable } from '@/shared/components';

const ACCOUNT_TYPES = ['Savings', 'Current', 'Salary'];

export default function BankAccountsList() {
  const { data, isLoading } = useGetBankAccountsQuery();
  const { data: goalsData } = useGetGoalsQuery();
  const [createAccount] = useCreateBankAccountMutation();
  const [updateAccount] = useUpdateBankAccountMutation();
  const [deleteAccount] = useDeleteBankAccountMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: 'Savings',
    balance: '',
    goalId: '',
  });

  const handleOpen = () => {
    setFormData({
      bankName: '',
      accountType: 'Savings',
      balance: '',
      goalId: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      bankName: '',
      accountType: 'Savings',
      balance: '',
      goalId: '',
    });
  };

  const handleEdit = (account: any) => {
    setEditingId(account.id);
    setFormData({
      bankName: account.bankName,
      accountType: account.accountType,
      balance: String(account.balance),
      goalId: account.goalId || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.bankName || !formData.accountType || !formData.balance) {
      alert('Please fill in all required fields');
      return;
    }

    if (Number(formData.balance) < 0) {
      alert('Balance cannot be negative');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateAccount({
          id: editingId,
          data: {
            bankName: formData.bankName,
            accountType: formData.accountType,
            balance: Number(formData.balance),
            goalId: formData.goalId || null,
          },
        }).unwrap();
      } else {
        await createAccount({
          bankName: formData.bankName,
          accountType: formData.accountType,
          balance: Number(formData.balance),
          goalId: formData.goalId || undefined,
        }).unwrap();
      }
      handleClose();
    } catch (error: any) {
      console.error('Error saving bank account:', error);
      alert(`Error: ${error?.data?.error || 'Failed to save bank account. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteAccount(id).unwrap();
      } catch (error) {
        console.error('Error deleting bank account:', error);
      }
    }
  };

  const bankAccounts = data?.bankAccounts || [];
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  const columns = [
    {
      id: 'bankName',
      label: 'Bank Name',
      format: (value: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalance sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'accountType',
      label: 'Account Type',
      format: (value: any) => <Chip label={value} size="small" color="primary" variant="outlined" />,
    },
    {
      id: 'balance',
      label: 'Balance',
      align: 'right' as const,
      format: (value: any) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatCurrency(value)}
        </Typography>
      ),
    },
    {
      id: 'goal',
      label: 'Goal',
      format: (value: any) =>
        value ? <Chip label={value.name} size="small" color="primary" variant="outlined" /> : '-',
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      format: (value: any) => new Date(value).toLocaleDateString(),
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
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Bank Accounts
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
            Total Balance: {formatCurrency(totalBalance)}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Bank Account
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={bankAccounts}
        isLoading={isLoading}
        emptyMessage="No bank accounts found. Add your first bank account to get started!"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              required
            />
            <TextField
              select
              fullWidth
              label="Account Type"
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              required
            >
              {ACCOUNT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Balance"
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              required
              inputProps={{ step: '1000' }}
            />
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
