import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#7c94f5',
      dark: '#5568d3',
    },
    secondary: {
      main: '#764ba2',
      light: '#9063b8',
      dark: '#5e3c82',
    },
    success: {
      main: '#11998e',
      light: '#38ef7d',
      dark: '#0d7a72',
    },
    error: {
      main: '#ee0979',
      light: '#ff6a00',
      dark: '#c00764',
    },
    warning: {
      main: '#feca57',
      light: '#ffd700',
      dark: '#f5b041',
    },
    info: {
      main: '#4facfe',
      light: '#00f2fe',
      dark: '#3d8bd4',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: -0.5,
    },
    h4: {
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
    borderRadius: 12,
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c94f5 0%, #9063b8 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
            '&:hover fieldset': {
              borderColor: '#667eea',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
            },
          },
        },
      },
    },
  },
});
