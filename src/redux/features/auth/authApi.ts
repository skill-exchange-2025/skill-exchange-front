import { baseApi } from '@/redux/api/baseApi';

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: '/auth/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    resetPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: email,
      }),
    }),
    updatePassword: builder.mutation({
      query: (verificationData) => ({
        url: '/auth/complete-reset-password',
        method: 'POST',
        body: verificationData,
      }),
    }),

    verifyOTP: builder.mutation({
      query: (otpdata) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: otpdata,
      }),
    }),
    verifyEmail: builder.query({
      query: (token) => ({
        url: `/auth/verify-email`,
        method: 'GET',
        params: { token },
      }),
    }),
    referral: builder.mutation({
      query: (referralData) => ({
        url: '/auth/referral',
        method: 'POST',
        body: referralData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useVerifyOTPMutation,
  useVerifyEmailQuery,
  useReferralMutation,
} = authApi;
