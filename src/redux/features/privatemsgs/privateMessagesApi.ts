// src/redux/api/privateMessagesApi.ts
import { baseApi } from '@/redux/api/baseApi';
import { Message } from '@/types/channel'; // You might want to create a specific type for private messages

export const privateMessagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send a private message
    sendPrivateMessage: builder.mutation<Message, { recipientId: string; content: string }>({
      query: (messageData) => ({
        url: '/private-messages',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['PrivateMessage'],
    }),

    // Get messages with a specific user
    getMessagesWithUser: builder.query<Message[], string>({
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
    editPrivateMessage: builder.mutation<Message, { messageId: string; content: string }>({
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