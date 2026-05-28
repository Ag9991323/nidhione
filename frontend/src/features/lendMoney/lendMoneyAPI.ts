import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LendMoney {
  id: string;
  userId: string;
  borrowerName: string;
  amount: number;
  interestRate?: number;
  lendDate: string;
  returnDate?: string;
  status: 'pending' | 'partially_returned' | 'fully_returned';
  amountReturned: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLendMoneyData {
  borrowerName: string;
  amount: number;
  interestRate?: number;
  lendDate: string;
  returnDate?: string;
  status?: 'pending' | 'partially_returned' | 'fully_returned';
  amountReturned?: number;
  notes?: string;
}

export const lendMoneyAPI = createApi({
  reducerPath: 'lendMoneyAPI',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['LendMoney'],
  endpoints: (builder) => ({
    getLendMoney: builder.query<LendMoney[], void>({
      query: () => '/lend-money',
      providesTags: ['LendMoney'],
    }),
    createLendMoney: builder.mutation<LendMoney, CreateLendMoneyData>({
      query: (data) => ({
        url: '/lend-money',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LendMoney'],
    }),
    updateLendMoney: builder.mutation<LendMoney, { id: string; data: Partial<CreateLendMoneyData> }>({
      query: ({ id, data }) => ({
        url: `/lend-money/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LendMoney'],
    }),
    deleteLendMoney: builder.mutation<void, string>({
      query: (id) => ({
        url: `/lend-money/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LendMoney'],
    }),
  }),
});

export const {
  useGetLendMoneyQuery,
  useCreateLendMoneyMutation,
  useUpdateLendMoneyMutation,
  useDeleteLendMoneyMutation,
} = lendMoneyAPI;
