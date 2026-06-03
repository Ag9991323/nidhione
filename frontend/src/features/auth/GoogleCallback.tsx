import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Card, CardContent, CircularProgress, Typography, Button } from '@mui/material';
import { useGoogleLoginMutation } from './authAPI';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from './authSlice';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get('code');
      const oauthError = searchParams.get('error');
      const codeVerifier = sessionStorage.getItem('google_code_verifier');

      if (oauthError) {
        setError(`Google login failed: ${oauthError}`);
        return;
      }

      if (!code) {
        setError('Missing authorization code from Google.');
        return;
      }

      if (!codeVerifier) {
        setError('Missing PKCE verifier. Please try logging in again.');
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/login/google/callback`;
        const result = await googleLogin({ code, codeVerifier, redirectUri }).unwrap();
        sessionStorage.removeItem('google_code_verifier');
        dispatch(setCredentials(result));
        navigate('/dashboard');
      } catch (err: any) {
        setError(err?.data?.error || 'Google login failed. Please try again.');
      }
    };

    run();
  }, [dispatch, googleLogin, navigate, searchParams]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Signing you in
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {isLoading && <CircularProgress />}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button component={RouterLink} to="/login" variant="outlined">
            Back to Login
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
