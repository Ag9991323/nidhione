import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface MutualFund {
  id: string;
  schemeCode: string;
  schemeName: string;
  amcName: string | null;
  units: number;
  averageNav: number;
  currentNav: number | null;
  investedAmount: number;
  currentValue: number | null;
  returns: number | null;
  returnsPercentage: number | null;
  lastUpdated: string | null;
  goalId: string | null;
  goal?: {
    id: string;
    name: string;
  };
  sips?: SIP[];
}

export interface SIP {
  id: string;
  amount: number;
  startDate: string;
  frequency: string;
  nextExecutionDate: string;
  status: string;
}

export interface CreateMutualFundRequest {
  schemeCode: string;
  schemeName: string;
  amcName?: string;
  units: number;
  averageNav: number;
  goalId?: string;
}

export interface UpdateMutualFundRequest {
  units?: number;
  averageNav?: number;
  goalId?: string | null;
}

export interface SearchMFResult {
  schemeCode: string;
  schemeName: string;
  nav: number;
  date: string;
}

export const mutualFundsAPI = createApi({
  reducerPath: 'mutualFundsAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/mutual-funds`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MutualFund'],
  endpoints: (builder) => ({
    getMutualFunds: builder.query<{ mutualFunds: MutualFund[] }, void>({
      query: () => '/',
      providesTags: ['MutualFund'],
    }),
    createMutualFund: builder.mutation<{ mutualFund: MutualFund }, CreateMutualFundRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MutualFund'],
    }),
    updateMutualFund: builder.mutation<{ mutualFund: MutualFund }, { id: string; data: UpdateMutualFundRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MutualFund'],
    }),
    deleteMutualFund: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MutualFund'],
    }),
    searchMutualFund: builder.query<{ results: SearchMFResult[] }, string>({
      query: (query) => `/search?query=${query}`,
    }),
  }),
});

export const {
  useGetMutualFundsQuery,
  useCreateMutualFundMutation,
  useUpdateMutualFundMutation,
  useDeleteMutualFundMutation,
  useSearchMutualFundQuery,
  useLazySearchMutualFundQuery,
} = mutualFundsAPI;
