import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/features/auth/authSlice';
import { authAPI } from '@/features/auth/authAPI';
import { stocksAPI } from '@/features/stocks/stocksAPI';
import { mutualFundsAPI } from '@/features/mutualFunds/mutualFundsAPI';
import { dashboardAPI } from '@/features/dashboard/dashboardAPI';
import { goalsAPI } from '@/features/goals/goalsAPI';
import { fixedDepositsAPI } from '@/features/fixedDeposits/fixedDepositsAPI';
import { bankAccountsAPI } from '@/features/bankAccounts/bankAccountsAPI';
import { recurringDepositsAPI } from '@/features/recurringDeposits/recurringDepositsAPI';
import { epfAPI } from '@/features/epf/epfAPI';
import { cryptoAPI } from '@/features/crypto/cryptoAPI';
import { licAPI } from '@/features/lic/licAPI';
import { liabilitiesAPI } from '@/features/liabilities/liabilitiesAPI';
import { lendMoneyAPI } from '@/features/lendMoney/lendMoneyAPI';
import { borrowedMoneyAPI } from '@/features/borrowedMoney/borrowedMoneyAPI';
import { realEstateAPI } from '@/features/realEstate/realEstateAPI';
import { profileAPI } from '@/features/profile/profileAPI';
import { sipAPI } from '@/features/mutualFunds/sipAPI';
import { cashflowAPI } from '@/features/cashflows/cashflowAPI';
import { goldAPI } from '@/features/gold/goldAPI';
import { trackRecordApi } from '@/features/trackRecord/trackRecordApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authAPI.reducerPath]: authAPI.reducer,
    [stocksAPI.reducerPath]: stocksAPI.reducer,
    [mutualFundsAPI.reducerPath]: mutualFundsAPI.reducer,
    [dashboardAPI.reducerPath]: dashboardAPI.reducer,
    [goalsAPI.reducerPath]: goalsAPI.reducer,
    [fixedDepositsAPI.reducerPath]: fixedDepositsAPI.reducer,
    [bankAccountsAPI.reducerPath]: bankAccountsAPI.reducer,
    [recurringDepositsAPI.reducerPath]: recurringDepositsAPI.reducer,
    [epfAPI.reducerPath]: epfAPI.reducer,
    [cryptoAPI.reducerPath]: cryptoAPI.reducer,
    [licAPI.reducerPath]: licAPI.reducer,
    [liabilitiesAPI.reducerPath]: liabilitiesAPI.reducer,
    [lendMoneyAPI.reducerPath]: lendMoneyAPI.reducer,
    [borrowedMoneyAPI.reducerPath]: borrowedMoneyAPI.reducer,
    [realEstateAPI.reducerPath]: realEstateAPI.reducer,
    [profileAPI.reducerPath]: profileAPI.reducer,
    [sipAPI.reducerPath]: sipAPI.reducer,
    [cashflowAPI.reducerPath]: cashflowAPI.reducer,
    [goldAPI.reducerPath]: goldAPI.reducer,
    [trackRecordApi.reducerPath]: trackRecordApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authAPI.middleware,
      stocksAPI.middleware,
      mutualFundsAPI.middleware,
      dashboardAPI.middleware,
      goalsAPI.middleware,
      fixedDepositsAPI.middleware,
      bankAccountsAPI.middleware,
      recurringDepositsAPI.middleware,
      epfAPI.middleware,
      cryptoAPI.middleware,
      licAPI.middleware,
      liabilitiesAPI.middleware,
      lendMoneyAPI.middleware,
      borrowedMoneyAPI.middleware,
      realEstateAPI.middleware,
      profileAPI.middleware,
      sipAPI.middleware,
      cashflowAPI.middleware,
      goldAPI.middleware,
      trackRecordApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
