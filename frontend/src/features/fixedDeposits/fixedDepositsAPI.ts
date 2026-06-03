import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface FixedDeposit {
  id: string;
  bankName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  goalId: string | null;
  goal?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFixedDepositRequest {
  bankName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  goalId?: string;
}

export interface UpdateFixedDepositRequest {
  bankName?: string;
  amount?: number;
  interestRate?: number;
  startDate?: string;
  maturityDate?: string;
  goalId?: string | null;
}

export const fixedDepositsAPI = createApi({
  reducerPath: 'fixedDepositsAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/fixed-deposits`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['FixedDeposit'],
  endpoints: builder => ({
    getFixedDeposits: builder.query<{ fixedDeposits: FixedDeposit[] }, void>({
      query: () => '/',
      providesTags: ['FixedDeposit'],
    }),
    createFixedDeposit: builder.mutation<{ fixedDeposit: FixedDeposit }, CreateFixedDepositRequest>(
      {
        query: data => ({
          url: '/',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['FixedDeposit'],
      },
    ),
    updateFixedDeposit: builder.mutation<
      { fixedDeposit: FixedDeposit },
      { id: string; data: UpdateFixedDepositRequest }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FixedDeposit'],
    }),
    deleteFixedDeposit: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FixedDeposit'],
    }),
  }),
});

export const {
  useGetFixedDepositsQuery,
  useCreateFixedDepositMutation,
  useUpdateFixedDepositMutation,
  useDeleteFixedDepositMutation,
} = fixedDepositsAPI;
