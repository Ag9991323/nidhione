import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  useGetLICQuery,
  useCreateLICMutation,
  useUpdateLICMutation,
  useDeleteLICMutation,
} from './licAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { formatCurrency } from '@/utils/formatters';
import { DataTable } from '@/shared/components';

interface LICFormData {
  policyNumber: string;
  policyName: string;
  sumAssured: string;
  premiumAmount: string;
  maturityDate: string;
  currentValue: string;
  goalId: string;
}

export default function LICList() {
  const { data: licPolicies = [], isLoading } = useGetLICQuery();
  const { data: goals = [] } = useGetGoalsQuery();
  const [createLIC] = useCreateLICMutation();
  const [updateLIC] = useUpdateLICMutation();
  const [deleteLIC] = useDeleteLICMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LICFormData>({
    policyNumber: '',
    policyName: '',
    sumAssured: '',
    premiumAmount: '',
    maturityDate: '',
    currentValue: '',
    goalId: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = (lic?: any) => {
    if (lic) {
      setEditingId(lic.id);
      setFormData({
        policyNumber: lic.policyNumber,
        policyName: lic.policyName,
        sumAssured: lic.sumAssured.toString(),
        premiumAmount: lic.premiumAmount.toString(),
        maturityDate: lic.maturityDate.split('T')[0],
        currentValue: lic.currentValue.toString(),
        goalId: lic.goalId?.toString() || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        policyNumber: '',
        policyName: '',
        sumAssured: '',
        premiumAmount: '',
        maturityDate: new Date().toISOString().split('T')[0],
        currentValue: '',
        goalId: '',
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
        !formData.policyNumber ||
        !formData.policyName ||
        !formData.sumAssured ||
        !formData.premiumAmount ||
        !formData.maturityDate
      ) {
        setError('Please fill all required fields');
        setIsSubmitting(false);
        return;
      }

      const data = {
        policyNumber: formData.policyNumber,
        policyName: formData.policyName,
        sumAssured: parseFloat(formData.sumAssured),
        premiumAmount: parseFloat(formData.premiumAmount),
        maturityDate: formData.maturityDate,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        goalId: formData.goalId || undefined,
      };

      if (editingId) {
        await updateLIC({ id: editingId, data }).unwrap();
      } else {
        await createLIC(data).unwrap();
      }
      handleClose();
    } catch (err: any) {
      setError(err.data?.error || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this LIC policy?')) {
      try {
        await deleteLIC(id).unwrap();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const totalValue = licPolicies.reduce((sum, lic) => sum + lic.currentValue, 0);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">LIC Policies</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add LIC Policy
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Value
          </Typography>
          <Typography variant="h6">{formatCurrency(totalValue)}</Typography>
        </Paper>
      </Box>

      <DataTable
        columns={[
          { id: 'policyNumber', label: 'Policy Number' },
          { id: 'policyName', label: 'Policy Name' },
          {
            id: 'sumAssured',
            label: 'Sum Assured',
            align: 'right',
            format: v => formatCurrency(v),
          },
          { id: 'premiumAmount', label: 'Premium', align: 'right', format: v => formatCurrency(v) },
          {
            id: 'maturityDate',
            label: 'Maturity Date',
            format: v => new Date(v).toLocaleDateString(),
          },
          {
            id: 'currentValue',
            label: 'Current Value',
            align: 'right',
            format: v => formatCurrency(v),
          },
          {
            id: 'goal',
            label: 'Goal',
            format: v =>
              v ? <Chip label={v.name} size="small" color="primary" variant="outlined" /> : '-',
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
        rows={licPolicies}
        isLoading={isLoading}
        emptyMessage="No LIC policies found. Add one to get started."
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit LIC Policy' : 'Add LIC Policy'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Policy Number"
            value={formData.policyNumber}
            onChange={e => setFormData({ ...formData, policyNumber: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Policy Name"
            value={formData.policyName}
            onChange={e => setFormData({ ...formData, policyName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Sum Assured"
            type="number"
            value={formData.sumAssured}
            onChange={e => setFormData({ ...formData, sumAssured: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Premium Amount"
            type="number"
            value={formData.premiumAmount}
            onChange={e => setFormData({ ...formData, premiumAmount: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Maturity Date"
            type="date"
            value={formData.maturityDate}
            onChange={e => setFormData({ ...formData, maturityDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="Current Value"
            type="number"
            value={formData.currentValue}
            onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
            margin="normal"
            helperText="Leave empty to use sum assured"
          />
          <TextField
            fullWidth
            select
            label="Goal (Optional)"
            value={formData.goalId}
            onChange={e => setFormData({ ...formData, goalId: e.target.value })}
            margin="normal"
          >
            <MenuItem value="">None</MenuItem>
            {(goals as any)?.goals?.map((goal: any) => (
              <MenuItem key={goal.id} value={goal.id}>
                {goal.name}
              </MenuItem>
            ))}
          </TextField>
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
