import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LIC {
  id: string;
  policyNumber: string;
  policyName: string;
  sumAssured: number;
  premiumAmount: number;
  maturityDate: string;
  currentValue: number;
  goalId?: string;
  goal?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLICRequest {
  policyNumber: string;
  policyName: string;
  sumAssured: number;
  premiumAmount: number;
  maturityDate: string;
  currentValue?: number;
  goalId?: string;
}

export interface UpdateLICRequest {
  policyNumber?: string;
  policyName?: string;
  sumAssured?: number;
  premiumAmount?: number;
  maturityDate?: string;
  currentValue?: number;
  goalId?: string;
}

export const licAPI = createApi({
  reducerPath: 'licAPI',
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
  tagTypes: ['LIC'],
  endpoints: builder => ({
    getLIC: builder.query<LIC[], void>({
      query: () => '/lic',
      providesTags: ['LIC'],
    }),
    createLIC: builder.mutation<LIC, CreateLICRequest>({
      query: data => ({
        url: '/lic',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LIC'],
    }),
    updateLIC: builder.mutation<LIC, { id: string; data: UpdateLICRequest }>({
      query: ({ id, data }) => ({
        url: `/lic/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LIC'],
    }),
    deleteLIC: builder.mutation<void, string>({
      query: id => ({
        url: `/lic/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LIC'],
    }),
  }),
});

export const { useGetLICQuery, useCreateLICMutation, useUpdateLICMutation, useDeleteLICMutation } =
  licAPI;
