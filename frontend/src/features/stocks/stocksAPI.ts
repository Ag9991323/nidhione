import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Stock {
  id: string;
  symbol: string;
  companyName: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averagePrice: number;
  currentPrice: number | null;
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
}

export interface CreateStockRequest {
  symbol: string;
  companyName: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averagePrice: number;
  goalId?: string;
}

export interface UpdateStockRequest {
  quantity?: number;
  averagePrice?: number;
  goalId?: string | null;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  price?: number | null;
}

export const stocksAPI = createApi({
  reducerPath: 'stocksAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/stocks`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Stock'],
  endpoints: builder => ({
    getStocks: builder.query<{ stocks: Stock[] }, void>({
      query: () => '/',
      providesTags: ['Stock'],
    }),
    createStock: builder.mutation<{ stock: Stock }, CreateStockRequest>({
      query: data => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Stock'],
    }),
    updateStock: builder.mutation<{ stock: Stock }, { id: string; data: UpdateStockRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Stock'],
    }),
    deleteStock: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stock'],
    }),
    searchStock: builder.query<{ results: StockSearchResult[] }, string>({
      query: query => `/search?query=${query}`,
    }),
  }),
});

export const {
  useGetStocksQuery,
  useCreateStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useSearchStockQuery,
  useLazySearchStockQuery,
} = stocksAPI;
