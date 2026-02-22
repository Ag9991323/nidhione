import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  balance: number;
  goalId: string | null;
  goal?: {
    id: string;
    name: string;
  };
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountRequest {
  bankName: string;
  accountType: string;
  balance: number;
  goalId?: string;
}

export interface UpdateBankAccountRequest {
  bankName?: string;
  accountType?: string;
  balance?: number;
  goalId?: string | null;
}

export const bankAccountsAPI = createApi({
  reducerPath: 'bankAccountsAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/bank-accounts`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['BankAccount'],
  endpoints: (builder) => ({
    getBankAccounts: builder.query<{ bankAccounts: BankAccount[] }, void>({
      query: () => '/',
      providesTags: ['BankAccount'],
    }),
    createBankAccount: builder.mutation<{ bankAccount: BankAccount }, CreateBankAccountRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    updateBankAccount: builder.mutation<{ bankAccount: BankAccount }, { id: string; data: UpdateBankAccountRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    deleteBankAccount: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccount'],
    }),
  }),
});

export const {
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} = bankAccountsAPI;
