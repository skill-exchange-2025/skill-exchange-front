import { baseApi } from '@/redux/api/baseApi';
import { PaginatedResponse } from '@/types/user';

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
}

export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  tags: string[];
  imagesUrl?: string[];
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
}

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

          queries.forEach(({ endpointName, originalArgs }) => {
            if (endpointName === 'getMarketplaceItems') {
              dispatch(
                marketplaceApi.util.updateQueryData(
                  'getMarketplaceItems',
                  originalArgs as MarketplaceQueryParams,
                  (draft) => {
                    if (!draft?.data) return;
                    const index = draft.data.findIndex(
                      (item) => item._id === id
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

    createMarketplaceItem: builder.mutation<
      MarketplaceItem,
      CreateMarketplaceItemRequest
    >({
      query: (data) => {
        return {
          url: '/marketplace/listings',
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: [{ type: 'MarketplaceItem', id: 'LIST' }],
    }),

    updateMarketplaceItem: builder.mutation<
      MarketplaceItem,
      { id: string; data: Partial<CreateMarketplaceItemRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/marketplace/listings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MarketplaceItem', id },
        { type: 'MarketplaceItem', id: 'LIST' },
      ],
    }),

    deleteMarketplaceItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/marketplace/listings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MarketplaceItem', id },
        { type: 'MarketplaceItem', id: 'LIST' },
      ],
    }),

    purchaseMarketplaceItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/marketplace/transactions`,
        method: 'POST',
        body: {
          listingId: id,
        },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MarketplaceItem', id },
        { type: 'MarketplaceItem', id: 'LIST' },
        'Credits',
      ],
    }),

    completePurchase: builder.mutation<void, string>({
      query: (id) => ({
        url: `/marketplace/transactions/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MarketplaceItem', id },
        { type: 'MarketplaceItem', id: 'LIST' },
        'Credits',
      ],
    }),
  }),
});

export const {
  useGetMarketplaceItemsQuery,
  useGetMarketplaceItemByIdQuery,
  useCreateMarketplaceItemMutation,
  useUpdateMarketplaceItemMutation,
  useDeleteMarketplaceItemMutation,
  usePurchaseMarketplaceItemMutation,
  useCompletePurchaseMutation,
} = marketplaceApi;
