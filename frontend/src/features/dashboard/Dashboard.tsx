import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress, Container, Chip, Fade, Grow } from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  TrendingDown,
  AccountBalanceWallet,
  ShowChart,
  CreditCard,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useGetDashboardQuery, useGetAssetAllocationQuery, useGetPerformanceQuery } from './dashboardAPI';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57', '#ff6b6b'];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
  delay?: number;
}

function StatCard({ title, value, icon, gradient, subtitle, delay = 0 }: StatCardProps) {
  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={800 + delay}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${gradient})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          </Box>
          <Typography variant="h4" fontWeight="700" sx={{ mb: 1, letterSpacing: -0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Chip
              label={subtitle}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                height: 24,
              }}
            />
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function Dashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardQuery();
  const { data: allocationData, isLoading: isAllocationLoading } = useGetAssetAllocationQuery();
  const { data: performanceData, isLoading: isPerformanceLoading } = useGetPerformanceQuery();

  if (isDashboardLoading || isAllocationLoading || isPerformanceLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const returns = dashboardData?.totalReturns || 0;
  const returnsGradient = returns >= 0 
    ? '#11998e, #38ef7d' 
    : '#ee0979, #ff6a00';

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      pb: 4,
      pt: 3,
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in={true} timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              sx={{ 
                color: 'white',
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              Portfolio Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Track your investments and monitor performance in real-time
            </Typography>
          </Box>
        </Fade>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Net Worth"
              value={formatCurrency(dashboardData?.totalPortfolioValue || 0)}
              icon={<AccountBalanceWallet sx={{ fontSize: 28 }} />}
              gradient="#667eea, #764ba2"
              subtitle="Assets - Liabilities"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Invested"
              value={formatCurrency(dashboardData?.totalInvested || 0)}
              icon={<AccountBalance sx={{ fontSize: 28 }} />}
              gradient="#f093fb, #f5576c"
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Returns"
              value={formatCurrency(returns)}
              icon={returns >= 0 ? <TrendingUp sx={{ fontSize: 28 }} /> : <TrendingDown sx={{ fontSize: 28 }} />}
              gradient={returnsGradient}
              subtitle={formatPercentage(dashboardData?.totalReturnsPercentage || 0)}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Liabilities"
              value={formatCurrency(dashboardData?.totalLiabilities || 0)}
              icon={<CreditCard sx={{ fontSize: 28 }} />}
              gradient="#ee0979, #ff6a00"
              delay={300}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Assets"
              value={String(
                Object.values(dashboardData?.assetCounts || {}).reduce((a, b) => a + b, 0)
              )}
              icon={<ShowChart sx={{ fontSize: 28 }} />}
              gradient="#4facfe, #00f2fe"
              delay={400}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Asset Allocation */}
          <Grid item xs={12} md={6}>
            <Grow in={true} timeout={1000}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: 450,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700" color="text.primary">
                    Asset Allocation
                  </Typography>
                </Box>
                {allocationData && allocationData.allocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height="88%">
                    <PieChart>
                      <Pie
                        data={allocationData.allocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {allocationData.allocation.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '88%' }}>
                    <Typography color="textSecondary">No assets to display</Typography>
                  </Box>
                )}
              </Paper>
            </Grow>
          </Grid>

          {/* Performance Comparison */}
          <Grid item xs={12} md={6}>
            <Grow in={true} timeout={1000} style={{ transformOrigin: '0 0 0' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: 450,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700" color="text.primary">
                    Performance Comparison
                  </Typography>
                </Box>
                {performanceData && performanceData.performance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={performanceData.performance}>
                      <defs>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0.4}/>
                        </linearGradient>
                        <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#43e97b" stopOpacity={0.4}/>
                        </linearGradient>
                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#666', fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        tick={{ fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend 
                        verticalAlign="top"
                        height={36}
                        iconType="rect"
                      />
                      <Bar 
                        dataKey="invested" 
                        stackId="a"
                        fill="url(#colorInvested)" 
                        name="Invested" 
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar 
                        dataKey="returns" 
                        stackId="a"
                        name="Returns" 
                        radius={[8, 8, 0, 0]}
                      >
                        {performanceData.performance.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.returns >= 0 ? "url(#colorReturns)" : "url(#colorLoss)"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '88%' }}>
                    <Typography color="textSecondary">No performance data to display</Typography>
                  </Box>
                )}
              </Paper>
            </Grow>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
