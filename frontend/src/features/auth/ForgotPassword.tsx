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
import { useForgotPasswordMutation, useResetPasswordMutation } from './authAPI';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      setStep('otp');
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      setSuccess(true);
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to reset password. Please try again.');
      if (err?.data?.error?.includes('OTP')) {
        setStep('otp');
        setOtp('');
      }
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtp('');
    try {
      await forgotPassword({ email }).unwrap();
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to resend OTP.');
    }
  };

  const subtitle: Record<Step, string> = {
    email: 'Enter your email to receive a password reset OTP',
    otp: `Enter the 6-digit OTP sent to ${email}`,
    password: 'Set your new password',
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
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            NidhiOne
          </Typography>

          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                Password reset successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You can now log in with your new password.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                {subtitle[step]}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {step === 'email' && (
                <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    margin="normal"
                    autoComplete="email"
                    autoFocus
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSending}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {isSending ? <CircularProgress size={24} /> : 'Send OTP'}
                  </Button>
                  <Typography variant="body2" align="center">
                    <Link to="/login" style={{ color: '#1e3a8a', textDecoration: 'none' }}>
                      Back to Login
                    </Link>
                  </Typography>
                </Box>
              )}

              {step === 'otp' && (
                <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 3 }}>
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
                    disabled={otp.length !== 6}
                    sx={{ mt: 3, mb: 1 }}
                  >
                    Verify OTP
                  </Button>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setStep('email');
                        setError('');
                        setOtp('');
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      disabled={isSending}
                      onClick={handleResendOtp}
                    >
                      {isSending ? 'Sending...' : 'Resend OTP'}
                    </Button>
                  </Box>
                </Box>
              )}

              {step === 'password' && (
                <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    margin="normal"
                    autoComplete="new-password"
                    helperText="Minimum 8 characters"
                    autoFocus
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    margin="normal"
                    autoComplete="new-password"
                    error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                    helperText={
                      confirmPassword.length > 0 && newPassword !== confirmPassword
                        ? 'Passwords do not match'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                            {showConfirm ? <Visibility /> : <VisibilityOff />}
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
                    disabled={isResetting || newPassword.length < 8}
                    sx={{ mt: 3, mb: 1 }}
                  >
                    {isResetting ? <CircularProgress size={24} /> : 'Reset Password'}
                  </Button>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setStep('otp');
                        setError('');
                      }}
                    >
                      Back
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
