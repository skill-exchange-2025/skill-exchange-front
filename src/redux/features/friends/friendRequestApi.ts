// src/redux/api/friendRequestApi.ts

import { baseApi } from '@/redux/api/baseApi';
import { CreateFriendRequestDto, FriendRequest, FriendRequestResponse } from '@/types/friendRequest';
import { User } from '@/types/user';

export const friendRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<User[], string>({
      query: (name) => ({
        url: `/friend-requests/search?name=${encodeURIComponent(name)}`,
        method: 'GET',
      }),
    }),
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
      invalidatesTags: ['FriendRequest','Friend'],
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
    checkFriendStatus: builder.query<{
      status: 'friends' | 'request-sent' | 'request-received' | 'none',
      requestId?: string
    }, string>({
      query: (userId) => ({
        url: `/friend-requests/status/${userId}`,
        method: 'GET',
      }),
    }),

    cancelFriendRequest: builder.mutation<void, string>({
      query: (requestId) => ({
        url: `/friend-requests/${requestId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(requestId, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          friendRequestApi.util.updateQueryData('getFriendRequests', undefined, (draft) => {
            return draft.filter(request => request._id !== requestId);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['FriendRequest'],
    }),
  }),
});

export const {
  useCheckFriendStatusQuery,
  useSearchUsersQuery,
  useGetFriendRequestsQuery,
  useGetFriendsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
} = friendRequestApi;