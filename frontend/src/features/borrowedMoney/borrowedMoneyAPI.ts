import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface BorrowedMoney {
  id: string;
  userId: string;
  lenderName: string;
  amount: number;
  interestRate?: number;
  borrowDate: string;
  returnDate?: string;
  status: 'pending' | 'partially_returned' | 'fully_returned';
  amountReturned: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBorrowedMoneyData {
  lenderName: string;
  amount: number;
  interestRate?: number;
  borrowDate: string;
  returnDate?: string;
  status?: 'pending' | 'partially_returned' | 'fully_returned';
  amountReturned?: number;
  notes?: string;
}

export const borrowedMoneyAPI = createApi({
  reducerPath: 'borrowedMoneyAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: headers => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['BorrowedMoney'],
  endpoints: builder => ({
    getBorrowedMoney: builder.query<BorrowedMoney[], void>({
      query: () => '/borrowed-money',
      providesTags: ['BorrowedMoney'],
    }),
    createBorrowedMoney: builder.mutation<BorrowedMoney, CreateBorrowedMoneyData>({
      query: data => ({
        url: '/borrowed-money',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BorrowedMoney'],
    }),
    updateBorrowedMoney: builder.mutation<
      BorrowedMoney,
      { id: string; data: Partial<CreateBorrowedMoneyData> }
    >({
      query: ({ id, data }) => ({
        url: `/borrowed-money/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BorrowedMoney'],
    }),
    deleteBorrowedMoney: builder.mutation<void, string>({
      query: id => ({
        url: `/borrowed-money/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BorrowedMoney'],
    }),
  }),
});

export const {
  useGetBorrowedMoneyQuery,
  useCreateBorrowedMoneyMutation,
  useUpdateBorrowedMoneyMutation,
  useDeleteBorrowedMoneyMutation,
} = borrowedMoneyAPI;
