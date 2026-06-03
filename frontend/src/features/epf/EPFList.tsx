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
  useGetEPFsQuery,
  useCreateEPFMutation,
  useUpdateEPFMutation,
  useDeleteEPFMutation,
} from './epfAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { formatCurrency } from '@/utils/formatters';
import { DataTable } from '@/shared/components';

export default function EPFList() {
  const { data, isLoading } = useGetEPFsQuery();
  const { data: goalsData } = useGetGoalsQuery();
  const [createEPF] = useCreateEPFMutation();
  const [updateEPF] = useUpdateEPFMutation();
  const [deleteEPF] = useDeleteEPFMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    balance: '',
    goalId: '',
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      balance: '',
      goalId: '',
    });
  };

  const handleEdit = (epf: any) => {
    setEditingId(epf.id);
    setFormData({
      balance: String(epf.balance),
      goalId: epf.goalId || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.balance) {
      alert('Please enter the balance');
      return;
    }

    if (Number(formData.balance) <= 0) {
      alert('Balance must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateEPF({
          id: editingId,
          data: {
            balance: Number(formData.balance),
            goalId: formData.goalId || null,
          },
        }).unwrap();
      } else {
        await createEPF({
          balance: Number(formData.balance),
          goalId: formData.goalId || undefined,
        }).unwrap();
      }
      handleClose();
    } catch (error: any) {
      console.error('Error saving EPF account:', error);
      alert(`Error: ${error?.data?.error || 'Failed to save EPF account. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this EPF account?')) {
      try {
        await deleteEPF(id).unwrap();
      } catch (error) {
        console.error('Error deleting EPF account:', error);
      }
    }
  };

  const epfAccounts = data?.epfAccounts || [];

  const columns = [
    {
      id: 'account',
      label: 'Account',
      format: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight="medium">
            EPF Account
          </Typography>
        </Box>
      ),
    },
    {
      id: 'balance',
      label: 'Balance',
      align: 'right' as const,
      format: (value: any) => (
        <Typography variant="body1" fontWeight="bold" color="primary">
          {formatCurrency(value)}
        </Typography>
      ),
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      format: (value: any) => (value ? new Date(value).toLocaleDateString() : '-'),
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
          EPF / Provident Fund
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add EPF Account
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={epfAccounts}
        isLoading={isLoading}
        emptyMessage="No EPF accounts found. Add your EPF account to get started!"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit EPF Account' : 'Add EPF Account'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Current Balance"
              type="number"
              value={formData.balance}
              onChange={e => setFormData({ ...formData, balance: e.target.value })}
              required
              inputProps={{ step: '1000' }}
              helperText="Enter your current EPF balance"
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
