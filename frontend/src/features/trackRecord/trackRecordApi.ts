import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface TrackRecord {
  id: string;
  userId: string;
  snapshotDate: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  createdAt: string;
  updatedAt: string;
}

export const trackRecordApi = createApi({
  reducerPath: 'trackRecordApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/track-records' }),
  endpoints: (builder) => ({
    getTrackRecords: builder.query<TrackRecord[], string>({
      query: (userId) => `/${userId}`,
    }),
    createTrackRecord: builder.mutation<TrackRecord, Partial<TrackRecord>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetTrackRecordsQuery, useCreateTrackRecordMutation } = trackRecordApi;
