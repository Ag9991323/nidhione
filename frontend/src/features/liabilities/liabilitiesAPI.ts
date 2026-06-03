import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Liability {
  id: string;
  name: string;
  type: 'home_loan' | 'car_loan' | 'personal_loan' | 'credit_card' | 'education_loan' | 'other';
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  emiAmount?: number;
  startDate: string;
  endDate?: string;
  lender?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiabilityRequest {
  name: string;
  type: 'home_loan' | 'car_loan' | 'personal_loan' | 'credit_card' | 'education_loan' | 'other';
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  emiAmount?: number;
  startDate: string;
  endDate?: string;
  lender?: string;
}

export interface UpdateLiabilityRequest {
  name?: string;
  type?: 'home_loan' | 'car_loan' | 'personal_loan' | 'credit_card' | 'education_loan' | 'other';
  principalAmount?: number;
  currentBalance?: number;
  interestRate?: number;
  emiAmount?: number;
  startDate?: string;
  endDate?: string;
  lender?: string;
}

export const liabilitiesAPI = createApi({
  reducerPath: 'liabilitiesAPI',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Liability'],
  endpoints: builder => ({
    getLiabilities: builder.query<Liability[], void>({
      query: () => '/liabilities',
      providesTags: ['Liability'],
    }),
    createLiability: builder.mutation<Liability, CreateLiabilityRequest>({
      query: data => ({
        url: '/liabilities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Liability'],
    }),
    updateLiability: builder.mutation<Liability, { id: string; data: UpdateLiabilityRequest }>({
      query: ({ id, data }) => ({
        url: `/liabilities/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Liability'],
    }),
    deleteLiability: builder.mutation<void, string>({
      query: id => ({
        url: `/liabilities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Liability'],
    }),
  }),
});

export const {
  useGetLiabilitiesQuery,
  useCreateLiabilityMutation,
  useUpdateLiabilityMutation,
  useDeleteLiabilityMutation,
} = liabilitiesAPI;
