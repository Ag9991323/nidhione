import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatCurrency } from '@/utils/formatters';
import {
  useGetAllGoldQuery,
  useGetCurrentGoldPricesQuery,
  useCreateGoldMutation,
  useUpdateGoldMutation,
  useDeleteGoldMutation,
  GoldAsset,
  CreateGoldRequest,
} from './goldAPI';
import { useGetGoalsQuery } from '../goals/goalsAPI';

const purityOptions = ['24K', '22K', '18K', '14K'] as const;
const goldTypeLabels = {
  physical: 'Physical Gold',
  digital: 'Digital Gold',
  etf: 'Gold ETF',
};

const goldTypeIcons = {
  physical: '💍',
  digital: '📱',
  etf: '📊',
};

export default function GoldList() {
  const { data: goldData, isLoading } = useGetAllGoldQuery();
  const { data: goldPrices } = useGetCurrentGoldPricesQuery();
  const { data: goalsData } = useGetGoalsQuery();
  const [createGold] = useCreateGoldMutation();
  const [updateGold] = useUpdateGoldMutation();
  const [deleteGold] = useDeleteGoldMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingGold, setEditingGold] = useState<GoldAsset | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const [formData, setFormData] = useState<CreateGoldRequest>({
    type: 'physical',
    name: '',
    investedAmount: 0,
  });

  const handleOpenDialog = (gold?: GoldAsset) => {
    if (gold) {
      setEditingGold(gold);
      setFormData({
        type: gold.type,
        name: gold.name,
        quantityGrams: gold.quantityGrams,
        purity: gold.purity,
        averagePricePerGram: gold.averagePricePerGram,
        makingCharges: gold.makingCharges,
        storageLocation: gold.storageLocation,
        schemeName: gold.schemeName,
        schemeCode: gold.schemeCode,
        units: gold.units,
        averageNav: gold.averageNav,
        investedAmount: gold.investedAmount,
        goalId: gold.goalId,
      });
    } else {
      setEditingGold(null);
      setFormData({
        type: 'physical',
        name: '',
        investedAmount: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGold(null);
    setFormData({
      type: 'physical',
      name: '',
      investedAmount: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingGold) {
        await updateGold({
          id: editingGold.id,
          data: {
            name: formData.name,
            quantityGrams: formData.quantityGrams,
            purity: formData.purity,
            averagePricePerGram: formData.averagePricePerGram,
            makingCharges: formData.makingCharges,
            storageLocation: formData.storageLocation,
            units: formData.units,
            averageNav: formData.averageNav,
            investedAmount: formData.investedAmount,
            goalId: formData.goalId || null,
          },
        }).unwrap();
      } else {
        await createGold(formData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving gold:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this gold asset?')) {
      try {
        await deleteGold(id).unwrap();
      } catch (error) {
        console.error('Error deleting gold:', error);
      }
    }
  };

  const goldAssets = goldData?.goldAssets || [];
  const physicalGold = goldAssets.filter((g) => g.type === 'physical');
  const digitalGold = goldAssets.filter((g) => g.type === 'digital');
  const goldETFs = goldAssets.filter((g) => g.type === 'etf');

  const totalInvested = goldAssets.reduce((sum, g) => sum + g.investedAmount, 0);
  const totalCurrent = goldAssets.reduce((sum, g) => sum + g.currentValue, 0);
  const totalReturns = totalCurrent - totalInvested;
  const totalReturnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  const renderGoldCard = (gold: GoldAsset) => (
    <Card
      key={gold.id}
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h3" sx={{ fontSize: '1.5rem' }}>
                {goldTypeIcons[gold.type]}
              </Typography>
              <Typography variant="h6">{gold.name || goldTypeLabels[gold.type]}</Typography>
            </Box>
            <Chip
              label={goldTypeLabels[gold.type]}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#000',
                fontWeight: 600,
              }}
            />
          </Box>
          <Box>
            <IconButton size="small" onClick={() => handleOpenDialog(gold)} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(gold.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {gold.type === 'physical' || gold.type === 'digital' ? (
            <>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {gold.quantityGrams?.toFixed(2)} grams
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Purity
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {gold.purity}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Avg Price/Gram
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(gold.averagePricePerGram || 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Current Price/Gram
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(gold.currentPricePerGram || 0)}
                </Typography>
              </Grid>
              {gold.type === 'physical' && gold.makingCharges && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Making Charges
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(gold.makingCharges)}
                  </Typography>
                </Grid>
              )}
              {gold.storageLocation && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Storage
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {gold.storageLocation}
                  </Typography>
                </Grid>
              )}
            </>
          ) : (
            <>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Scheme
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {gold.schemeName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Units
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {gold.units?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Avg NAV
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(gold.averageNav || 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Current NAV
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(gold.currentNav || 0)}
                </Typography>
              </Grid>
            </>
          )}

          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Invested
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(gold.investedAmount)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Current Value
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(gold.currentValue)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Returns
            </Typography>
            <Typography variant="body2" fontWeight={600} color={gold.returns >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(gold.returns)} ({gold.returnsPercentage.toFixed(2)}%)
            </Typography>
          </Grid>
          {gold.goal && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Goal
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {gold.goal.name}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            💰 Gold Assets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your physical gold, digital gold, and Gold ETF investments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
            },
          }}
        >
          Add Gold
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total Invested
              </Typography>
              <Typography variant="h6">{formatCurrency(totalInvested)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Current Value
              </Typography>
              <Typography variant="h6">{formatCurrency(totalCurrent)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total Returns
              </Typography>
              <Typography variant="h6" color={totalReturns >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(totalReturns)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Returns %
              </Typography>
              <Typography variant="h6" color={totalReturnsPercentage >= 0 ? 'success.main' : 'error.main'}>
                {totalReturnsPercentage.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Live Gold Prices */}
      {goldPrices && (
        <Alert severity="info" icon="💎" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Live Gold Prices (per gram):
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {Object.entries(goldPrices)
              .filter(([key]) => key !== 'lastUpdated')
              .map(([purity, price]) => (
                <Typography key={purity} variant="body2">
                  <strong>{purity}:</strong> {formatCurrency(price as number)}
                </Typography>
              ))}
          </Box>
        </Alert>
      )}

      {/* Tabs for different gold types */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`💍 Physical Gold (${physicalGold.length})`} />
        <Tab label={`📱 Digital Gold (${digitalGold.length})`} />
        <Tab label={`📊 Gold ETFs (${goldETFs.length})`} />
      </Tabs>

      {/* Gold Cards */}
      <Grid container spacing={2}>
        {selectedTab === 0 &&
          (physicalGold.length > 0 ? (
            physicalGold.map((gold) => (
              <Grid item xs={12} md={6} lg={4} key={gold.id}>
                {renderGoldCard(gold)}
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No physical gold assets found. Add your first physical gold investment!</Alert>
            </Grid>
          ))}

        {selectedTab === 1 &&
          (digitalGold.length > 0 ? (
            digitalGold.map((gold) => (
              <Grid item xs={12} md={6} lg={4} key={gold.id}>
                {renderGoldCard(gold)}
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No digital gold assets found. Add your digital gold holdings!</Alert>
            </Grid>
          ))}

        {selectedTab === 2 &&
          (goldETFs.length > 0 ? (
            goldETFs.map((gold) => (
              <Grid item xs={12} md={6} lg={4} key={gold.id}>
                {renderGoldCard(gold)}
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">No Gold ETFs found. Add your Gold ETF investments!</Alert>
            </Grid>
          ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingGold ? 'Edit Gold Asset' : 'Add Gold Asset'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Gold Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                disabled={!!editingGold}
              >
                <MenuItem value="physical">💍 Physical Gold</MenuItem>
                <MenuItem value="digital">📱 Digital Gold</MenuItem>
                <MenuItem value="etf">📊 Gold ETF</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name (optional)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`e.g., ${
                  formData.type === 'physical'
                    ? 'Gold Necklace'
                    : formData.type === 'digital'
                    ? 'Paytm Gold'
                    : 'Gold BeES'
                }`}
              />
            </Grid>

            {(formData.type === 'physical' || formData.type === 'digital') && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity (grams)"
                    value={formData.quantityGrams || ''}
                    onChange={(e) => setFormData({ ...formData, quantityGrams: parseFloat(e.target.value) })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Purity"
                    value={formData.purity || ''}
                    onChange={(e) => setFormData({ ...formData, purity: e.target.value as any })}
                  >
                    {purityOptions.map((purity) => (
                      <MenuItem key={purity} value={purity}>
                        {purity}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Average Price per Gram"
                    value={formData.averagePricePerGram || ''}
                    onChange={(e) => setFormData({ ...formData, averagePricePerGram: parseFloat(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>

                {formData.type === 'physical' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Making Charges"
                      value={formData.makingCharges || ''}
                      onChange={(e) => setFormData({ ...formData, makingCharges: parseFloat(e.target.value) })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Storage Location (optional)"
                    value={formData.storageLocation || ''}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    placeholder={formData.type === 'physical' ? 'e.g., Home Locker' : 'e.g., Paytm'}
                  />
                </Grid>
              </>
            )}

            {formData.type === 'etf' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Scheme Name"
                    value={formData.schemeName || ''}
                    onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                    placeholder="e.g., Nippon India ETF Gold BeES"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Scheme Code / Symbol"
                    value={formData.schemeCode || ''}
                    onChange={(e) => setFormData({ ...formData, schemeCode: e.target.value })}
                    placeholder="e.g., GOLDBEES.NS"
                    helperText="Enter Yahoo Finance symbol for auto NAV updates"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Units"
                    value={formData.units || ''}
                    onChange={(e) => setFormData({ ...formData, units: parseFloat(e.target.value) })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Average NAV"
                    value={formData.averageNav || ''}
                    onChange={(e) => setFormData({ ...formData, averageNav: parseFloat(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Invested Amount"
                value={formData.investedAmount || ''}
                onChange={(e) => setFormData({ ...formData, investedAmount: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Link to Goal (optional)"
                value={formData.goalId || ''}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {goalsData?.goals.map((goal: any) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
              },
            }}
          >
            {editingGold ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
