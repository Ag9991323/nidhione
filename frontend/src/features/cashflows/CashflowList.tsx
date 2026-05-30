// (removed duplicate import)
import { useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Grow,
  CircularProgress,
} from '@mui/material';
import { DataTable } from '@/shared/components';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  Receipt,
  Category as CategoryIcon,
  CalendarMonth,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  useGetCashflowsQuery,
  useGetCashflowSummaryQuery,
  useGetMonthlyTrendQuery,
  useCreateCashflowMutation,
  useUpdateCashflowMutation,
  useDeleteCashflowMutation,
} from './cashflowAPI';
import { formatCurrency } from '@/utils/formatters';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57', '#ff6b6b', '#48dbfb', '#ff9ff3'];

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍔' },
  { value: 'transport', label: 'Transportation', icon: '🚗' },
  { value: 'utilities', label: 'Utilities & Bills', icon: '💡' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'bills', label: 'Bills & EMI', icon: '📄' },
  { value: 'rent', label: 'House Rent', icon: '🏠' },
  { value: 'parents', label: 'To Parents', icon: '👨‍👩‍👦' },
  { value: 'investment', label: 'Investments', icon: '💰' },
  { value: 'salary', label: 'Salary', icon: '💵' },
  { value: 'other', label: 'Other', icon: '📦' },
];

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CashflowList() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [tabValue, setTabValue] = useState(0);

  const { data: cashflowsData, isLoading } = useGetCashflowsQuery({ month: selectedMonth, year: selectedYear });
  const { data: summaryData } = useGetCashflowSummaryQuery({ month: selectedMonth, year: selectedYear });
  const { data: trendData } = useGetMonthlyTrendQuery({ year: selectedYear });
  const [createCashflow] = useCreateCashflowMutation();
  const [updateCashflow] = useUpdateCashflowMutation();
  const [deleteCashflow] = useDeleteCashflowMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    type: 'spend' as 'income' | 'spend' | 'investment',
    description: '',
    date: new Date().toISOString().split('T')[0],
    // ...existing code...
  });

  const handleOpen = () => {
    setOpen(true);
    setFormData({
      amount: '',
      category: 'food',
      type: 'spend',
      description: '',
      date: new Date().toISOString().split('T')[0],
      // ...existing code...
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleEdit = (cashflow: any) => {
    setEditingId(cashflow.id);
    setFormData({
      amount: String(cashflow.amount),
      category: cashflow.category,
      type: cashflow.type,
      description: cashflow.description || '',
      date: cashflow.date.split('T')[0],
      // ...existing code...
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateCashflow({
          id: editingId,
          data: {
            amount: Number(formData.amount),
            category: formData.category,
            type: formData.type,
            description: formData.description || null,
            date: formData.date,
            // ...existing code...
          },
        }).unwrap();
      } else {
        await createCashflow({
          amount: Number(formData.amount),
          category: formData.category,
          type: formData.type,
          description: formData.description,
          date: formData.date,
          // ...existing code...
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Error saving cashflow:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteCashflow(id).unwrap();
      } catch (error) {
        console.error('Error deleting cashflow:', error);
      }
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c: any) => c.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find((c: any) => c.value === category)?.icon || '📦';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const cashflows = cashflowsData?.cashflows || [];
  const pieData = summaryData?.categoryBreakdown.map((item: any, index: number) => ({
    name: getCategoryLabel(item.category),
    value: item.amount,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Cashflow Tracker
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: selectedYear === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <MenuItem key={currentDate.getFullYear() - i} value={currentDate.getFullYear() - i}>
                  {currentDate.getFullYear() - i}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Add Transaction
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={600}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'uppercase', fontWeight: 500 }}>
                    Total Income
                  </Typography>
                  <TrendingUp />
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ mt: 2 }}>
                  {formatCurrency(summaryData?.totalIncome || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={700}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #ee0979, #ff6a00)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'uppercase', fontWeight: 500 }}>
                    Total Spend
                  </Typography>
                  <TrendingDown />
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ mt: 2 }}>
                  {formatCurrency(summaryData?.totalSpend || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={750}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'uppercase', fontWeight: 500 }}>
                    Total Investment
                  </Typography>
                  <TrendingUp />
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ mt: 2 }}>
                  {formatCurrency(summaryData?.totalInvestment || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={850}>
            <Card
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${(summaryData?.balance || 0) >= 0 ? '#667eea, #764ba2' : '#ff6a00, #ee0979'})`,
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'uppercase', fontWeight: 500 }}>
                    Balance
                  </Typography>
                  <AccountBalanceWallet />
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ mt: 2 }}>
                  {formatCurrency(summaryData?.balance || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={950}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'uppercase', fontWeight: 500 }}>
                    Transactions
                  </Typography>
                  <Receipt />
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ mt: 2 }}>
                  {summaryData?.transactionCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<Receipt />} label="Transactions" iconPosition="start" />
          <Tab icon={<CategoryIcon />} label="Category Breakdown" iconPosition="start" />
          <Tab icon={<CalendarMonth />} label="Monthly Trend" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <DataTable
          columns={[
            { id: 'date', label: 'Date', format: (v) => new Date(v).toLocaleDateString() },
            {
              id: 'category',
              label: 'Category',
              format: (v) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{getCategoryIcon(v)}</span>
                  <Typography variant="body2">{getCategoryLabel(v)}</Typography>
                </Box>
              ),
            },
            { id: 'description', label: 'Description', format: (v) => v || '-' },
            {
              id: 'type',
              label: 'Type',
              format: (v) => (
                <Chip
                  label={v}
                  size="small"
                  color={v === 'income' ? 'success' : 'error'}
                />
              ),
            },
            {
              id: 'amount',
              label: 'Amount',
              align: 'right',
              format: (v, row) => (
                <Typography
                  fontWeight="600"
                  color={row.type === 'income' ? 'success.main' : 'error.main'}
                >
                  {row.type === 'income' ? '+' : '-'}{formatCurrency(v)}
                </Typography>
              ),
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
          rows={cashflows}
          isLoading={isLoading}
          emptyMessage="No transactions found for this month. Add your first transaction!"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Spend Distribution
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 8 }}>
                  No spend data available
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Top Spending Categories
              </Typography>
              <Box sx={{ mt: 2 }}>
                {summaryData?.categoryBreakdown.map((item, index) => (
                  <Box key={item.category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="500">
                        {getCategoryIcon(item.category)} {getCategoryLabel(item.category)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          bgcolor: COLORS[index % COLORS.length],
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {selectedYear} Monthly Trend
          </Typography>
          {trendData && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={trendData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#11998e" name="Income" />
                <Bar dataKey="spend" fill="#ee0979" name="Spend" />
                <Bar dataKey="investment" fill="#f093fb" name="Investment" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </TabPanel>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'spend' | 'investment' })}
              required
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="spend">Spend</MenuItem>
              <MenuItem value="investment">Investment</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              inputProps={{ step: '0.01' }}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: new Date().toISOString().split('T')[0]
              }}
            />
            {/* ...existing code... */}
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
