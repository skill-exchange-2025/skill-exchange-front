import { baseApi } from '@/redux/api/baseApi';
import { PurchaseRecord } from './creditsSlice';

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  description: string;
  timestamp: string;
  reference: string;
}

export interface UserCreditsResponse {
  _id: string;
  user: string;
  balance: number;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PurchaseCreditsRequest {
  amount: number;
  packageId: string;
  paymentMethodId?: string;
}

export const creditsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserCredits: builder.query<UserCreditsResponse, void>({
      query: () => ({
        url: '/payments/wallet',
        method: 'GET',
      }),
      providesTags: ['Credits'],
    }),
    completePurchase: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payments/transactions/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MarketplaceItem', id },
        { type: 'MarketplaceItem', id: 'LIST' },
        'Credits',
      ],
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
  useCompletePurchaseMutation,
} = creditsApi;
