import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Keep `VITE_API_URL` consistent across the app:
// - In dev it defaults to `http://localhost:3000/api`
// - In prod set it to `https://<backend-domain>/api`
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface GoldAsset {
  id: string;
  userId: string;
  type: 'physical' | 'digital' | 'etf';
  name?: string;

  // For physical & digital
  quantityGrams?: number;
  purity?: '24K' | '22K' | '18K' | '14K';
  averagePricePerGram?: number;
  currentPricePerGram?: number;
  makingCharges?: number;
  storageLocation?: string;

  // For ETF
  schemeName?: string;
  schemeCode?: string;
  units?: number;
  averageNav?: number;
  currentNav?: number;

  investedAmount: number;
  currentValue: number;
  returns: number;
  returnsPercentage: number;

  goalId?: string;
  goal?: {
    id: string;
    name: string;
  };

  lastUpdated: string;
  createdAt: string;
}

export interface GoldPrices {
  '24K': number;
  '22K': number;
  '18K': number;
  '14K': number;
  lastUpdated: string;
}

export interface CreateGoldRequest {
  type: 'physical' | 'digital' | 'etf';
  name?: string;
  quantityGrams?: number;
  purity?: '24K' | '22K' | '18K' | '14K';
  averagePricePerGram?: number;
  makingCharges?: number;
  storageLocation?: string;
  schemeName?: string;
  schemeCode?: string;
  units?: number;
  averageNav?: number;
  investedAmount: number;
  goalId?: string;
}

export interface UpdateGoldRequest {
  name?: string;
  quantityGrams?: number;
  purity?: '24K' | '22K' | '18K' | '14K';
  averagePricePerGram?: number;
  makingCharges?: number;
  storageLocation?: string;
  units?: number;
  averageNav?: number;
  investedAmount?: number;
  goalId?: string | null;
}

export const goldAPI = createApi({
  reducerPath: 'goldAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/gold`,
    prepareHeaders: headers => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Gold'],
  endpoints: builder => ({
    getAllGold: builder.query<{ goldAssets: GoldAsset[] }, void>({
      query: () => '/',
      providesTags: ['Gold'],
    }),

    getCurrentGoldPrices: builder.query<GoldPrices, void>({
      query: () => '/prices',
    }),

    createGold: builder.mutation<{ gold: GoldAsset }, CreateGoldRequest>({
      query: data => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Gold'],
    }),

    updateGold: builder.mutation<{ gold: GoldAsset }, { id: string; data: UpdateGoldRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Gold'],
    }),

    deleteGold: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Gold'],
    }),
  }),
});

export const {
  useGetAllGoldQuery,
  useGetCurrentGoldPricesQuery,
  useCreateGoldMutation,
  useUpdateGoldMutation,
  useDeleteGoldMutation,
} = goldAPI;
