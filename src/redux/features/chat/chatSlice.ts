import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

// Define the types here if you prefer everything in the same file
type TChatMessage = {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string; // You could also use a Date object, but keeping it as a string for simplicity
};

type TChatState = {
  messages: TChatMessage[]; // Store messages of a conversation
  currentConversationId: string | null; // Track the current conversation
};

const initialState: TChatState = {
  messages: [],
  currentConversationId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<TChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<TChatMessage>) => {
      state.messages.push(action.payload);
    },
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, setCurrentConversation, clearMessages } = chatSlice.actions;

export const useCurrentMessages = (state: RootState) => state.chat.messages;
export const useCurrentConversation = (state: RootState) => state.chat.currentConversationId;

export default chatSlice.reducer;
