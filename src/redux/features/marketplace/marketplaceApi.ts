import {baseApi} from '@/redux/api/baseApi';
import {PaginatedResponse} from '@/types/user';

// Define listing types enum
export enum ListingType {
  COURSE = 'course',
  ONLINE_COURSE = 'onlineCourse',
}

// Define marketplace types
export interface MarketplaceItem {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  tags: string[];
  type: ListingType;
  seller?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  status: 'active' | 'sold' | 'inactive';
  imagesUrl?: string[];
  views?: number;
  __v?: number;

  // Course specific fields (static content)
  contentUrls?: string[];
  contentDescription?: string;

  // Online course specific fields (interactive/live sessions)
  location?: string;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
  materials?: string[];
  durationHours?: number;
}

export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  tags: string[];
  type: ListingType;
  imagesUrl?: string[];
}

export interface CreateCourseRequest extends CreateMarketplaceItemRequest {
  type: ListingType.COURSE;
  contentUrls?: string[];
  contentDescription?: string;
}

export interface CreateOnlineCourseRequest
  extends CreateMarketplaceItemRequest {
  type: ListingType.ONLINE_COURSE;
  location?: string;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
  materials?: string[];
  durationHours?: number;
}

export interface MarketplaceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  skillName?: string;
  proficiencyLevel?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: ListingType;
}

// Transaction interfaces
export interface CreateTransactionRequest {
  listingId: string;
}

export interface Transaction {
  _id: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  listing: MarketplaceItem;
  status: 'pending' | 'completed' | 'cancelled';
  amount: number;
  review: Review | null;
  createdAt: string;
  updatedAt: string;
}

// Review interfaces
export interface CreateReviewRequest {
  transactionId: string;
  rating: number;
  comment: string;
}

