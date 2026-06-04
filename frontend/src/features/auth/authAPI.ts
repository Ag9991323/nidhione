import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  mobile?: string;
  otp: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    mobile?: string;
  };
  token: string;
}

export interface GoogleLoginRequest {
  code: string;
  codeVerifier?: string;
  redirectUri?: string;
}

export const authAPI = createApi({
  reducerPath: 'authAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: credentials => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    sendOtp: builder.mutation<SendOtpResponse, SendOtpRequest>({
      query: body => ({
        url: '/send-otp',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: userData => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: body => ({
        url: '/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: body => ({
        url: '/reset-password',
        method: 'POST',
        body,
      }),
    }),
    googleLogin: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: payload => ({
        url: '/google',
        method: 'POST',
        body: payload,
      }),
    }),
    getProfile: builder.query<{ user: AuthResponse['user'] }, void>({
      query: () => '/profile',
    }),
  }),
});

export const {
  useLoginMutation,
  useSendOtpMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleLoginMutation,
  useGetProfileQuery,
} = authAPI;
