// src/redux/features/privateMessages/privateMessagesSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '@/types/channel'; // Adjust the import based on your message type

export interface PrivateMessagesState {
  messages: Record<string, Message[]>; // Key is recipientId, value is array of messages
  selectedRecipientId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PrivateMessagesState = {
  messages: {},
  selectedRecipientId: null,
  isLoading: false,
  error: null,
};

const privateMessagesSlice = createSlice({
  name: 'privateMessages',
  initialState,
  reducers: {
    setSelectedRecipient: (state, action: PayloadAction<string>) => {
      state.selectedRecipientId = action.payload;
    },
    clearSelectedRecipient: (state) => {
      state.selectedRecipientId = null;
    },
    setMessages: (state, action: PayloadAction<{ recipientId: string; messages: Message[] }>) => {
      const { recipientId, messages } = action.payload;
      state.messages[recipientId] = messages;
    },
    addMessage: (state, action: PayloadAction<{ recipientId: string; message: Message }>) => {
      const { recipientId, message } = action.payload;
      if (!state.messages[recipientId]) {
        state.messages[recipientId] = [];
      }
      state.messages[recipientId].push(message);
    },
    deleteMessage: (state, action: PayloadAction<{ recipientId: string; messageId: string }>) => {
      const { recipientId, messageId } = action.payload;
      if (state.messages[recipientId]) {
        state.messages[recipientId] = state.messages[recipientId].filter(
          (msg) => msg._id !== messageId
        );
      }
    },
    updateMessage: (state, action: PayloadAction<{ recipientId: string; messageId: string; content: string }>) => {
      const { recipientId, messageId, content } = action.payload;
      if (state.messages[recipientId]) {
        const messageIndex = state.messages[recipientId].findIndex(msg => msg._id === messageId);
        if (messageIndex !== -1) {
          state.messages[recipientId][messageIndex].content = content;
        }
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSelectedRecipient,
  clearSelectedRecipient,
  setMessages,
  addMessage,
  deleteMessage,
  updateMessage,
  setError,
  clearError,
} = privateMessagesSlice.actions;

export default privateMessagesSlice.reducer;