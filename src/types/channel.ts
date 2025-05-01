import {User} from './user';

export interface ChannelMember extends User {
  role?: string;
  joinedAt?: string;
  lastRead?: string;
}

export interface Channel {
  _id: string;
  name: string;
  topic: string;
  members: ChannelMember[] | string[];
  isArchived: boolean;
  isMember?: boolean;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UrlPreview {
  url: string;
  title: string;
  description: string;
  image: string | null;
}

export interface MessageAttachment {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface Message {
  _id: string;
  sender: User | string;
  channel: Channel | string;
  content: string;
  attachments: string[];
  attachment: MessageAttachment | null;
  reactions: Record<string, string[]>;
  hasUrlPreview: boolean;
  urlPreview: UrlPreview | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelDto {
  name: string;
  topic: string;
  members: string[];
}

export interface CreateMessageDto {
  channel: string;
  content: string;
  attachment?: MessageAttachment;
}

export interface ChannelMessagesResponse {
  messages: Message[];
  total: number;
}

export interface AddReactionDto {
  emoji: string;
}

export interface ChannelsState {
  channels: Channel[];
  currentChannel: Channel | null;
  messages: Message[];
  isLoadingChannels: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
  lastSelectedChannelId: string | null;
}
