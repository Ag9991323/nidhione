import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface RealEstate {
  id: string;
  userId: string;
  goalId?: string;
  liabilityId?: string;
  propertyType: string;
  location: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue?: number;
  lastUpdated?: string;
  createdAt: string;
  updatedAt: string;
  liability?: {
    id: string;
    name: string;
    currentBalance: number;
  };
}

export interface CreateRealEstateData {
  propertyType: string;
  location: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue?: number;
  liabilityId?: string;
}

export const realEstateAPI = createApi({
  reducerPa
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['RealEstate'],
  endpoints: (builder) => ({
    getRealEstate: builder.query<RealEstate[], void>({
      query: () => '/real-estate',
      providesTags: ['RealEstate'],
    }),
    createRealEstate: builder.mutation<RealEstate, CreateRealEstateData>({
      query: (data) => ({
        url: '/real-estate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RealEstate'],
    }),
    updateRealEstate: builder.mutation<RealEstate, { id: string; data: Partial<CreateRealEstateData> }>({
      query: ({ id, data }) => ({
        url: `/real-estate/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['RealEstate'],
    }),
    deleteRealEstate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/real-estate/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RealEstate'],
    }),
  }),
});

export const {
  useGetRealEstateQuery,
  useCreateRealEstateMutation,
  useUpdateRealEstateMutation,
  useDeleteRealEstateMutation,
} = realEstateAPI;
