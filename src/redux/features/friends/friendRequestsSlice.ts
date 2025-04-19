// src/redux/features/friends/friendRequestsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FriendRequest } from '../../../types/friendRequest';
import { User } from '../../../types/user';
import { RootState } from '../../store';

export interface FriendRequestsState {
  friendRequests: FriendRequest[];
  friends: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FriendRequestsState = {
  friendRequests: [],
  friends: [],
  isLoading: false,
  error: null,
};

const friendRequestsSlice = createSlice({
  name: 'friendRequests',
  initialState,
  reducers: {
    setFriendRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.friendRequests = action.payload;
    },
    setFriends: (state, action: PayloadAction<User[]>) => {
      state.friends = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setFriendRequests, setFriends, setLoading, setError } = friendRequestsSlice.actions;

export const selectFriendRequests = (state: RootState) => state.friendRequests.friendRequests;
export const selectFriends = (state: RootState) => state.friendRequests.friends;
export const selectLoading = (state: RootState) => state.friendRequests.isLoading;
export const selectError = (state: RootState) => state.friendRequests.error;

export default friendRequestsSlice.reducer;