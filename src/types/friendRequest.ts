// src/types/friendRequest.ts

import { User } from './user';

export interface FriendRequest {
  _id: string;
  sender: User;
  recipient: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateFriendRequestDto {
  email: string;
}

export interface FriendRequestResponse {
  friendRequest: FriendRequest;
  message: string;
}