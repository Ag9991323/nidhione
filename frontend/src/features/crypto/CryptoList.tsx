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
import { DataTable } from '@/shared/components';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  useGetCryptoQuery,
  useCreateCryptoMutation,
  useUpdateCryptoMutation,
  useDeleteCryptoMutation,
} from './cryptoAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { formatCurrency } from '@/utils/formatters';

interface CryptoFormData {
  coinName: string;
  symbol: string;
  quantity: string;
  averagePrice: string;
  currentPrice: string;
  currentValue: string;
  goalId: string;
}

export default function CryptoList() {
  const { data: cryptoAssets = [], isLoading } = useGetCryptoQuery();
  const { data: goals = [] } = useGetGoalsQuery();
  const [createCrypto] = useCreateCryptoMutation();
  const [updateCrypto] = useUpdateCryptoMutation();
  const [deleteCrypto] = useDeleteCryptoMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CryptoFormData>({
    coinName: '',
    symbol: '',
    quantity: '',
    averagePrice: '',
    currentPrice: '',
    currentValue: '',
    goalId: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = (crypto?: any) => {
    if (crypto) {
      setEditingId(crypto.id);
      setFormData({
        coinName: crypto.coinName,
        symbol: crypto.symbol,
        quantity: crypto.quantity.toString(),
        averagePrice: crypto.averagePrice.toString(),
        currentPrice: crypto.currentPrice?.toString() || '',
        currentValue: crypto.currentValue.toString(),
        goalId: crypto.goalId?.toString() || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        coinName: '',
        symbol: '',
        quantity: '',
        averagePrice: '',
        currentPrice: '',
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
      if (!formData.coinName || !formData.symbol || !formData.quantity || !formData.averagePrice) {
        setError('Please fill all required fields');
        setIsSubmitting(false);
        return;
      }

      const data = {
        coinName: formData.coinName,
        symbol: formData.symbol.toUpperCase(),
        quantity: parseFloat(formData.quantity),
        averagePrice: parseFloat(formData.averagePrice),
        currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        goalId: formData.goalId || undefined,
      };

      if (editingId) {
        await updateCrypto({ id: editingId, data }).unwrap();
      } else {
        await createCrypto(data).unwrap();
      }
      handleClose();
    } catch (err: any) {
      setError(err.data?.error || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this crypto asset?')) {
      try {
        await deleteCrypto(id).unwrap();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const totalValue = cryptoAssets.reduce((sum, crypto) => sum + crypto.currentValue, 0);
  const totalInvested = cryptoAssets.reduce(
    (sum, crypto) => sum + crypto.quantity * crypto.averagePrice,
    0,
  );
  const totalReturns = totalValue - totalInvested;

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cryptocurrency</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Crypto
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Value
          </Typography>
          <Typography variant="h6">{formatCurrency(totalValue)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Invested
          </Typography>
          <Typography variant="h6">{formatCurrency(totalInvested)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Returns
          </Typography>
          <Typography variant="h6" color={totalReturns >= 0 ? 'success.main' : 'error.main'}>
            {formatCurrency(totalReturns)}
          </Typography>
        </Paper>
      </Box>

      <DataTable
        columns={[
          { id: 'coinName', label: 'Name' },
          { id: 'symbol', label: 'Symbol' },
          { id: 'quantity', label: 'Quantity', align: 'right' },
          {
            id: 'averagePrice',
            label: 'Avg Price',
            align: 'right',
            format: v => formatCurrency(v),
          },
          {
            id: 'currentValue',
            label: 'Current Value',
            align: 'right',
            format: v => formatCurrency(v),
          },
          {
            id: 'returns',
            label: 'Returns',
            align: 'right',
            format: (_, row) => {
              const invested = row.quantity * row.averagePrice;
              const returns = row.currentValue - invested;
              return (
                <Typography
                  variant="body2"
                  sx={{ color: returns >= 0 ? 'success.main' : 'error.main' }}
                >
                  {formatCurrency(returns)}
                </Typography>
              );
            },
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
        rows={cryptoAssets}
        isLoading={isLoading}
        emptyMessage="No crypto assets found. Add one to get started."
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Crypto' : 'Add Crypto'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Coin Name"
            value={formData.coinName}
            onChange={e => setFormData({ ...formData, coinName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Symbol"
            value={formData.symbol}
            onChange={e => setFormData({ ...formData, symbol: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Average Price"
            type="number"
            value={formData.averagePrice}
            onChange={e => setFormData({ ...formData, averagePrice: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Current Price"
            type="number"
            value={formData.currentPrice}
            onChange={e => setFormData({ ...formData, currentPrice: e.target.value })}
            margin="normal"
            helperText="Optional"
          />
          <TextField
            fullWidth
            label="Current Value"
            type="number"
            value={formData.currentValue}
            onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
            margin="normal"
            helperText="Leave empty to auto-calculate"
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
