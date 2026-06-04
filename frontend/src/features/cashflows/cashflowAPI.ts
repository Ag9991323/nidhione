import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Cashflow {
  id: string;
  userId: string;
  amount: number;
  category: string;
  type: 'income' | 'spend' | 'investment';
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCashflowRequest {
  amount: number;
  category: string;
  type: 'income' | 'spend' | 'investment';
  description?: string;
  date: string;
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  endDate?: string;
}

export interface UpdateCashflowRequest {
  amount?: number;
  category?: string;
  type?: 'income' | 'spend' | 'investment';
  description?: string | null;
  date?: string;
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  endDate?: string;
}

export interface CashflowSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalSpend: number;
  totalInvestment: number;
  balance: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  transactionCount: number;
}

export interface MonthlyTrend {
  year: number;
  monthlyData: {
    month: number;
    monthName: string;
    income: number;
    spend: number;
    investment: number;
    balance: number;
  }[];
}

export const cashflowAPI = createApi({
  reducerPath: 'cashflowAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/cashflows`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cashflow'],
  endpoints: builder => ({
    getCashflows: builder.query<
      { cashflows: Cashflow[] },
      { month?: number; year?: number; type?: string; category?: string }
    >({
      query: params => {
        const queryParams = new URLSearchParams();
        if (params.month) queryParams.append('month', params.month.toString());
        if (params.year) queryParams.append('year', params.year.toString());
        if (params.type) queryParams.append('type', params.type);
        if (params.category) queryParams.append('category', params.category);
        return `/?${queryParams.toString()}`;
      },
      providesTags: ['Cashflow'],
    }),
    getCashflowSummary: builder.query<CashflowSummary, { month?: number; year?: number }>({
      query: params => {
        const queryParams = new URLSearchParams();
        if (params.month) queryParams.append('month', params.month.toString());
        if (params.year) queryParams.append('year', params.year.toString());
        return `/summary?${queryParams.toString()}`;
      },
      providesTags: ['Cashflow'],
    }),
    getMonthlyTrend: builder.query<MonthlyTrend, { year?: number }>({
      query: params => {
        const queryParams = new URLSearchParams();
        if (params.year) queryParams.append('year', params.year.toString());
        return `/trend?${queryParams.toString()}`;
      },
      providesTags: ['Cashflow'],
    }),
    createCashflow: builder.mutation<{ cashflow: Cashflow }, CreateCashflowRequest>({
      query: data => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cashflow'],
    }),
    updateCashflow: builder.mutation<
      { cashflow: Cashflow },
      { id: string; data: UpdateCashflowRequest }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cashflow'],
    }),
    deleteCashflow: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cashflow'],
    }),
  }),
});

export const {
  useGetCashflowsQuery,
  useGetCashflowSummaryQuery,
  useGetMonthlyTrendQuery,
  useCreateCashflowMutation,
  useUpdateCashflowMutation,
  useDeleteCashflowMutation,
} = cashflowAPI;
