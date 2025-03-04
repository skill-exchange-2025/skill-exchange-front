import { baseApi } from '@/redux/api/baseApi';
import { PaginatedResponse, PaginationParams } from '@/types/user';

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
    }),

    getMarketplaceItemById: builder.query<MarketplaceItem, string>({
      query: (id) => ({
        url: `/marketplace/listings/${id}`,
        method: 'GET',
      }),
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
    }),

    deleteMarketplaceItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/marketplace/listings/${id}`,
        method: 'DELETE',
      }),
    }),

    purchaseMarketplaceItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/marketplace/transactions`,
        method: 'POST',
        body: {
          listingId: id,
        },
      }),
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
} = marketplaceApi;
