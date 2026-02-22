import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Paper,
  Fade,
  Grow,
  InputAdornment,
} from '@mui/material';
import {
  Calculate,
  TrendingUp,
  AccountBalance,
  Home,
  CreditCard,
  Savings,
} from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Calculators() {
  const [activeTab, setActiveTab] = useState(0);

  // SIP Calculator States
  const [sipMonthly, setSipMonthly] = useState('10000');
  const [sipRate, setSipRate] = useState('12');
  const [sipYears, setSipYears] = useState('10');
  const [sipInflation, setSipInflation] = useState('6');
  const [sipResult, setSipResult] = useState<any>(null);

  // SIP + Lumpsum Calculator States
  const [lumpsum, setLumpsum] = useState('100000');
  const [sipLumpMonthly, setSipLumpMonthly] = useState('10000');
  const [sipLumpRate, setSipLumpRate] = useState('12');
  const [sipLumpYears, setSipLumpYears] = useState('10');
  const [sipLumpInflation, setSipLumpInflation] = useState('6');
  const [sipLumpsumResult, setSipLumpsumResult] = useState<any>(null);

  // EMI Calculator States
  const [loanAmount, setLoanAmount] = useState('1000000');
  const [emiRate, setEmiRate] = useState('8.5');
  const [emiYears, setEmiYears] = useState('20');
  const [emiResult, setEmiResult] = useState<any>(null);

  // Lumpsum Calculator States
  const [lumpsumAmount, setLumpsumAmount] = useState('100000');
  const [lumpsumRate, setLumpsumRate] = useState('12');
  const [lumpsumYears, setLumpsumYears] = useState('10');
  const [lumpsumInflation, setLumpsumInflation] = useState('6');
  const [lumpsumResult, setLumpsumResult] = useState<any>(null);

  // PPF Calculator States
  const [ppfYearly, setPpfYearly] = useState('150000');
  const [ppfYears, setPpfYears] = useState('15');
  const [ppfInflation, setPpfInflation] = useState('6');
  const [ppfResult, setPpfResult] = useState<any>(null);

  // FD Calculator States
  const [fdAmount, setFdAmount] = useState('100000');
  const [fdRate, setFdRate] = useState('6.5');
  const [fdYears, setFdYears] = useState('5');
  const [fdInflation, setFdInflation] = useState('6');
  const [fdResult, setFdResult] = useState<any>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const calculateSIP = () => {
    const P = parseFloat(sipMonthly);
    const r = parseFloat(sipRate) / 12 / 100;
    const n = parseFloat(sipYears) * 12;
    const inflationRate = parseFloat(sipInflation) / 100;
    const years = parseFloat(sipYears);

    const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const invested = P * n;
    const returns = futureValue - invested;
    
    // Calculate inflation-adjusted value
    const realValue = futureValue / Math.pow(1 + inflationRate, years);
    const realReturns = realValue - invested;

    setSipResult({
      futureValue: futureValue,
      invested: invested,
      returns: returns,
      realValue: realValue,
      realReturns: realReturns,
    });
  };

  const calculateSIPLumpsum = () => {
    const L = parseFloat(lumpsum);
    const P = parseFloat(sipLumpMonthly);
    const r = parseFloat(sipLumpRate) / 12 / 100;
    const annualRate = parseFloat(sipLumpRate) / 100;
    const n = parseFloat(sipLumpYears) * 12;
    const years = parseFloat(sipLumpYears);
    const inflationRate = parseFloat(sipLumpInflation) / 100;

    const lumpsumFV = L * Math.pow(1 + annualRate, years);
    const sipFV = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalFV = lumpsumFV + sipFV;
    const totalInvested = L + P * n;
    const returns = totalFV - totalInvested;
    
    // Calculate inflation-adjusted value
    const realValue = totalFV / Math.pow(1 + inflationRate, years);
    const realReturns = realValue - totalInvested;

    setSipLumpsumResult({
      futureValue: totalFV,
      invested: totalInvested,
      returns: returns,
      lumpsumFV: lumpsumFV,
      sipFV: sipFV,
      realValue: realValue,
      realReturns: realReturns,
    });
  };

  const calculateEMI = () => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(emiRate) / 12 / 100;
    const n = parseFloat(emiYears) * 12;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    setEmiResult({
      emi: emi,
      totalPayment: totalPayment,
      totalInterest: totalInterest,
      principal: P,
    });
  };

  const calculateLumpsum = () => {
    const P = parseFloat(lumpsumAmount);
    const r = parseFloat(lumpsumRate) / 100;
    const n = parseFloat(lumpsumYears);
    const inflationRate = parseFloat(lumpsumInflation) / 100;

    const futureValue = P * Math.pow(1 + r, n);
    const returns = futureValue - P;
    
    // Calculate inflation-adjusted value
    const realValue = futureValue / Math.pow(1 + inflationRate, n);
    const realReturns = realValue - P;

    setLumpsumResult({
      futureValue: futureValue,
      invested: P,
      returns: returns,
      realValue: realValue,
      realReturns: realReturns,
    });
  };

  const calculatePPF = () => {
    const P = parseFloat(ppfYearly);
    const r = 7.1 / 100; // Current PPF rate
    const n = parseFloat(ppfYears);
    const inflationRate = parseFloat(ppfInflation) / 100;

    let futureValue = 0;
    for (let i = 1; i <= n; i++) {
      futureValue = (futureValue + P) * (1 + r);
    }

    const invested = P * n;
    const returns = futureValue - invested;
    
    // Calculate inflation-adjusted value
    const realValue = futureValue / Math.pow(1 + inflationRate, n);
    const realReturns = realValue - invested;

    setPpfResult({
      futureValue: futureValue,
      invested: invested,
      returns: returns,
      realValue: realValue,
      realReturns: realReturns,
    });
  };

  const calculateFD = () => {
    const P = parseFloat(fdAmount);
    const r = parseFloat(fdRate) / 100;
    const n = parseFloat(fdYears);
    const inflationRate = parseFloat(fdInflation) / 100;

    // Quarterly compounding
    const futureValue = P * Math.pow(1 + r / 4, 4 * n);
    const returns = futureValue - P;
    
    // Calculate inflation-adjusted value
    const realValue = futureValue / Math.pow(1 + inflationRate, n);
    const realReturns = realValue - P;

    setFdResult({
      futureValue: futureValue,
      invested: P,
      returns: returns,
      realValue: realValue,
      realReturns: realReturns,
    });
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        pb: 4,
        pt: 3,
      }}
    >
      <Container maxWidth="xl">
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
              Financial Calculators
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Plan your investments and loans with precision
            </Typography>
          </Box>
        </Fade>

        <Grow in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                },
              }}
            >
              <Tab icon={<TrendingUp />} iconPosition="start" label="SIP Calculator" />
              <Tab icon={<Savings />} iconPosition="start" label="SIP + Lumpsum" />
              <Tab icon={<CreditCard />} iconPosition="start" label="EMI Calculator" />
              <Tab icon={<Calculate />} iconPosition="start" label="Lumpsum" />
              <Tab icon={<AccountBalance />} iconPosition="start" label="PPF Calculator" />
              <Tab icon={<Home />} iconPosition="start" label="FD Calculator" />
            </Tabs>

            {/* SIP Calculator */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Calculate Your SIP Returns
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Monthly Investment"
                        type="number"
                        value={sipMonthly}
                        onChange={(e) => setSipMonthly(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Annual Return"
                        type="number"
                        value={sipRate}
                        onChange={(e) => setSipRate(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Investment Period"
                        type="number"
                        value={sipYears}
                        onChange={(e) => setSipYears(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Inflation Rate"
                        type="number"
                        value={sipInflation}
                        onChange={(e) => setSipInflation(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText="To calculate inflation-adjusted returns"
                        sx={{ mb: 3 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={calculateSIP}
                        startIcon={<Calculate />}
                        sx={{ py: 1.5 }}
                      >
                        Calculate
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {sipResult && (
                      <Box
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          Results
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Total Investment
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(sipResult.invested)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Estimated Returns
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(sipResult.returns)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              mt: 3,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Future Value
                            </Typography>
                            <Typography variant="h4" fontWeight="700">
                              {formatCurrency(sipResult.futureValue)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: 2,
                              mt: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Inflation-Adjusted Value
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(sipResult.realValue)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Real Returns: {formatCurrency(sipResult.realReturns)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* SIP + Lumpsum Calculator */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      SIP + Lumpsum Calculator
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Lumpsum Amount"
                        type="number"
                        value={lumpsum}
                        onChange={(e) => setLumpsum(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Monthly SIP"
                        type="number"
                        value={sipLumpMonthly}
                        onChange={(e) => setSipLumpMonthly(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Annual Return"
                        type="number"
                        value={sipLumpRate}
                        onChange={(e) => setSipLumpRate(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Investment Period"
                        type="number"
                        value={sipLumpYears}
                        onChange={(e) => setSipLumpYears(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Inflation Rate"
                        type="number"
                        value={sipLumpInflation}
                        onChange={(e) => setSipLumpInflation(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText="To calculate inflation-adjusted returns"
                        sx={{ mb: 3 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={calculateSIPLumpsum}
                        startIcon={<Calculate />}
                        sx={{ py: 1.5 }}
                      >
                        Calculate
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {sipLumpsumResult && (
                      <Box
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          Results
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Total Investment
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(sipLumpsumResult.invested)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Estimated Returns
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(sipLumpsumResult.returns)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              mt: 3,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Total Future Value
                            </Typography>
                            <Typography variant="h4" fontWeight="700">
                              {formatCurrency(sipLumpsumResult.futureValue)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: 2,
                              mt: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Inflation-Adjusted Value
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(sipLumpsumResult.realValue)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Real Returns: {formatCurrency(sipLumpsumResult.realReturns)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* EMI Calculator */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Calculate Your EMI
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Loan Amount"
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Interest Rate"
                        type="number"
                        value={emiRate}
                        onChange={(e) => setEmiRate(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Loan Tenure"
                        type="number"
                        value={emiYears}
                        onChange={(e) => setEmiYears(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={calculateEMI}
                        startIcon={<Calculate />}
                        sx={{ py: 1.5 }}
                      >
                        Calculate
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {emiResult && (
                      <Box
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          Results
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              mb: 3,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Monthly EMI
                            </Typography>
                            <Typography variant="h4" fontWeight="700">
                              {formatCurrency(emiResult.emi)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Principal Amount
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(emiResult.principal)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Total Interest
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(emiResult.totalInterest)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Total Payment
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(emiResult.totalPayment)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* Lumpsum Calculator */}
            <TabPanel value={activeTab} index={3}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Lumpsum Investment Calculator
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Investment Amount"
                        type="number"
                        value={lumpsumAmount}
                        onChange={(e) => setLumpsumAmount(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Annual Return"
                        type="number"
                        value={lumpsumRate}
                        onChange={(e) => setLumpsumRate(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Investment Period"
                        type="number"
                        value={lumpsumYears}
                        onChange={(e) => setLumpsumYears(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Inflation Rate"
                        type="number"
                        value={lumpsumInflation}
                        onChange={(e) => setLumpsumInflation(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText="To calculate inflation-adjusted returns"
                        sx={{ mb: 3 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={calculateLumpsum}
                        startIcon={<Calculate />}
                        sx={{ py: 1.5 }}
                      >
                        Calculate
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {lumpsumResult && (
                      <Box
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          Results
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Investment Amount
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(lumpsumResult.invested)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Estimated Returns
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(lumpsumResult.returns)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              mt: 3,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Future Value
                            </Typography>
                            <Typography variant="h4" fontWeight="700">
                              {formatCurrency(lumpsumResult.futureValue)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: 2,
                              mt: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Inflation-Adjusted Value
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(lumpsumResult.realValue)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Real Returns: {formatCurrency(lumpsumResult.realReturns)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* PPF Calculator */}
            <TabPanel value={activeTab} index={4}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      PPF Calculator
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Yearly Investment"
                        type="number"
                        value={ppfYearly}
                        onChange={(e) => setPpfYearly(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        helperText="Maximum ₹1,50,000 per year"
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Investment Period"
                        type="number"
                        value={ppfYears}
                        onChange={(e) => setPpfYears(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                        }}
                        helperText="Minimum 15 years"
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Inflation Rate"
                        type="number"
                        value={ppfInflation}
                        onChange={(e) => setPpfInflation(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText="To calculate inflation-adjusted returns"
                        sx={{ mb: 3 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={calculatePPF}
                        startIcon={<Calculate />}
                        sx={{ py: 1.5 }}
                      >
                        Calculate (7.1% p.a.)
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {ppfResult && (
                      <Box
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, #fa709a, #fee140)',
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          Results
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Total Investment
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(ppfResult.invested)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Estimated Returns
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(ppfResult.returns)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              mt: 3,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Maturity Value
                            </Typography>
                            <Typography variant="h4" fontWeight="700">
                              {formatCurrency(ppfResult.futureValue)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: 2,
                              mt: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Inflation-Adjusted Value
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(ppfResult.realValue)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Real Returns: {formatCurrency(ppfResult.realReturns)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* FD Calculator */}
            <TabPanel value={activeTab} index={5}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Fixed Deposit Calculator
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Deposit Amount"
                        type="number"
                        value={fdAmount}
                        onChange={(e) => setFdAmount(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Interest Rate"
                        type="number"
                        value={fdRate}
                        onChange={(e) => setFdRate(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Period"
                        type="number"
                        value={fdYears}
                        onChange={(e) => setFdYears(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Expected Inflation Rate"
                        type="number"
                        value={fdInflation}
                        onChange={(e) => setFdInflation(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText="To calculate inflation-adjusted returns"
                        sx={{ mb: 3 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={calculateFD}
                        startIcon={<Calculate />}
                        sx={{ py: 1.5 }}
                      >
                        Calculate
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {fdResult && (
                      <Box
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, #feca57, #ff9ff3)',
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          Results
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Principal Amount
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(fdResult.invested)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Interest Earned
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(fdResult.returns)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              mt: 3,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Maturity Value
                            </Typography>
                            <Typography variant="h4" fontWeight="700">
                              {formatCurrency(fdResult.futureValue)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: 2,
                              mt: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Inflation-Adjusted Value
                            </Typography>
                            <Typography variant="h5" fontWeight="700">
                              {formatCurrency(fdResult.realValue)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Real Returns: {formatCurrency(fdResult.realReturns)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
}
