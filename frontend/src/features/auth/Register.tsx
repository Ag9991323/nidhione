import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSendOtpMutation, useRegisterMutation } from './authAPI';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from './authSlice';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await sendOtp({ email }).unwrap();
      setStep('otp');
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await register({ email, password, name, mobile, otp }).unwrap();
      dispatch(setCredentials(result));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.data?.error || 'Registration failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtp('');
    try {
      await sendOtp({ email }).unwrap();
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to resend OTP.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            NidhiOne
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {step === 'form'
              ? 'Create your finance dashboard account'
              : `Enter the 6-digit OTP sent to ${email}`}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {step === 'form' ? (
            <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                margin="normal"
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                margin="normal"
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="Mobile Number (Optional)"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                margin="normal"
                autoComplete="new-password"
                helperText="Minimum 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                margin="normal"
                autoComplete="new-password"
                error={confirmPassword.length > 0 && password !== confirmPassword}
                helperText={
                  confirmPassword.length > 0 && password !== confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(v => !v)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isSendingOtp}
                sx={{ mt: 3, mb: 2 }}
              >
                {isSendingOtp ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>

              <Typography variant="body2" align="center">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#1e3a8a', textDecoration: 'none' }}>
                  Login
                </Link>
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyAndRegister} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                margin="normal"
                inputProps={{ maxLength: 6, style: { letterSpacing: '8px', fontSize: '24px' } }}
                placeholder="______"
                autoFocus
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isRegistering || otp.length !== 6}
                sx={{ mt: 3, mb: 1 }}
              >
                {isRegistering ? <CircularProgress size={24} /> : 'Verify & Create Account'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setStep('form');
                    setError('');
                    setOtp('');
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="text"
                  size="small"
                  disabled={isSendingOtp}
                  onClick={handleResendOtp}
                >
                  {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
