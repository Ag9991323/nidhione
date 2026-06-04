import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';
import { DataTable } from '@/shared/components';
import {
  useGetLiabilitiesQuery,
  useUpdateLiabilityMutation,
  useDeleteLiabilityMutation,
} from './liabilitiesAPI';
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

const liabilityTypes = [
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'education_loan', label: 'Education Loan' },
  { value: 'other', label: 'Other' },
];

export default function LiabilitiesList() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { data: allLiabilities = [], isLoading } = useGetLiabilitiesQuery();
  const [updateLiability] = useUpdateLiabilityMutation();
  const [deleteLiability] = useDeleteLiabilityMutation();

  // Filter liabilities by type
  const liabilities = type ? allLiabilities.filter(l => l.type === type) : allLiabilities;
  const typeLabel = liabilityTypes.find(t => t.value === type)?.label || 'All Liabilities';

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LiabilityFormData>({
    name: '',
    type: 'personal_loan',
    principalAmount: '',
    currentBalance: '',
    interestRate: '',
    emiAmount: '',
    startDate: '',
    endDate: '',
    lender: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = (liability?: any) => {
    if (liability) {
      setEditingId(liability.id);
      setFormData({
        name: liability.name,
        type: liability.type,
        principalAmount: liability.principalAmount.toString(),
        currentBalance: liability.currentBalance.toString(),
        interestRate: liability.interestRate.toString(),
        emiAmount: liability.emiAmount?.toString() || '',
        startDate: liability.startDate.split('T')[0],
        endDate: liability.endDate ? liability.endDate.split('T')[0] : '',
        lender: liability.lender || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        type: 'personal_loan',
        principalAmount: '',
        currentBalance: '',
        interestRate: '',
        emiAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        lender: '',
      });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setError('');
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      if (
        !formData.name ||
        !formData.type ||
        !formData.principalAmount ||
        !formData.currentBalance ||
        !formData.interestRate ||
        !formData.startDate
      ) {
        setError('Please fill all required fields');
        setIsSubmitting(false);
        return;
      }

      const data = {
        name: formData.name,
        type: formData.type,
        principalAmount: parseFloat(formData.principalAmount),
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate),
        emiAmount: formData.emiAmount ? parseFloat(formData.emiAmount) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        lender: formData.lender || undefined,
      };

      if (editingId) {
        await updateLiability({ id: editingId, data }).unwrap();
      }
      handleClose();
    } catch (err: any) {
      setError(err.data?.error || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this liability?')) {
      try {
        await deleteLiability(id).unwrap();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const totalBalance = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
  const totalPrincipal = liabilities.reduce((sum, liability) => sum + liability.principalAmount, 0);
  const totalEMI = liabilities.reduce((sum, liability) => sum + (liability.emiAmount || 0), 0);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/liabilities')}
            sx={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            Liabilities
          </Link>
          <Typography color="text.primary">{typeLabel}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/liabilities')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">{typeLabel}</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Outstanding
          </Typography>
          <Typography variant="h6" color="error.main">
            {formatCurrency(totalBalance)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Principal
          </Typography>
          <Typography variant="h6">{formatCurrency(totalPrincipal)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Monthly EMI
          </Typography>
          <Typography variant="h6">{formatCurrency(totalEMI)}</Typography>
        </Paper>
      </Box>

      <DataTable
        columns={[
          { id: 'name', label: 'Name' },
          {
            id: 'type',
            label: 'Type',
            format: v => liabilityTypes.find(t => t.value === v)?.label,
          },
          {
            id: 'principalAmount',
            label: 'Principal',
            align: 'right',
            format: v => formatCurrency(v),
          },
          {
            id: 'currentBalance',
            label: 'Outstanding',
            align: 'right',
            format: v => formatCurrency(v),
          },
          { id: 'interestRate', label: 'Interest Rate', align: 'right', format: v => `${v}%` },
          {
            id: 'emiAmount',
            label: 'EMI',
            align: 'right',
            format: v => (v ? formatCurrency(v) : '-'),
          },
          { id: 'lender', label: 'Lender', format: v => v || '-' },
          {
            id: 'endDate',
            label: 'End Date',
            format: v => (v ? new Date(v).toLocaleDateString() : '-'),
          },
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
        rows={liabilities}
        isLoading={isLoading}
        emptyMessage="No liabilities found. Add one to get started."
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Liability' : 'Add Liability'}</DialogTitle>
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
            {liabilityTypes.map(type => (
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
            {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
