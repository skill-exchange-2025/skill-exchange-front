import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Channel, ChannelsState, Message } from '../../../types/channel';
import { messagingApi } from '@/redux/api/messagingApi';

// Get saved channel ID from localStorage if it exists
const savedChannelId = localStorage.getItem('currentChannelId');

const initialState: ChannelsState = {
  channels: [],
  currentChannel: null,
  messages: [],
  isLoadingChannels: false,
  isLoadingMessages: false,
  error: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0,
  },
  lastSelectedChannelId: savedChannelId || null,
};

export const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
      state.isLoadingChannels = false;

      // If we have a saved channel ID but no current channel,
      // try to find and set it from the loaded channels
      if (state.lastSelectedChannelId && !state.currentChannel) {
        const savedChannel = state.channels.find(
          (channel) => channel._id === state.lastSelectedChannelId
        );
        if (savedChannel) {
          state.currentChannel = savedChannel;
        }
      }
    },
    setCurrentChannel: (state, action: PayloadAction<Channel>) => {
      state.currentChannel = action.payload;
      state.lastSelectedChannelId = action.payload._id;

      // Save current channel ID to localStorage
      localStorage.setItem('currentChannelId', action.payload._id);

      // Reset messages when changing channels
      state.messages = [];
      state.pagination.currentPage = 1;
    },
    updateChannel: (state, action: PayloadAction<Channel>) => {
      const index = state.channels.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        state.channels[index] = action.payload;
      }

      // Update current channel if it's the one being updated
      if (
        state.currentChannel &&
        state.currentChannel._id === action.payload._id
      ) {
        state.currentChannel = action.payload;
      }
    },
    setMessages: (
      state,
      action: PayloadAction<{ messages: Message[]; total: number }>
    ) => {
      const { messages, total } = action.payload;
      state.messages =
        state.pagination.currentPage === 1
          ? messages
          : [...state.messages, ...messages];
      state.pagination.totalItems = total;
      state.isLoadingMessages = false;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // First check if message with same ID already exists
      const messageExists = state.messages.some(
        (msg) =>
          msg._id === action.payload._id && action.payload._id !== undefined
      );

      // Also check for messages with the same clientMessageId
      let existingMessageIndex = -1;
      if (action.payload.clientMessageId) {
        existingMessageIndex = state.messages.findIndex(
          (msg) => msg.clientMessageId === action.payload.clientMessageId
        );
      }

      // If there's a matching clientMessageId, update the existing message
      // This handles the case when we receive the socket message first with pending
      // attachment and then later get the updated message with the real attachment
      if (existingMessageIndex !== -1) {
        // We have a message with matching clientMessageId
        const existingMessage = state.messages[existingMessageIndex];

        // Check if this is an update with attachment (from socket or API)
        if (
          action.payload.attachment &&
          (!existingMessage.attachment || existingMessage.attachment.isPending)
        ) {
          console.log('Updating existing message with attachment', {
            existingMessageId: existingMessage._id,
            newMessageId: action.payload._id,
            clientMessageId: action.payload.clientMessageId,
          });

          // Update the existing message with the new data, preserving important fields
          state.messages[existingMessageIndex] = {
            ...existingMessage,
            ...action.payload,
            _id: action.payload._id || existingMessage._id, // Prefer server-assigned ID
          };
        }

        return; // Exit early, we've updated the existing message
      }

      // If message doesn't exist and doesn't have a matching clientMessageId,
      // check for potential semantic duplicates (same content, sender, etc.)
      const isDuplicate =
        !messageExists &&
        existingMessageIndex === -1 &&
        state.messages.some((msg) => {
          if (msg.sender && action.payload.sender) {
            // Handle different sender types (string ID or object with _id)
            const msgSenderId =
              typeof msg.sender === 'string' ? msg.sender : msg.sender._id;

            const payloadSenderId =
              typeof action.payload.sender === 'string'
                ? action.payload.sender
                : action.payload.sender._id;

            const senderIdMatches = msgSenderId === payloadSenderId;

            // Check if the attachment exists and has the same name
            const attachmentMatches =
              msg.attachment &&
              action.payload.attachment &&
              msg.attachment.originalname ===
                action.payload.attachment.originalname;

            const contentMatches = msg.content === action.payload.content;

            // Check if messages were sent within 5 seconds of each other
            const msgTime = new Date(msg.createdAt).getTime();
            const payloadTime = new Date(action.payload.createdAt).getTime();
            const timeClose = Math.abs(msgTime - payloadTime) < 5000;

            return (
              senderIdMatches &&
              (contentMatches || attachmentMatches) &&
              timeClose
            );
          }
          return false;
        });

      // Only add new messages that aren't duplicates
      if (!messageExists && !isDuplicate && existingMessageIndex === -1) {
        console.log('Adding new message to store', {
          messageId: action.payload._id,
          clientMessageId: action.payload.clientMessageId,
          attachment: action.payload.attachment ? 'yes' : 'no',
        });
        // Add new message to the beginning of the list
        state.messages = [action.payload, ...state.messages];
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const messageIndex = state.messages.findIndex(
        (msg) => msg._id === action.payload._id
      );

      if (messageIndex !== -1) {
        // Log for debugging reactions
        if (action.payload.reactions) {
          console.log('Updating message reactions:', {
            messageId: action.payload._id,
            reactions: action.payload.reactions,
          });
        }

        // Preserve reactions if they exist in the current state but not in the payload
        if (
          state.messages[messageIndex].reactions &&
          !action.payload.reactions
        ) {
          action.payload.reactions = state.messages[messageIndex].reactions;
        }

        // Ensure reactions are properly merged if both exist but with different keys
        if (
          state.messages[messageIndex].reactions &&
          action.payload.reactions
        ) {
          // Create a merged reactions object
          const mergedReactions = { ...state.messages[messageIndex].reactions };

          // Add any new reactions from the payload
          Object.keys(action.payload.reactions).forEach((emoji) => {
            mergedReactions[emoji] = action.payload.reactions[emoji];
          });

          // Use the merged reactions
          action.payload.reactions = mergedReactions;
        }

        state.messages[messageIndex] = action.payload;
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload
      );
    },
    setLoading: (
      state,
      action: PayloadAction<{ type: 'channels' | 'messages'; loading: boolean }>
    ) => {
      const { type, loading } = action.payload;
      if (type === 'channels') {
        state.isLoadingChannels = loading;
      } else {
        state.isLoadingMessages = loading;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoadingChannels = false;
      state.isLoadingMessages = false;
    },
    resetError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    incrementPage: (state) => {
      state.pagination.currentPage += 1;
    },
  },
});

export const {
  setChannels,
  setCurrentChannel,
  updateChannel,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setLoading,
  setError,
  resetError,
  setCurrentPage,
  incrementPage,
} = channelsSlice.actions;

export default channelsSlice.reducer;
