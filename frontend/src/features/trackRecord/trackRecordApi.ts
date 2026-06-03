import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

export interface TrackRecord {
  id: string;
  userId: string;
  snapshotDate: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  breakdown?: {
    stocks: number;
    mutualFunds: number;
    bankAccounts: number;
    fixedDeposits: number;
    recurringDeposits: number;
    bonds: number;
    ppf: number;
    nps: number;
    gold: number;
    realEstate: number;
    epf: number;
    crypto: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const trackRecordApi = createApi({
  reducerPath: 'trackRecordApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/track-records',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: builder => ({
    getTrackRecords: builder.query<TrackRecord[], void>({
      query: () => '/',
    }),
  }),
});

export const { useGetTrackRecordsQuery } = trackRecordApi;
