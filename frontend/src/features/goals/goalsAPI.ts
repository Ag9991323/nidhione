import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string | null;
  description: string | null;
  progress: number;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  targetDate: string;
  category?: string;
  description?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  category?: string;
  description?: string;
}

export const goalsAPI = createApi({
  reducerPath: 'goalsAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/goals`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Goal'],
  endpoints: (builder) => ({
    getGoals: builder.query<{ goals: Goal[] }, void>({
      query: () => '/',
      providesTags: ['Goal'],
    }),
    createGoal: builder.mutation<{ goal: Goal }, CreateGoalRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Goal'],
    }),
    updateGoal: builder.mutation<{ goal: Goal }, { id: string; data: UpdateGoalRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Goal'],
    }),
    deleteGoal: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Goal'],
    }),
  }),
});

export const {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
} = goalsAPI;
