import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface EPF {
  id: string;
  balance: number;
  lastUpdated: string | null;
  goalId: string | null;
  goal?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEPFRequest {
  balance: number;
  goalId?: string;
}

export interface UpdateEPFRequest {
  balance?: number;
  goalId?: string | null;
}

export const epfAPI = createApi({
  reducerPath: 'epfAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/epf`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['EPF'],
  endpoints: (builder) => ({
    getEPFs: builder.query<{ epfAccounts: EPF[] }, void>({
      query: () => '/',
      providesTags: ['EPF'],
    }),
    createEPF: builder.mutation<{ epfAccount: EPF }, CreateEPFRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EPF'],
    }),
    updateEPF: builder.mutation<{ epfAccount: EPF }, { id: string; data: UpdateEPFRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EPF'],
    }),
    deleteEPF: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EPF'],
    }),
  }),
});

export const {
  useGetEPFsQuery,
  useCreateEPFMutation,
  useUpdateEPFMutation,
  useDeleteEPFMutation,
} = epfAPI;
