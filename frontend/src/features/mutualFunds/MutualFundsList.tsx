import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, TrendingDown, Repeat } from '@mui/icons-material';
import {
  useGetMutualFundsQuery,
  useCreateMutualFundMutation,
  useUpdateMutualFundMutation,
  useDeleteMutualFundMutation,
  useLazySearchMutualFundQuery,
  SearchMFResult,
} from './mutualFundsAPI';
import {
  useGetSIPsQuery,
  useCreateSIPMutation,
  useUpdateSIPMutation,
  useDeleteSIPMutation,
} from './sipAPI';
import { useGetGoalsQuery } from '@/features/goals/goalsAPI';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { debounce } from 'lodash';

export default function MutualFundsList() {
  const { data, isLoading } = useGetMutualFundsQuery();
  const { data: goalsData } = useGetGoalsQuery();
  const { data: sipsData } = useGetSIPsQuery();
  const [createMutualFund] = useCreateMutualFundMutation();
  const [updateMutualFund] = useUpdateMutualFundMutation();
  const [deleteMutualFund] = useDeleteMutualFundMutation();
  const [searchMF, { data: searchResults, isLoading: isSearching }] =
    useLazySearchMutualFundQuery();
  const [createSIP] = useCreateSIPMutation();
  const [updateSIP] = useUpdateSIPMutation();
  const [deleteSIP] = useDeleteSIPMutation();

  const [open, setOpen] = useState(false);
  const [sipDialogOpen, setSipDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSipId, setEditingSipId] = useState<string | null>(null);
  const [selectedMFForSIP, setSelectedMFForSIP] = useState<string | null>(null);
  const [selectedMF, setSelectedMF] = useState<SearchMFResult | null>(null);
  const [formData, setFormData] = useState({
    schemeCode: '',
    schemeName: '',
    units: '',
    averageNav: '',
    goalId: '',
  });
  const [sipFormData, setSipFormData] = useState({
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    frequency: 'monthly' as 'monthly' | 'quarterly',
    status: 'active' as 'active' | 'paused' | 'stopped',
    goalId: '',
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query && query.length >= 3) {
        searchMF(query);
      }
    }, 300),
    [searchMF],
  );

  const handleMFSearch = (_event: React.SyntheticEvent, value: string) => {
    debouncedSearch(value);
  };

  const handleMFSelect = (_event: React.SyntheticEvent, value: string | SearchMFResult | null) => {
    if (value && typeof value !== 'string') {
      setSelectedMF(value);
      setFormData({
        ...formData,
        schemeCode: value.schemeCode,
        schemeName: value.schemeName,
      });
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setSelectedMF(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setSelectedMF(null);
    setFormData({
      schemeCode: '',
      schemeName: '',
      units: '',
      averageNav: '',
      goalId: '',
    });
  };

  const handleEdit = (mf: any) => {
    setEditingId(mf.id);
    setFormData({
      schemeCode: mf.schemeCode,
      schemeName: mf.schemeName,
      units: String(mf.units),
      averageNav: String(mf.averageNav),
      goalId: mf.goalId || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateMutualFund({
          id: editingId,
          data: {
            units: Number(formData.units),
            averageNav: Number(formData.averageNav),
            goalId: formData.goalId || null,
          },
        }).unwrap();
      } else {
        if (!formData.schemeCode || !formData.schemeName) {
          alert('Please select a mutual fund from the search results');
          return;
        }
        await createMutualFund({
          schemeCode: formData.schemeCode,
          schemeName: formData.schemeName,
          units: Number(formData.units),
          averageNav: Number(formData.averageNav),
          goalId: formData.goalId || undefined,
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Error saving mutual fund:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this mutual fund?')) {
      try {
        await deleteMutualFund(id).unwrap();
      } catch (error) {
        console.error('Error deleting mutual fund:', error);
      }
    }
  };

  // SIP handlers
  const handleOpenSipDialog = (mfId: string) => {
    setSelectedMFForSIP(mfId);
    setSipDialogOpen(true);
    setSipFormData({
      amount: '',
      startDate: new Date().toISOString().split('T')[0],
      frequency: 'monthly',
      status: 'active',
      goalId: '',
    });
  };

  const handleCloseSipDialog = () => {
    setSipDialogOpen(false);
    setEditingSipId(null);
    setSelectedMFForSIP(null);
    setSipFormData({
      amount: '',
      startDate: new Date().toISOString().split('T')[0],
      frequency: 'monthly',
      status: 'active',
      goalId: '',
    });
  };

  const handleEditSip = (sip: any) => {
    setEditingSipId(sip.id);
    setSelectedMFForSIP(sip.mfId);
    setSipFormData({
      amount: String(sip.amount),
      startDate: sip.startDate.split('T')[0],
      frequency: sip.frequency,
      status: sip.status,
      goalId: sip.goalId || '',
    });
    setSipDialogOpen(true);
  };

  const handleSubmitSip = async () => {
    try {
      if (editingSipId) {
        await updateSIP({
          id: editingSipId,
          data: {
            amount: Number(sipFormData.amount),
            frequency: sipFormData.frequency,
            status: sipFormData.status,
            goalId: sipFormData.goalId || null,
          },
        }).unwrap();
      } else {
        if (!selectedMFForSIP) {
          alert('Please select a mutual fund');
          return;
        }
        await createSIP({
          mfId: selectedMFForSIP,
          amount: Number(sipFormData.amount),
          startDate: sipFormData.startDate,
          frequency: sipFormData.frequency,
          goalId: sipFormData.goalId || undefined,
        }).unwrap();
      }
      handleCloseSipDialog();
    } catch (error) {
      console.error('Error saving SIP:', error);
    }
  };

  const handleDeleteSip = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this SIP?')) {
      try {
        await deleteSIP(id).unwrap();
      } catch (error) {
        console.error('Error deleting SIP:', error);
      }
    }
  };

  const getMFSIPs = (mfId: string) => {
    return sipsData?.sips.filter(sip => sip.mfId === mfId) || [];
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const mutualFunds = data?.mutualFunds || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Mutual Funds
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Mutual Fund
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Scheme Name</TableCell>
              <TableCell>Scheme Code</TableCell>
              <TableCell align="right">Units</TableCell>
              <TableCell align="right">Avg NAV</TableCell>
              <TableCell align="right">Current NAV</TableCell>
              <TableCell align="right">Invested</TableCell>
              <TableCell align="right">Current Value</TableCell>
              <TableCell align="right">Returns</TableCell>
              <TableCell>Goal</TableCell>
              <TableCell align="right">Actions</TableCell>
              <TableCell>SIPs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mutualFunds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    No mutual funds found. Add your first mutual fund to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              mutualFunds.map(mf => (
                <TableRow key={mf.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {mf.schemeName}
                    </Typography>
                  </TableCell>
                  <TableCell>{mf.schemeCode}</TableCell>
                  <TableCell align="right">{mf.units.toFixed(3)}</TableCell>
                  <TableCell align="right">{formatCurrency(mf.averageNav)}</TableCell>
                  <TableCell align="right">
                    {mf.currentNav ? formatCurrency(mf.currentNav) : '-'}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(mf.investedAmount)}</TableCell>
                  <TableCell align="right">
                    {mf.currentValue ? formatCurrency(mf.currentValue) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {mf.returns !== null ? (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        {mf.returns >= 0 ? (
                          <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 18 }} />
                        ) : (
                          <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: 18 }} />
                        )}
                        <Typography
                          variant="body2"
                          color={mf.returns >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(mf.returns)}
                          <br />
                          {formatPercentage(mf.returnsPercentage || 0)}
                        </Typography>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {mf.goal ? (
                      <Chip label={mf.goal.name} size="small" color="primary" variant="outlined" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(mf)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(mf.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Repeat />}
                        onClick={() => handleOpenSipDialog(mf.id)}
                      >
                        Add SIP
                      </Button>
                      {getMFSIPs(mf.id).length > 0 && (
                        <Chip
                          label={`${getMFSIPs(mf.id).length} Active`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                    {getMFSIPs(mf.id).map(sip => (
                      <Box
                        key={sip.id}
                        sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="caption" display="block">
                              {formatCurrency(sip.amount)} / {sip.frequency}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Next: {new Date(sip.nextExecutionDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Chip
                              label={sip.status}
                              size="small"
                              color={
                                sip.status === 'active'
                                  ? 'success'
                                  : sip.status === 'paused'
                                    ? 'warning'
                                    : 'default'
                              }
                              sx={{ mr: 1 }}
                            />
                            <IconButton size="small" onClick={() => handleEditSip(sip)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteSip(sip.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Mutual Fund' : 'Add Mutual Fund'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {!editingId && (
              <Autocomplete
                freeSolo
                options={searchResults?.results || []}
                getOptionLabel={option => (typeof option === 'string' ? option : option.schemeName)}
                loading={isSearching}
                onInputChange={handleMFSearch}
                onChange={handleMFSelect}
                value={selectedMF}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Search Mutual Fund"
                    placeholder="Type to search (e.g., HDFC, SBI, ICICI)"
                    required
                    helperText="Search by fund name (minimum 3 characters)"
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
                  <li {...props} key={option.schemeCode}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.schemeName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Code: {option.schemeCode} • NAV: ₹{option.nav}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            )}
            {editingId && (
              <>
                <TextField fullWidth label="Scheme Name" value={formData.schemeName} disabled />
                <TextField fullWidth label="Scheme Code" value={formData.schemeCode} disabled />
              </>
            )}
            <TextField
              fullWidth
              label="Units"
              type="number"
              value={formData.units}
              onChange={e => setFormData({ ...formData, units: e.target.value })}
              required
              inputProps={{ step: '0.001' }}
            />
            <TextField
              fullWidth
              label="Average NAV"
              type="number"
              value={formData.averageNav}
              onChange={e => setFormData({ ...formData, averageNav: e.target.value })}
              required
              inputProps={{ step: '0.01' }}
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SIP Dialog */}
      <Dialog open={sipDialogOpen} onClose={handleCloseSipDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSipId ? 'Edit SIP' : 'Create SIP'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {selectedMFForSIP && !editingSipId && (
              <TextField
                fullWidth
                label="Mutual Fund"
                value={mutualFunds.find(mf => mf.id === selectedMFForSIP)?.schemeName || ''}
                disabled
              />
            )}
            <TextField
              fullWidth
              label="SIP Amount"
              type="number"
              value={sipFormData.amount}
              onChange={e => setSipFormData({ ...sipFormData, amount: e.target.value })}
              required
              inputProps={{ step: '100' }}
            />
            {!editingSipId && (
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={sipFormData.startDate}
                onChange={e => setSipFormData({ ...sipFormData, startDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            )}
            <TextField
              select
              fullWidth
              label="Frequency"
              value={sipFormData.frequency}
              onChange={e =>
                setSipFormData({
                  ...sipFormData,
                  frequency: e.target.value as 'monthly' | 'quarterly',
                })
              }
              required
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
            </TextField>
            {editingSipId && (
              <TextField
                select
                fullWidth
                label="Status"
                value={sipFormData.status}
                onChange={e =>
                  setSipFormData({
                    ...sipFormData,
                    status: e.target.value as 'active' | 'paused' | 'stopped',
                  })
                }
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="stopped">Stopped</MenuItem>
              </TextField>
            )}
            <TextField
              select
              fullWidth
              label="Link to Goal (Optional)"
              value={sipFormData.goalId}
              onChange={e => setSipFormData({ ...sipFormData, goalId: e.target.value })}
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
          <Button onClick={handleCloseSipDialog}>Cancel</Button>
          <Button onClick={handleSubmitSip} variant="contained">
            {editingSipId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
