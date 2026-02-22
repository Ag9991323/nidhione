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
  Alert,
  MenuItem,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { DataTable } from '@/shared/components';
import { useGetRealEstateQuery, useCreateRealEstateMutation, useUpdateRealEstateMutation, useDeleteRealEstateMutation } from './realEstateAPI';
import { useGetLiabilitiesQuery } from '@/features/liabilities/liabilitiesAPI';
import { formatCurrency } from '@/utils/formatters';

interface FormData {
  propertyType: string;
  location: string;
  purchasePrice: string;
  purchaseDate: string;
  currentValue: string;
  liabilityId: string;
}

const propertyTypes = [
  'Residential House',
  'Apartment',
  'Villa',
  'Plot/Land',
  'Commercial Property',
  'Farm Land',
  'Other',
];

export default function RealEstateList() {
  const { data: realEstates = [], isLoading } = useGetRealEstateQuery();
  const { data: liabilities = [] } = useGetLiabilitiesQuery();
  const [createRealEstate] = useCreateRealEstateMutation();
  const [updateRealEstate] = useUpdateRealEstateMutation();
  const [deleteRealEstate] = useDeleteRealEstateMutation();

  // Filter only home loans
  const homeLoans = liabilities.filter(l => l.type === 'home_loan');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    propertyType: 'Residential House',
    location: '',
    purchasePrice: '',
    purchaseDate: '',
    currentValue: '',
    liabilityId: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        propertyType: item.propertyType,
        location: item.location,
        purchasePrice: item.purchasePrice.toString(),
        purchaseDate: item.purchaseDate.split('T')[0],
        currentValue: item.currentValue ? item.currentValue.toString() : '',
        liabilityId: item.liabilityId || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        propertyType: 'Residential House',
        location: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        currentValue: '',
        liabilityId: '',
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
        propertyType: formData.propertyType,
        location: formData.location,
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        liabilityId: formData.liabilityId || undefined,
      };

      if (editingId) {
        await updateRealEstate({ id: editingId, data }).unwrap();
      } else {
        await createRealEstate(data).unwrap();
      }
      handleClose();
    } catch (err: any) {
      setError(err.data?.error || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteRealEstate(id).unwrap();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const totalPurchaseValue = realEstates.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalCurrentValue = realEstates.reduce((sum, item) => sum + (item.currentValue || item.purchasePrice), 0);
  const totalGain = totalCurrentValue - totalPurchaseValue;

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Real Estate</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Property
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">Total Purchase Value</Typography>
          <Typography variant="h5" color="primary">{formatCurrency(totalPurchaseValue)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">Current Value</Typography>
          <Typography variant="h5" color="success.main">{formatCurrency(totalCurrentValue)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">Gain/Loss</Typography>
          <Typography variant="h5" color={totalGain >= 0 ? 'success.main' : 'error.main'}>
            {formatCurrency(totalGain)}
          </Typography>
        </Paper>
      </Box>

      <DataTable
        columns={[
          { id: 'propertyType', label: 'Property Type' },
          { id: 'location', label: 'Location' },
          { id: 'purchasePrice', label: 'Purchase Price', align: 'right', format: (v) => formatCurrency(v) },
          { 
            id: 'currentValue', 
            label: 'Current Value', 
            align: 'right', 
            format: (v, row) => formatCurrency(v || row.purchasePrice)
          },
          { id: 'purchaseDate', label: 'Purchase Date', format: (v) => new Date(v).toLocaleDateString() },
          {
            id: 'liability',
            label: 'Linked Home Loan',
            format: (v) =>
              v ? (
                <Chip
                  label={`${v.name} (${formatCurrency(v.currentBalance)})`}
                  color="warning"
                  size="small"
                />
              ) : (
                '-'
              ),
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
        rows={realEstates}
        isLoading={isLoading}
        emptyMessage="No properties found. Add one to get started."
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            select
            label="Property Type"
            value={formData.propertyType}
            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
            margin="normal"
            required
          >
            {propertyTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Purchase Price"
            type="number"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Current Value"
            type="number"
            value={formData.currentValue}
            onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
            margin="normal"
            helperText="Optional - Leave empty to use purchase price"
          />
          <TextField
            fullWidth
            label="Purchase Date"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            select
            label="Link to Home Loan"
            value={formData.liabilityId}
            onChange={(e) => setFormData({ ...formData, liabilityId: e.target.value })}
            margin="normal"
            helperText="Optional - Link this property to a home loan"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {homeLoans.map((loan) => (
              <MenuItem key={loan.id} value={loan.id}>
                {loan.name} ({formatCurrency(loan.currentBalance)} outstanding)
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
