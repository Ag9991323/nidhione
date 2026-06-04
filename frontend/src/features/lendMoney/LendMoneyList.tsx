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
import {
  useGetLendMoneyQuery,
  useCreateLendMoneyMutation,
  useUpdateLendMoneyMutation,
  useDeleteLendMoneyMutation,
} from './lendMoneyAPI';
import { formatCurrency } from '@/utils/formatters';

interface FormData {
  borrowerName: string;
  amount: string;
  interestRate: string;
  lendDate: string;
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

export default function LendMoneyList() {
  const { data: lendMoney = [], isLoading } = useGetLendMoneyQuery();
  const [createLendMoney] = useCreateLendMoneyMutation();
  const [updateLendMoney] = useUpdateLendMoneyMutation();
  const [deleteLendMoney] = useDeleteLendMoneyMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    borrowerName: '',
    amount: '',
    interestRate: '0',
    lendDate: '',
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
        borrowerName: item.borrowerName,
        amount: item.amount.toString(),
        interestRate: (item.interestRate || 0).toString(),
        lendDate: item.lendDate.split('T')[0],
        returnDate: item.returnDate ? item.returnDate.split('T')[0] : '',
        status: item.status,
        amountReturned: item.amountReturned.toString(),
        notes: item.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        borrowerName: '',
        amount: '',
        interestRate: '0',
        lendDate: new Date().toISOString().split('T')[0],
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
        borrowerName: formData.borrowerName,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        lendDate: new Date(formData.lendDate).toISOString(),
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : undefined,
        status: formData.status,
        amountReturned: parseFloat(formData.amountReturned),
        notes: formData.notes || undefined,
      };

      if (editingId) {
        await updateLendMoney({ id: editingId, data }).unwrap();
      } else {
        await createLendMoney(data).unwrap();
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
        await deleteLendMoney(id).unwrap();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const totalLent = lendMoney.reduce((sum, item) => sum + item.amount, 0);
  const totalOutstanding = lendMoney.reduce(
    (sum, item) => sum + (item.amount - item.amountReturned),
    0,
  );
  const totalReturned = lendMoney.reduce((sum, item) => sum + item.amountReturned, 0);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Lend Money</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Record
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Total Lent
          </Typography>
          <Typography variant="h5" color="primary">
            {formatCurrency(totalLent)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Outstanding
          </Typography>
          <Typography variant="h5" color="warning.main">
            {formatCurrency(totalOutstanding)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Returned
          </Typography>
          <Typography variant="h5" color="success.main">
            {formatCurrency(totalReturned)}
          </Typography>
        </Paper>
      </Box>

      <DataTable
        columns={[
          { id: 'borrowerName', label: 'Borrower Name' },
          { id: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(v) },
          { id: 'interestRate', label: 'Interest Rate', align: 'right', format: v => `${v || 0}%` },
          { id: 'lendDate', label: 'Lend Date', format: v => new Date(v).toLocaleDateString() },
          {
            id: 'returnDate',
            label: 'Return Date',
            format: v => (v ? new Date(v).toLocaleDateString() : '-'),
          },
          {
            id: 'status',
            label: 'Status',
            format: v => (
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
          { id: 'notes', label: 'Notes', format: v => v || '-' },
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
        rows={lendMoney}
        isLoading={isLoading}
        emptyMessage="No records found. Add one to get started."
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Record' : 'Add Record'}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Borrower Name"
            value={formData.borrowerName}
            onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
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
          />
          <TextField
            fullWidth
            label="Lend Date"
            type="date"
            value={formData.lendDate}
            onChange={e => setFormData({ ...formData, lendDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="Return Date"
            type="date"
            value={formData.returnDate}
            onChange={e => setFormData({ ...formData, returnDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText="Optional"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            margin="normal"
            required
          >
            {statusOptions.map(option => (
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
            onChange={e => setFormData({ ...formData, amountReturned: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
