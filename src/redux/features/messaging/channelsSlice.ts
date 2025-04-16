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
      // Check if the message already exists to avoid duplicates
      const messageExists = state.messages.some(
        (msg) => msg._id === action.payload._id
      );

      if (!messageExists) {
        // Add new message to the top of the list
        state.messages = [action.payload, ...state.messages];
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const messageIndex = state.messages.findIndex(
        (msg) => msg._id === action.payload._id
      );

      if (messageIndex !== -1) {
        // Preserve reactions if they exist in the current state but not in the payload
        if (
          state.messages[messageIndex].reactions &&
          !action.payload.reactions
        ) {
          action.payload.reactions = state.messages[messageIndex].reactions;
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
