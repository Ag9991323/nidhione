import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as AssetsIcon,
  Flag as GoalsIcon,
  AccountCircle,
  Logout,
  CreditCard as LiabilitiesIcon,
  Calculate as CalculateIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout, selectCurrentUser } from '@/features/auth/authSlice';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Assets', icon: <AssetsIcon />, path: '/assets' },
  { text: 'Liabilities', icon: <LiabilitiesIcon />, path: '/liabilities' },
  { text: 'Cashflow', icon: <ReceiptIcon />, path: '/cashflows' },
  { text: 'Track Record', icon: <SettingsIcon />, path: '/track-record' },
  { text: 'Goals', icon: <GoalsIcon />, path: '/goals' },
  { text: 'Calculators', icon: <CalculateIcon />, path: '/calculators' },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      pt: 3,
      pb: 2,
    }}>
      {/* User Profile Section */}
      <Box sx={{ 
        px: 2.5, 
        pb: 3,
        mb: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            width: 45,
            height: 45,
            border: '2px solid rgba(255, 255, 255, 0.3)',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'white',
                fontWeight: 700,
                letterSpacing: 0.3,
              }}
            >
              {user?.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.75rem',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: location.pathname === item.path 
                  ? 'white' 
                  : 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateX(4px)',
                  color: 'white',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    backgroundColor: 'white',
                    borderRadius: '0 4px 4px 0',
                  },
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: 'inherit',
                  minWidth: 40,
                  transition: 'transform 0.2s ease',
                  ...(location.pathname === item.path && {
                    transform: 'scale(1.1)',
                  }),
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  fontSize: '0.95rem',
                  letterSpacing: 0.3,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bottom Section */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
      }}>
        <Box sx={{
          p: 2,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              display: 'block',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            NidhiOne
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem',
            }}
          >
            Wealth Management Platform
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      {/* Full-width AppBar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          borderRadius: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="inherit" fontWeight="bold" sx={{ 
            mr: 3,
            fontSize: '1.3rem',
            letterSpacing: 0.5,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}>
            💰 NidhiOne
          </Typography>
          <Typography variant="h6" noWrap component="div" sx={{ 
            flexGrow: 1,
            fontSize: '0.95rem',
            fontWeight: 500,
            opacity: 0.95,
          }}>
            Wealth Management
          </Typography>
          <IconButton 
            onClick={handleMenuClick} 
            sx={{ 
              p: 0.5,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 200,
              },
            }}
          >
            <MenuItem disabled sx={{ opacity: 1, cursor: 'default' }}>
              <AccountCircle sx={{ mr: 1.5, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" fontWeight="600">
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => navigate('/profile')}>
              <SettingsIcon sx={{ mr: 1.5 }} />
              Profile Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 1.5 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', mt: 8 }}>
        {/* Sidebar below header */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                top: 64,
                height: 'calc(100% - 64px)',
                borderRadius: 0,
                border: 'none',
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                top: 64,
                height: 'calc(100% - 64px)',
                position: 'fixed',
                borderRadius: 0,
                border: 'none',
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
