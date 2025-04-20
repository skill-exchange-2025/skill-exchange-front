// src/redux/api/privateMessagesApi.ts
import { baseApi } from '@/redux/api/baseApi';
import { PrivateMessage } from '@/types/user';

export const privateMessagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send a private message
    sendPrivateMessage: builder.mutation<PrivateMessage, { recipientId: string; content: string,replyTo?: string; }>({
      query: (messageData) => ({
        url: '/private-messages',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['PrivateMessage'],
    }),

    // Get messages with a specific user
    getMessagesWithUser: builder.query<PrivateMessage[], string>({
      query: (recipientId) => ({
        url: `/private-messages/with/${recipientId}`,
        method: 'GET',
      }),
      providesTags: ['PrivateMessage'],
    }),

    // Delete a message
    deletePrivateMessage: builder.mutation<void, string>({
      query: (messageId) => ({
        url: `/private-messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PrivateMessage'],
    }),

    // Edit a message
    editPrivateMessage: builder.mutation<PrivateMessage, { messageId: string; content: string }>({
      query: ({ messageId, content }) => ({
        url: `/private-messages/${messageId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: ['PrivateMessage'],
    }),
  }),
});

export const {
  useSendPrivateMessageMutation,
  useGetMessagesWithUserQuery,
  useDeletePrivateMessageMutation,
  useEditPrivateMessageMutation,
} = privateMessagesApi;