import { baseApi } from '@/redux/api/baseApi';
import { PurchaseRecord } from './creditsSlice';

// Define credit API types
export interface PurchaseCreditsRequest {
  amount: number;
  packageId: string;
  paymentMethodId?: string;
}

export interface UserCreditsResponse {
  credits: number;
  purchaseHistory: PurchaseRecord[];
}

export const creditsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserCredits: builder.query<UserCreditsResponse, void>({
      query: () => ({
        url: '/credits',
        method: 'GET',
      }),
      providesTags: ['Credits'],
    }),

    purchaseCredits: builder.mutation<PurchaseRecord, PurchaseCreditsRequest>({
      query: (data) => ({
        url: '/credits/purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Credits'],
    }),

    getTransactionHistory: builder.query<PurchaseRecord[], void>({
      query: () => ({
        url: '/credits/transactions',
        method: 'GET',
      }),
      providesTags: ['Credits'],
    }),
  }),
});

export const {
  useGetUserCreditsQuery,
  usePurchaseCreditsMutation,
  useGetTransactionHistoryQuery,
} = creditsApi;
