import {baseApi} from './baseApi';
import {Channel, ChannelMessagesResponse, CreateChannelDto, CreateMessageDto, Message,} from '../../types/channel';

export const messagingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Channels
    createChannel: builder.mutation<Channel, CreateChannelDto>({
      query: (createChannelDto) => ({
        url: '/messaging/channels',
        method: 'POST',
        body: createChannelDto,
      }),
      invalidatesTags: ['Channel'],
    }),

    getChannels: builder.query<
      { channels: Channel[]; total: number },
      { page?: number; limit?: number } | undefined
    >({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/messaging/channels',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Channel'],
    }),

    joinChannel: builder.mutation<Channel, string>({
      query: (channelId) => ({
        url: `/messaging/channels/${channelId}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Channel'],
    }),

    leaveChannel: builder.mutation<{ message: string }, string>({
      query: (channelId) => ({
        url: `/messaging/channels/${channelId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Channel'],
    }),

    // Messages
    getChannelMessages: builder.query<
      ChannelMessagesResponse,
      { channelId: string; page?: number; limit?: number }
    >({
      query: ({ channelId, page = 1, limit = 50 }) => ({
        url: `/messaging/channels/${channelId}/messages`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (result, error, { channelId }) =>
        result
          ? [
              ...result.messages.map(({ _id }) => ({
                type: 'Message' as const,
                id: _id,
              })),
              { type: 'Message' as const, id: `CHANNEL_${channelId}` },
            ]
          : [{ type: 'Message' as const, id: `CHANNEL_${channelId}` }],
      keepUnusedDataFor: 0, // Don't keep unused channel messages in cache
    }),

    createMessage: builder.mutation<Message, CreateMessageDto>({
      query: (createMessageDto) => ({
        url: '/messaging/messages',
        method: 'POST',
        body: createMessageDto,
      }),
      invalidatesTags: (result, error, { channel }) =>
        error ? [] : [{ type: 'Message', id: `CHANNEL_${channel}` }],
    }),

    deleteMessage: builder.mutation<{ message: string }, string>({
      query: (messageId) => ({
        url: `/messaging/messages/${messageId}/delete`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, messageId) =>
        error ? [] : [{ type: 'Message', id: messageId }],
    }),

    uploadFileWithMessage: builder.mutation<Message, FormData>({
      query: (formData) => ({
        url: '/messaging/messages/upload',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: (result, error, formData) => {
        // Extract the channel ID from the FormData
        const channelId = formData.get('channel') as string;
        return error ? [] : [{ type: 'Message', id: `CHANNEL_${channelId}` }];
      },
    }),

    searchMessages: builder.query<
      Message[],
      { query: string; channelId?: string }
    >({
      query: ({ query, channelId }) => ({
        url: '/messaging/messages/search',
        method: 'GET',
        params: { query, channelId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: 'Message' as const,
                id: _id,
              })),
            ]
          : [{ type: 'Message' as const, id: 'LIST' }],
    }),

    addReaction: builder.mutation<
      Message,
      { messageId: string; emoji: string }
    >({
      query: ({ messageId, emoji }) => ({
        url: `/messaging/messages/${messageId}/reactions`,
        method: 'POST',
        body: { emoji },
      }),
      invalidatesTags: (result, error, { messageId }) =>
        error ? [] : [{ type: 'Message', id: messageId }],
    }),

    removeReaction: builder.mutation<
      Message,
      { messageId: string; emoji: string }
    >({
      query: ({ messageId, emoji }) => ({
        url: `/messaging/messages/${messageId}/reactions`,
        method: 'DELETE',
        body: { emoji },
      }),
      invalidatesTags: (result, error, { messageId }) =>
        error ? [] : [{ type: 'Message', id: messageId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateChannelMutation,
  useGetChannelsQuery,
  useJoinChannelMutation,
  useLeaveChannelMutation,
  useGetChannelMessagesQuery,
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useUploadFileWithMessageMutation,
  useSearchMessagesQuery,
  useAddReactionMutation,
  useRemoveReactionMutation,
} = messagingApi;
