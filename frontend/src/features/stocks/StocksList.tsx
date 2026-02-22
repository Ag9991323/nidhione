import { useState, useCallback } from 'react';
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
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { DataTable } from '@/shared/components';
import { useGetStocksQuery, useCreateStockMutation, useUpdateStockMutation, useDeleteStockMutation, useLazySearchStockQuery, StockSearchResult } from './stocksAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { debounce } from 'lodash';

export default function StocksList() {
  const { data, isLoading } = useGetStocksQuery();
  const { data: goalsData } = useGetGoalsQuery();
  const [createStock] = useCreateStockMutation();
  const [updateStock] = useUpdateStockMutation();
  const [deleteStock] = useDeleteStockMutation();
  const [searchStocks, { data: searchResults, isLoading: isSearching }] = useLazySearchStockQuery();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    companyName: '',
    exchange: 'NSE' as 'NSE' | 'BSE',
    quantity: '',
    averagePrice: '',
    goalId: '',
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query && query.length >= 2) {
        searchStocks(query);
      }
    }, 300),
    [searchStocks]
  );

  const handleStockSearch = (_event: React.SyntheticEvent, value: string) => {
    debouncedSearch(value);
  };

  const handleStockSelect = (_event: React.SyntheticEvent, value: string | StockSearchResult | null) => {
    if (value && typeof value !== 'string') {
      setSelectedStock(value);
      setFormData({
        ...formData,
        symbol: value.symbol,
        companyName: value.name,
        exchange: value.exchange === 'NSE' ? 'NSE' : 'BSE',
      });
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setSelectedStock(null);
  };
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setSelectedStock(null);
    setFormData({
      symbol: '',
      companyName: '',
      exchange: 'NSE',
      quantity: '',
      averagePrice: '',
      goalId: '',
    });
  };

  const handleEdit = (stock: any) => {
    setEditingId(stock.id);
    setFormData({
      symbol: stock.symbol,
      companyName: stock.companyName,
      exchange: stock.exchange,
      quantity: String(stock.quantity),
      averagePrice: String(stock.averagePrice),
      goalId: stock.goalId || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateStock({
          id: editingId,
          data: {
            quantity: Number(formData.quantity),
            averagePrice: Number(formData.averagePrice),
            goalId: formData.goalId || null,
          },
        }).unwrap();
      } else {
        if (!formData.symbol || !formData.companyName) {
          alert('Please select a stock from the search results');
          return;
        }
        await createStock({
          symbol: formData.symbol,
          companyName: formData.companyName,
          exchange: formData.exchange,
          quantity: Number(formData.quantity),
          averagePrice: Number(formData.averagePrice),
          goalId: formData.goalId || undefined,
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        await deleteStock(id).unwrap();
      } catch (error) {
        console.error('Error deleting stock:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stocks = data?.stocks || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Stocks
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Stock
        </Button>
      </Box>

      <DataTable
        columns={[
          { id: 'companyName', label: 'Company' },
          { id: 'symbol', label: 'Symbol' },
          { 
            id: 'exchange', 
            label: 'Exchange', 
            format: (v) => <Chip label={v} size="small" />
          },
          { id: 'quantity', label: 'Quantity', align: 'right' },
          { id: 'averagePrice', label: 'Avg Price', align: 'right', format: (v) => formatCurrency(v) },
          { 
            id: 'currentPrice', 
            label: 'Current Price', 
            align: 'right', 
            format: (v) => v ? formatCurrency(v) : '-'
          },
          { id: 'investedAmount', label: 'Invested', align: 'right', format: (v) => formatCurrency(v) },
          { 
            id: 'currentValue', 
            label: 'Current Value', 
            align: 'right', 
            format: (v) => v ? formatCurrency(v) : '-'
          },
          {
            id: 'returns',
            label: 'Returns',
            align: 'right',
            format: (_, row) =>
              row.returns !== null ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {row.returns >= 0 ? (
                    <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 18 }} />
                  ) : (
                    <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: 18 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={row.returns >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(row.returns)}
                    <br />
                    {formatPercentage(row.returnsPercentage || 0)}
                  </Typography>
                </Box>
              ) : (
                '-'
              ),
          },
          {
            id: 'goal',
            label: 'Goal',
            format: (v) => v ? <Chip label={v.name} size="small" color="primary" variant="outlined" /> : '-',
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            format: (_, row) => (
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
        ]}
        rows={stocks}
        isLoading={isLoading}
        emptyMessage="No stocks found. Add your first stock to get started!"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Stock' : 'Add Stock'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {!editingId && (
              <Autocomplete
                freeSolo
                options={searchResults?.results || []}
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : `${option.name} (${option.symbol})`
                }
                loading={isSearching}
                onInputChange={handleStockSearch}
                onChange={handleStockSelect}
                value={selectedStock}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Stock"
                    placeholder="Type to search (e.g., Tata, Reliance)"
                    required
                    helperText="Search by company name or symbol"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.symbol}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.symbol} • {option.exchange}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            )}
            {editingId && (
              <>
                <TextField
                  fullWidth
                  label="Symbol"
                  value={formData.symbol}
                  disabled
                />
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  disabled
                />
              </>
            )}
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Average Price"
              type="number"
              value={formData.averagePrice}
              onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
              required
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
