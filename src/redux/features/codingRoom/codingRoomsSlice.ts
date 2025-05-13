// src/features/codingRooms/codingRoomsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CodingRoom } from '@/types/codingRoom';

interface CodeEdit {
    from: number;
    to: number;
    text: string;
}

export interface CodingRoomsState {
    activeRoom: CodingRoom | null;
    currentCode: string;
    language: string;
    theme: string;
    pendingEdits: CodeEdit[];
    isConnected: boolean;
    connectedUsers: string[];
    error: string | null;
}

const initialState: CodingRoomsState = {
    activeRoom: null,
    currentCode: '',
    language: 'javascript',
    theme: 'vs-dark',
    pendingEdits: [],
    isConnected: false,
    connectedUsers: [],
    error: null,
};

export const codingRoomsSlice = createSlice({
    name: 'codingRooms',
    initialState,
    reducers: {
        setActiveRoom: (state, action: PayloadAction<CodingRoom>) => {
            state.activeRoom = action.payload;
            state.currentCode = action.payload.currentCode || '';
            state.language = action.payload.language || 'javascript';
            state.theme = action.payload.theme || 'vs-dark';
        },

        clearActiveRoom: (state) => {
            state.activeRoom = null;
            state.currentCode = '';
            state.pendingEdits = [];
            state.connectedUsers = [];
            state.isConnected = false;
        },

        updateCurrentCode: (state, action: PayloadAction<string>) => {
            state.currentCode = action.payload;
        },

        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },

        setTheme: (state, action: PayloadAction<string>) => {
            state.theme = action.payload;
        },

        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },

        addConnectedUser: (state, action: PayloadAction<string>) => {
            if (!state.connectedUsers.includes(action.payload)) {
                state.connectedUsers.push(action.payload);
            }
        },

        removeConnectedUser: (state, action: PayloadAction<string>) => {
            state.connectedUsers = state.connectedUsers.filter(id => id !== action.payload);
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setActiveRoom,
    clearActiveRoom,
    updateCurrentCode,
    setLanguage,
    setTheme,
    setConnectionStatus,
    addConnectedUser,
    removeConnectedUser,
    setError,
} = codingRoomsSlice.actions;

export default codingRoomsSlice.reducer;
