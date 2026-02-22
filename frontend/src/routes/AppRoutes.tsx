import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import MainLayout from '@/layouts/MainLayout';
import TrackRecordPage from '@/features/trackRecord/TrackRecordPage';
import AuthLayout from '@/layouts/AuthLayout';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import Dashboard from '@/features/dashboard/Dashboard';
import Assets from '@/features/assets/Assets';
import StocksList from '@/features/stocks/StocksList';
import MutualFundsList from '@/features/mutualFunds/MutualFundsList';
import FixedDepositsList from '@/features/fixedDeposits/FixedDepositsList';
import BankAccountsList from '@/features/bankAccounts/BankAccountsList';
import RecurringDepositsList from '@/features/recurringDeposits/RecurringDepositsList';
import EPFList from '@/features/epf/EPFList';
import CryptoList from '@/features/crypto/CryptoList';
import LICList from '@/features/lic/LICList';
import Liabilities from '@/features/liabilities/Liabilities';
import LiabilitiesList from '@/features/liabilities/LiabilitiesList';
import LendMoneyList from '@/features/lendMoney/LendMoneyList';
import BorrowedMoneyList from '@/features/borrowedMoney/BorrowedMoneyList';
import RealEstateList from '@/features/realEstate/RealEstateList';
import GoalsList from '@/features/goals/GoalsList';
import Calculators from '@/features/calculators/Calculators';
import Profile from '@/features/profile/Profile';
import CashflowList from '@/features/cashflows/CashflowList';
import GoldList from '@/features/gold/GoldList';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="stocks" element={<StocksList />} />
          <Route path="mutual-funds" element={<MutualFundsList />} />
          <Route path="fixed-deposits" element={<FixedDepositsList />} />
          <Route path="bank-accounts" element={<BankAccountsList />} />
          <Route path="recurring-deposits" element={<RecurringDepositsList />} />
          <Route path="epf" element={<EPFList />} />
          <Route path="crypto" element={<CryptoList />} />
          <Route path="lic" element={<LICList />} />
          <Route path="liabilities" element={<Liabilities />} />
          <Route path="liabilities/:type" element={<LiabilitiesList />} />
          <Route path="lend-money" element={<LendMoneyList />} />
          <Route path="borrowed-money" element={<BorrowedMoneyList />} />
          <Route path="real-estate" element={<RealEstateList />} />
          <Route path="goals" element={<GoalsList />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="cashflows" element={<CashflowList />} />
          <Route path="gold" element={<GoldList />} />

          <Route path="profile" element={<Profile />} />
          <Route path="track-record" element={<TrackRecordPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
