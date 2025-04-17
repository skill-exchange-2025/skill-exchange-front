import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the API slice for chat
const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000',
  }),
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: '/chat/send-message',
        method: 'POST',
        body: messageData, // This should match the backend's CreateMessageDto structure
      }),
    }),

    getMessages: builder.query({
      query: (conversationId) => ({
        url: `/chat/messages/${conversationId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useSendMessageMutation, useGetMessagesQuery } = chatApi;

// Export the API reducer to be included in the store
export default chatApi.reducer;