export interface Review {
  _id: string;
  transaction: string;
  buyer: {
    _id: string;
    name: string;
  };
  seller: {
    _id: string;
    name: string;
  };
  listing: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Wallet interfaces
export interface WalletResponse {
  _id: string;
  user: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  publicKey: string;
  amount: number;
}

export interface ProcessPaymentRequest {
  paymentIntentId: string;
  amount: number;
}

// Define tag types for RTK Query
export type TagTypes =
  | 'MarketplaceItem'
  | 'Transaction'
  | 'Review'
  | 'Wallet'
  | 'Credits';

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarketplaceItems: builder.query<
      PaginatedResponse<MarketplaceItem>,
      MarketplaceQueryParams
    >({
      query: (params) => ({
        url: '/marketplace/listings',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'MarketplaceItem' as const,
                id: _id,
              })),
              { type: 'MarketplaceItem', id: 'LIST' },
            ]
          : [{ type: 'MarketplaceItem', id: 'LIST' }],
    }),

    // Get courses only
    getCourses: builder.query<
      PaginatedResponse<MarketplaceItem>,
      Omit<MarketplaceQueryParams, 'type'>
    >({
      query: (params) => ({
        url: '/marketplace/courses',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'MarketplaceItem' as const,
                id: _id,
              })),
              { type: 'MarketplaceItem', id: 'COURSES' },
            ]
          : [{ type: 'MarketplaceItem', id: 'COURSES' }],
    }),

    // Get online courses only
    getOnlineCourses: builder.query<
      PaginatedResponse<MarketplaceItem>,
      Omit<MarketplaceQueryParams, 'type'>
    >({
      query: (params) => ({
        url: '/marketplace/online-courses',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'MarketplaceItem' as const,
                id: _id,
              })),
              { type: 'MarketplaceItem', id: 'ONLINE_COURSES' },
            ]
          : [{ type: 'MarketplaceItem', id: 'ONLINE_COURSES' }],
    }),

    getMarketplaceItemById: builder.query<MarketplaceItem, string>({
      query: (id) => ({
        url: `/marketplace/listings/${id}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result ? [{ type: 'MarketplaceItem', id: result._id }] : [],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: updatedItem } = await queryFulfilled;
          // Update all existing marketplace queries
          const rootState = getState();
          const queries = marketplaceApi.util.selectInvalidatedBy(rootState, [
            { type: 'MarketplaceItem', id: 'LIST' },
          ]);

          queries.forEach(({ endpointName, originalArgs }: any) => {
            if (endpointName === 'getMarketplaceItems') {
              dispatch(
                marketplaceApi.util.updateQueryData(
                  'getMarketplaceItems',
                  originalArgs as MarketplaceQueryParams,
                  (draft: any) => {
                    if (!draft?.data) return;
                    const index = draft.data.findIndex(
                      (item: any) => item._id === id
                    );
                    if (index !== -1) {
                      draft.data[index] = updatedItem;
                    }
                  }
                )
              );
            }
          });
        } catch {}
      },
    }),

    // Create a course
    createCourse: builder.mutation<MarketplaceItem, CreateCourseRequest>({
      query: (data) => {
        return {
          url: '/marketplace/courses',
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: [
        { type: 'MarketplaceItem', id: 'LIST' },
        { type: 'MarketplaceItem', id: 'COURSES' },
      ],
    }),

    // Create an online course
    createOnlineCourse: builder.mutation<
      MarketplaceItem,
      CreateOnlineCourseRequest
    >({
      query: (data) => {
        return {
          url: '/marketplace/online-courses',
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: [
        { type: 'MarketplaceItem', id: 'LIST' },
        { type: 'MarketplaceItem', id: 'ONLINE_COURSES' },
      ],
    }),

    updateMarketplaceItem: builder.mutation<
      MarketplaceItem,
      {
        id: string;
        data: Partial<CreateMarketplaceItemRequest> & {
          views?: number;
          status?: string;
          imagesUrl?: string[];
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/marketplace/listings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MarketplaceItem', id },
        { type: 'MarketplaceItem', id: 'LIST' },
        { type: 'MarketplaceItem', id: 'COURSES' },
        { type: 'MarketplaceItem', id: 'ONLINE_COURSES' },
      ],
    }),

    deleteMarketplaceItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/marketplace/listings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'MarketplaceItem', id: 'LIST' },
        { type: 'MarketplaceItem', id: 'COURSES' },
        { type: 'MarketplaceItem', id: 'ONLINE_COURSES' },
      ],
    }),

    purchaseMarketplaceItem: builder.mutation<Transaction, string>({
      query: (listingId) => ({
        url: '/marketplace/transactions',
        method: 'POST',
        body: { listingId },
      }),
      invalidatesTags: [
        { type: 'MarketplaceItem', id: 'LIST' },
        { type: 'MarketplaceItem', id: 'COURSES' },
        { type: 'MarketplaceItem', id: 'ONLINE_COURSES' },
        'Credits',
      ],
    }),

    // Transaction endpoints
    getTransactions: builder.query<PaginatedResponse<Transaction>, void>({
      query: () => ({
        url: '/marketplace/transactions',
        method: 'GET',
      }),
    }),

    completeTransaction: builder.mutation<Transaction, string>({
      query: (transactionId) => ({
        url: `/marketplace/transactions/${transactionId}/complete`,
        method: 'PATCH',
      }),
    }),

    // Review endpoints
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (data) => ({
        url: '/marketplace/reviews',
        method: 'POST',
        body: data,
      }),
    }),

    getReviews: builder.query<
      PaginatedResponse<Review>,
      { listingId?: string }
    >({
      query: (params) => ({
        url: '/marketplace/reviews',
        method: 'GET',
        params,
      }),
    }),

    // Wallet and payment endpoints
    getWallet: builder.query<WalletResponse, void>({
      query: () => ({
        url: '/payments/wallet',
        method: 'GET',
      }),
    }),

    createPaymentIntent: builder.mutation<
      PaymentIntentResponse,
      CreatePaymentIntentRequest
    >({
      query: (data) => ({
        url: '/payments/create-intent',
        method: 'POST',
        body: data,
      }),
    }),

    processPayment: builder.mutation<WalletResponse, ProcessPaymentRequest>({
      query: (data) => ({
        url: '/payments/process',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetMarketplaceItemsQuery,
  useGetCoursesQuery,
  useGetOnlineCoursesQuery,
  useGetMarketplaceItemByIdQuery,
  useCreateCourseMutation,
  useCreateOnlineCourseMutation,
  useUpdateMarketplaceItemMutation,
  useDeleteMarketplaceItemMutation,
  usePurchaseMarketplaceItemMutation,
  useGetTransactionsQuery,
  useCompleteTransactionMutation,
  useCreateReviewMutation,
  useGetReviewsQuery,
  useGetWalletQuery,
  useCreatePaymentIntentMutation,
  useProcessPaymentMutation,
} = marketplaceApi;
