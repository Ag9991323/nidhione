import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3a8a',
      light: '#3b5ccc',
      dark: '#162a63',
    },
    secondary: {
      main: '#0f766e',
      light: '#14b8a6',
      dark: '#0b4f4a',
    },
    success: {
      main: '#15803d',
      light: '#22c55e',
      dark: '#0f5f2c',
    },
    error: {
      main: '#b42318',
      light: '#f04438',
      dark: '#7a271a',
    },
    warning: {
      main: '#b54708',
      light: '#f79009',
      dark: '#7a2e0e',
    },
    info: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e3a8a',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", "Helvetica Neue", sans-serif',
    h1: {
      fontFamily: '"IBM Plex Serif", "Times New Roman", serif',
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: -0.6,
    },
    h2: {
      fontFamily: '"IBM Plex Serif", "Times New Roman", serif',
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: -0.6,
    },
    h3: {
      fontFamily: '"IBM Plex Serif", "Times New Roman", serif',
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: -0.5,
    },
    h4: {
      fontFamily: '"IBM Plex Serif", "Times New Roman", serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: -0.5,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      letterSpacing: 0.3,
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.1)',
    '0 12px 24px rgba(0,0,0,0.12)',
    '0 16px 32px rgba(0,0,0,0.14)',
    '0 20px 40px rgba(0,0,0,0.16)',
    '0 24px 48px rgba(0,0,0,0.18)',
    '0 2px 8px rgba(0,0,0,0.1)',
    '0 4px 12px rgba(0,0,0,0.1)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 12px 32px rgba(0,0,0,0.14)',
    '0 16px 40px rgba(0,0,0,0.16)',
    '0 20px 48px rgba(0,0,0,0.18)',
    '0 24px 56px rgba(0,0,0,0.2)',
    '0 28px 64px rgba(0,0,0,0.22)',
    '0 32px 72px rgba(0,0,0,0.24)',
    '0 36px 80px rgba(0,0,0,0.26)',
    '0 40px 88px rgba(0,0,0,0.28)',
    '0 44px 96px rgba(0,0,0,0.3)',
    '0 48px 104px rgba(0,0,0,0.32)',
    '0 52px 112px rgba(0,0,0,0.34)',
    '0 56px 120px rgba(0,0,0,0.36)',
    '0 60px 128px rgba(0,0,0,0.38)',
    '0 64px 136px rgba(0,0,0,0.4)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(1200px 600px at 10% -10%, rgba(37, 99, 235, 0.06), transparent 60%), radial-gradient(900px 500px at 95% 0%, rgba(15, 118, 110, 0.05), transparent 60%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
        },
        contained: {
          background: '#1e3a8a',
          color: '#ffffff',
          '&:hover': {
            background: '#1a3378',
          },
        },
        outlined: {
          borderColor: '#cbd5e1',
          color: '#0f172a',
          '&:hover': {
            borderColor: '#94a3b8',
            backgroundColor: 'rgba(15, 23, 42, 0.03)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
        elevation2: {
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.1)',
        },
        elevation3: {
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#ffffff',
            '&:hover fieldset': {
              borderColor: '#94a3b8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1e3a8a',
            },
          },
        },
      },
    },
  },
});
