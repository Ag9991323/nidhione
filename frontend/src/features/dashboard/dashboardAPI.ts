import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface DashboardData {
  totalPortfolioValue: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInvested: number;
  totalReturns: number;
  totalReturnsPercentage: number;
  stocksValue: number;
  mutualFundsValue: number;
  fixedDepositsValue: number;
  epfValue: number;
  cryptoValue: number;
  licValue: number;
  assetCounts: {
    stocks: number;
    mutualFunds: number;
    bankAccounts: number;
    fixedDeposits: number;
    bonds: number;
    licPolicies: number;
    ppfAccounts: number;
    npsAccounts: number;
    gold: number;
    realEstate: number;
    epfAccounts: number;
    crypto: number;
    liabilities: number;
  };
}

export interface AllocationData {
  allocation: {
    name: string;
    value: number;
  }[];
}

export interface PerformanceData {
  performance: {
    name: string;
    invested: number;
    current: number;
    returns: number;
    returnsPercentage: number;
  }[];
}

export const dashboardAPI = createApi({
  reducerPath: 'dashboardAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/dashboard`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Dashboard'],
  endpoints: builder => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => '/',
      providesTags: ['Dashboard'],
    }),
    getAssetAllocation: builder.query<AllocationData, void>({
      query: () => '/allocation',
      providesTags: ['Dashboard'],
    }),
    getPerformance: builder.query<PerformanceData, void>({
      query: () => '/performance',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery, useGetAssetAllocationQuery, useGetPerformanceQuery } =
  dashboardAPI;
