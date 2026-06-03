import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Fade,
  Grow,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Person, Email, Lock, Save, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectCurrentUser, updateUser } from '@/features/auth/authSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from './profileAPI';

export default function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [profileForm, setProfileForm] = useState({
    name: profileData?.name || user?.name || '',
    email: profileData?.email || user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Update form when data is loaded
  useState(() => {
    if (profileData) {
      setProfileForm({
        name: profileData.name,
        email: profileData.email,
      });
    }
  });

  const handleProfileUpdate = async () => {
    try {
      setError('');
      setSuccess('');

      if (!profileForm.name || !profileForm.email) {
        setError('Name and email are required');
        return;
      }

      const response = await updateProfile(profileForm).unwrap();
      // Update the user in auth state to reflect changes in sidebar
      dispatch(updateUser({ name: response.user.name, email: response.user.email }));
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError('');
      setSuccess('');

      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setError('All password fields are required');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }

      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to change password');
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        pb: 4,
        pt: 3,
      }}
    >
      <Container maxWidth="lg">
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
              My Profile
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Manage your account settings and preferences
            </Typography>
          </Box>
        </Fade>

        {success && (
          <Fade in={true}>
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          </Fade>
        )}

        {error && (
          <Fade in={true}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}

        <Grow in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 800,
              mx: 'auto',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: 1,
                  mr: 2,
                }}
              />
              <Typography variant="h6" fontWeight="700">
                Profile Information
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleProfileUpdate}
                disabled={isUpdating}
                sx={{ mt: 1 }}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: 1,
                  mr: 2,
                }}
              />
              <Typography variant="h6" fontWeight="700">
                Change Password
              </Typography>
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={e =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={e =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<Lock />}
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                sx={{ mt: 1 }}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
}
