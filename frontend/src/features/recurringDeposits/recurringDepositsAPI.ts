import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface RecurringDeposit {
  id: string;
  bankName: string;
  monthlyAmount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  tenure: number;
  maturityAmount: number;
  goalId: string | null;
  goal?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringDepositRequest {
  bankName: string;
  monthlyAmount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  tenure: number;
  goalId?: string;
}

export interface UpdateRecurringDepositRequest {
  bankName?: string;
  monthlyAmount?: number;
  interestRate?: number;
  startDate?: string;
  maturityDate?: string;
  tenure?: number;
  goalId?: string | null;
}

export const recurringDepositsAPI = createApi({
  reducerPath: 'recurringDepositsAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/recurring-deposits`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['RecurringDeposit'],
  endpoints: (builder) => ({
    getRecurringDeposits: builder.query<{ recurringDeposits: RecurringDeposit[] }, void>({
      query: () => '/',
      providesTags: ['RecurringDeposit'],
    }),
    createRecurringDeposit: builder.mutation<{ recurringDeposit: RecurringDeposit }, CreateRecurringDepositRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RecurringDeposit'],
    }),
    updateRecurringDeposit: builder.mutation<{ recurringDeposit: RecurringDeposit }, { id: string; data: UpdateRecurringDepositRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['RecurringDeposit'],
    }),
    deleteRecurringDeposit: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RecurringDeposit'],
    }),
  }),
});

export const {
  useGetRecurringDepositsQuery,
  useCreateRecurringDepositMutation,
  useUpdateRecurringDepositMutation,
  useDeleteRecurringDepositMutation,
} = recurringDepositsAPI;
