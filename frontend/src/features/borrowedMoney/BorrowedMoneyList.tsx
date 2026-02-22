import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { DataTable } from '@/shared/components';
import { useGetBorrowedMoneyQuery, useCreateBorrowedMoneyMutation, useUpdateBorrowedMoneyMutation, useDeleteBorrowedMoneyMutation } from './borrowedMoneyAPI';
import { formatCurrency } from '@/utils/formatters';

interface FormData {
  lenderName: string;
  amount: string;
  interestRate: string;
  borrowDate: string;
  returnDate: string;
  status: 'pending' | 'partially_returned' | 'fully_returned';
  amountReturned: string;
  notes: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' as const },
  { value: 'partially_returned', label: 'Partially Returned', color: 'info' as const },
  { value: 'fully_returned', label: 'Fully Returned', color: 'success' as const },
];

export default function BorrowedMoneyList() {
  const { data: borrowedMoney = [], isLoading } = useGetBorrowedMoneyQuery();
  const [createBorrowedMoney] = useCreateBorrowedMoneyMutation();
  const [updateBorrowedMoney] = useUpdateBorrowedMoneyMutation();
  const [deleteBorrowedMoney] = useDeleteBorrowedMoneyMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    lenderName: '',
    amount: '',
    interestRate: '0',
    borrowDate: '',
    returnDate: '',
    status: 'pending',
    amountReturned: '0',
    notes: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        lenderName: item.lenderName,
        amount: item.amount.toString(),
        interestRate: (item.interestRate || 0).toString(),
        borrowDate: item.borrowDate.split('T')[0],
        returnDate: item.returnDate ? item.returnDate.split('T')[0] : '',
        status: item.status,
        amountReturned: item.amountReturned.toString(),
        notes: item.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        lenderName: '',
        amount: '',
        interestRate: '0',
        borrowDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        status: 'pending',
        amountReturned: '0',
        notes: '',
      });
    }
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

      const data: any = {
        lenderName: formData.lenderName,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        borrowDate: new Date(formData.borrowDate).toISOString(),
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : undefined,
        status: formData.status,
        amountReturned: parseFloat(formData.amountReturned),
        notes: formData.notes || undefined,
      };

      if (editingId) {
        await updateBorrowedMoney({ id: editingId, data }).unwrap();
      } else {
        await createBorrowedMoney(data).unwrap();
      }
      handleClose();
    } catch (err: any) {
      setError(err.data?.error || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteBorrowedMoney(id).unwrap();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const totalBorrowed = borrowedMoney.reduce((sum, item) => sum + item.amount, 0);
  const totalOutstanding = borrowedMoney.reduce((sum, item) => sum + (item.amount - item.amountReturned), 0);
  const totalReturned = borrowedMoney.reduce((sum, item) => sum + item.amountReturned, 0);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Borrowed Money</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Record
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">Total Borrowed</Typography>
          <Typography variant="h5" color="error.main">{formatCurrency(totalBorrowed)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">Outstanding</Typography>
          <Typography variant="h5" color="warning.main">{formatCurrency(totalOutstanding)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">Returned</Typography>
          <Typography variant="h5" color="success.main">{formatCurrency(totalReturned)}</Typography>
        </Paper>
      </Box>

      <DataTable
        columns={[
          { id: 'lenderName', label: 'Lender Name' },
          { id: 'amount', label: 'Amount', align: 'right', format: (v) => formatCurrency(v) },
          { id: 'interestRate', label: 'Interest Rate', align: 'right', format: (v) => `${v || 0}%` },
          { id: 'borrowDate', label: 'Borrow Date', format: (v) => new Date(v).toLocaleDateString() },
          { 
            id: 'returnDate', 
            label: 'Return Date', 
            format: (v) => v ? new Date(v).toLocaleDateString() : '-'
          },
          {
            id: 'status',
            label: 'Status',
            format: (v) => (
              <Chip
                label={statusOptions.find(s => s.value === v)?.label}
                color={statusOptions.find(s => s.value === v)?.color}
                size="small"
              />
            ),
          },
          {
            id: 'outstanding',
            label: 'Outstanding',
            align: 'right',
            format: (_, row) => formatCurrency(row.amount - row.amountReturned),
          },
          { id: 'notes', label: 'Notes', format: (v) => v || '-' },
          {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            format: (_, row) => (
              <>
                <IconButton size="small" onClick={() => handleOpen(row)}>
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(row.id)}>
                  <Delete />
                </IconButton>
              </>
            ),
          },
        ]}
        rows={borrowedMoney}
        isLoading={isLoading}
        emptyMessage="No records found. Add one to get started."
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Record' : 'Add Record'}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Lender Name"
            value={formData.lenderName}
            onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Interest Rate (%)"
            type="number"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Borrow Date"
            type="date"
            value={formData.borrowDate}
            onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="Return Date"
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText="Optional"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            margin="normal"
            required
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Amount Returned"
            type="number"
            value={formData.amountReturned}
            onChange={(e) => setFormData({ ...formData, amountReturned: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
            helperText="Optional"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
