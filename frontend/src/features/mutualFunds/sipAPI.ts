import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface SIP {
  id: string;
  userId: string;
  mfId: string;
  goalId?: string;
  amount: number;
  startDate: string;
  frequency: 'monthly' | 'quarterly';
  nextExecutionDate: string;
  status: 'active' | 'paused' | 'stopped';
  createdAt: string;
  updatedAt: string;
  mutualFund?: {
    id: string;
    schemeName: string;
    schemeCode: string;
  };
  goal?: {
    id: string;
    name: string;
  };
}

export interface CreateSIPRequest {
  mfId: string;
  amount: number;
  startDate: string;
  frequency?: 'monthly' | 'quarterly';
  goalId?: string;
}

export interface UpdateSIPRequest {
  amount?: number;
  frequency?: 'monthly' | 'quarterly';
  status?: 'active' | 'paused' | 'stopped';
  goalId?: string | null;
}

export const sipAPI = createApi({
  reducerPath: 'sipAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/sips`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SIP'],
  endpoints: builder => ({
    getSIPs: builder.query<{ sips: SIP[] }, void>({
      query: () => '/',
      providesTags: ['SIP'],
    }),
    getSIPsByMutualFund: builder.query<{ sips: SIP[] }, string>({
      query: mfId => `/mutual-fund/${mfId}`,
      providesTags: ['SIP'],
    }),
    createSIP: builder.mutation<{ sip: SIP }, CreateSIPRequest>({
      query: data => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SIP'],
    }),
    updateSIP: builder.mutation<{ sip: SIP }, { id: string; data: UpdateSIPRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SIP'],
    }),
    deleteSIP: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SIP'],
    }),
  }),
});

export const {
  useGetSIPsQuery,
  useGetSIPsByMutualFundQuery,
  useCreateSIPMutation,
  useUpdateSIPMutation,
  useDeleteSIPMutation,
} = sipAPI;
