import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Crypto {
  id: string;
  coinName: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  currentValue: number;
  goalId?: string;
  goal?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCryptoRequest {
  coinName: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  currentValue?: number;
  goalId?: string;
}

export interface UpdateCryptoRequest {
  coinName?: string;
  symbol?: string;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
  currentValue?: number;
  goalId?: string;
}

export const cryptoAPI = createApi({
  reducerPath: 'cryptoAPI',
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
  tagTypes: ['Crypto'],
  endpoints: (builder) => ({
    getCrypto: builder.query<Crypto[], void>({
      query: () => '/crypto',
      providesTags: ['Crypto'],
    }),
    createCrypto: builder.mutation<Crypto, CreateCryptoRequest>({
      query: (data) => ({
        url: '/crypto',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Crypto'],
    }),
    updateCrypto: builder.mutation<Crypto, { id: string; data: UpdateCryptoRequest }>({
      query: ({ id, data }) => ({
        url: `/crypto/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Crypto'],
    }),
    deleteCrypto: builder.mutation<void, string>({
      query: (id) => ({
        url: `/crypto/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Crypto'],
    }),
  }),
});

export const {
  useGetCryptoQuery,
  useCreateCryptoMutation,
  useUpdateCryptoMutation,
  useDeleteCryptoMutation,
} = cryptoAPI;
