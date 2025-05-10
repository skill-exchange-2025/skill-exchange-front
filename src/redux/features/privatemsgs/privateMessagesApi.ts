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

    addReaction: builder.mutation<PrivateMessage, { messageId: string; type: string }>({
      query: ({ messageId, type }) => ({
        url: `/private-messages/${messageId}/reactions`,
        method: 'POST',
        body: { type },
      }),
      invalidatesTags: ['PrivateMessage'],
    }),
    removeReaction: builder.mutation<PrivateMessage, { messageId: string }>({
      query: ({ messageId }) => ({
        url: `/private-messages/${messageId}/reactions`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PrivateMessage'],
    }),
    markMessagesAsRead: builder.mutation<{ message: string }, string>({
      query: (otherUserId) => ({
        url: `/private-messages/mark-as-read/${otherUserId}`,
        method: 'PATCH',
      }),
    }),

    
uploadFileWithMessage: builder.mutation<
  PrivateMessage,
  FormData
>({
  query: (formData) => ({
    url: '/private-messages',
    method: 'POST',
    body: formData,
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



    uploadVoiceMessage: builder.mutation<{ audioUrl: string }, FormData>({
      query: (formData) => ({
        url: '/private-messages/upload-voice',
        method: 'POST',
        body: formData,
      }),
    }),
    
    sendVoiceMessage: builder.mutation<
      PrivateMessage,
      {
        recipientId: string;
        audioUrl: string;
        duration: number;
        isVoiceMessage: boolean;
      }
    >({
      query: (voiceMessageData) => ({
        url: '/private-messages/voice',
        method: 'POST',
        body: voiceMessageData,
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
  useUploadFileWithMessageMutation,
  useUploadVoiceMessageMutation,
  useSendVoiceMessageMutation,
  useMarkMessagesAsReadMutation,
  useSendPrivateMessageMutation,
  useGetMessagesWithUserQuery,
  useDeletePrivateMessageMutation,
  useEditPrivateMessageMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
} = privateMessagesApi;