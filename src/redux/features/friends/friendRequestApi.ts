// src/redux/api/friendRequestApi.ts

import { baseApi } from '@/redux/api/baseApi';
import { CreateFriendRequestDto, FriendRequest, FriendRequestResponse } from '@/types/friendRequest';
import { User } from '@/types/user';

export const friendRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFriendRequests: builder.query<FriendRequest[], void>({
      query: () => ({
        url: '/friend-requests',
        method: 'GET',
      }),
      providesTags: ['FriendRequest'],
    }),

    getFriends: builder.query<User[], void>({
      query: () => ({
        url: '/friend-requests/friends',
        method: 'GET',
      }),
      providesTags: ['Friend'],
    }),

    sendFriendRequest: builder.mutation<FriendRequestResponse, CreateFriendRequestDto>({
      query: (createFriendDto) => ({
        url: '/friend-requests',
        method: 'POST',
        body: createFriendDto,
      }),
      invalidatesTags: ['FriendRequest'],
    }),

    acceptFriendRequest: builder.mutation<FriendRequestResponse, string>({
      query: (requestId) => ({
        url: `/friend-requests/${requestId}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: ['FriendRequest', 'Friend'],
    }),

    rejectFriendRequest: builder.mutation<FriendRequestResponse, string>({
      query: (requestId) => ({
        url: `/friend-requests/${requestId}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['FriendRequest'],
    }),

    cancelFriendRequest: builder.mutation<void, string>({
      query: (requestId) => ({
        url: `/friend-requests/${requestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FriendRequest'],
    }),
  }),
});

export const {
  useGetFriendRequestsQuery,
  useGetFriendsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
} = friendRequestApi;