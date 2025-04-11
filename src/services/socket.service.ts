import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  addMessage,
  updateMessage,
  removeMessage,
} from '../redux/features/messaging/channelsSlice';
import { Message, Channel } from '../types/channel';

class SocketService {
  private socket: Socket | null = null;
  private connected = false;
  private messageCallbacks: Map<string, ((message: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private activeChannels: Set<string> = new Set();
  private processedMessageIds: Set<string> = new Set();
  private channelOperationTimestamps: Map<string, number> = new Map();
  private channelOperationThrottle = 2000;

  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Connect to the socket server
  async connect() {
    if (this.connected && this.socket) {
      return;
    }

    try {
      // Try to get token from localStorage first
      let token = localStorage.getItem('token');

      // If no token in localStorage, check Redux store
      if (!token) {
        const state = store.getState();
        token = state.auth.token;

        // If token found in Redux, save it to localStorage for future use
        if (token) {
          localStorage.setItem('token', token);
        }
      }

      if (!token) {
        console.error('No token found, cannot connect to socket');
        return;
      }

      console.log('Attempting to connect to socket server...');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Connect to the /messaging namespace as specified in the backend
      this.socket = io(`${baseUrl}/messaging`, {
        transports: ['websocket', 'polling'],
        auth: {
          token,
        },
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Set up event listeners
      this.socket.on('connect', () => {
        console.log(
          `Successfully connected to socket server with ID: ${this.socket?.id}`
        );
        this.connected = true;
        this.reconnectAttempts = 0;
        this.setupEventListeners();

        // Rejoin active channels after reconnect
        this.rejoinChannels();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.handleReconnect();
      });

      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        console.log(`Disconnected from socket server: ${reason}`);
        this.handleReconnect();
      });
    } catch (error) {
      console.error('Error setting up socket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    this.connected = false;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(
        `Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection.`
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) after ${delay}ms...`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private rejoinChannels() {
    // Rejoin all active channels after reconnection
    this.activeChannels.forEach((channelId) => {
      console.log(`Rejoining channel after reconnect: ${channelId}`);
      this.joinChannel(channelId);
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    console.log('Setting up socket event listeners');

    // Debug all incoming events
    this.socket.onAny((event, ...args) => {
      console.log(`Socket event received: ${event}`, args);
    });

    this.socket.on('newMessage', (message: any) => {
      console.log('🟢 New message received via socket:', message);

      // Normalize message structure if needed
      if (!message._id && message.id) {
        message._id = message.id;
      }

      // Check if this message has already been processed
      if (this.processedMessageIds.has(message._id)) {
        console.log(`🔄 Duplicate message detected, skipping: ${message._id}`);
        return;
      }

      // Track this message ID
      this.processedMessageIds.add(message._id);

      // Keep the processed message IDs set from growing too large
      if (this.processedMessageIds.size > 1000) {
        // If the set gets too large, keep only the 500 most recent IDs
        const idsArray = Array.from(this.processedMessageIds);
        this.processedMessageIds = new Set(idsArray.slice(-500));
      }

      // Add message to Redux store
      store.dispatch(addMessage(message));

      // Notify channel-specific callbacks
      const channelId =
        typeof message.channel === 'string'
          ? message.channel
          : message.channel?._id;
      if (channelId) {
        this.messageCallbacks.get(channelId)?.forEach((cb) => cb(message));
      }
    });

    this.socket.on('messageDeleted', (data: { messageId: string }) => {
      console.log('Message deleted:', data.messageId);
      store.dispatch(removeMessage(data.messageId));
    });

    this.socket.on(
      'reactionAdded',
      (data: { messageId: string; emoji: string; userId: string }) => {
        console.log('Reaction added:', data);
        // You'll need to handle reaction updates in your store
      }
    );

    this.socket.on(
      'reactionRemoved',
      (data: { messageId: string; emoji: string; userId: string }) => {
        console.log('Reaction removed:', data);
        // You'll need to handle reaction updates in your store
      }
    );

    this.socket.on(
      'userTyping',
      (data: { userId: string; channelId: string }) => {
        console.log('🔵 User typing event received:', data);
        const event = new CustomEvent('userTyping', { detail: data });
        document.dispatchEvent(event);
      }
    );

    this.socket.on(
      'userStoppedTyping',
      (data: { userId: string; channelId: string }) => {
        console.log('User stopped typing event received:', data);
        const event = new CustomEvent('userStoppedTyping', { detail: data });
        document.dispatchEvent(event);
      }
    );

    this.socket.on(
      'userJoinedChannel',
      (data: { channelId: string; userId: string }) => {
        console.log('User joined channel:', data);
        const event = new CustomEvent('userJoinedChannel', {
          detail: {
            channelId: data.channelId,
            user: { _id: data.userId, name: 'User' }, // You might want to fetch user details here
          },
        });
        document.dispatchEvent(event);
      }
    );

    this.socket.on(
      'userLeftChannel',
      (data: { channelId: string; userId: string }) => {
        console.log('User left channel:', data);
        const event = new CustomEvent('userLeftChannel', {
          detail: {
            channelId: data.channelId,
            user: { _id: data.userId, name: 'User' }, // You might want to fetch user details here
          },
        });
        document.dispatchEvent(event);
      }
    );

    this.socket.on('serverStatus', (data: any) => {
      console.log('Server status update:', data);
    });

    this.socket.on('diagnostics', (data: any) => {
      console.log('Server diagnostics:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      this.activeChannels.clear();
    }
  }

  async joinChannel(channelId: string) {
    try {
      await this.connect();

      // If already in this channel, don't join again
      if (this.activeChannels.has(channelId)) {
        console.log(
          `Already in channel: ${channelId}, skipping join operation`
        );
        return;
      }

      // Check if we've recently performed an operation on this channel
      const lastOperationTime =
        this.channelOperationTimestamps.get(channelId) || 0;
      const now = Date.now();

      if (now - lastOperationTime < this.channelOperationThrottle) {
        console.log(`Throttling join operation for channel: ${channelId}`);
        return;
      }

      // Update timestamp
      this.channelOperationTimestamps.set(channelId, now);

      console.log(
        `Joining channel: ${channelId} with socket ID: ${this.socket?.id}`
      );

      this.socket?.emit('joinChannel', { channelId }, (response: any) => {
        console.log('Join channel response:', response);
        if (response?.success) {
          this.activeChannels.add(channelId);
        }
      });
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  }

  async leaveChannel(channelId: string) {
    try {
      // If not connected or not in this channel, skip leaving
      if (
        !this.socket ||
        !this.connected ||
        !this.activeChannels.has(channelId)
      ) {
        console.log(
          `Not in channel: ${channelId} or not connected, skipping leave operation`
        );
        // Clean up the activeChannels set just in case
        this.activeChannels.delete(channelId);
        return;
      }

      // Check if we've recently performed an operation on this channel
      const lastOperationTime =
        this.channelOperationTimestamps.get(channelId) || 0;
      const now = Date.now();

      if (now - lastOperationTime < this.channelOperationThrottle) {
        console.log(`Throttling leave operation for channel: ${channelId}`);
        return;
      }

      // Update timestamp
      this.channelOperationTimestamps.set(channelId, now);

      console.log('Leaving channel:', channelId);
      this.socket.emit('leaveChannel', { channelId }, (response: any) => {
        console.log('Leave channel response:', response);
        this.activeChannels.delete(channelId);
      });
    } catch (error) {
      console.error('Failed to leave channel:', error);
      // Clean up the set even if the operation fails
      this.activeChannels.delete(channelId);
    }
  }

  async sendMessage(message: {
    channelId: string;
    content: string;
    attachment?: File | null;
  }) {
    try {
      // Clone and clean up the message object to prevent issues with null values
      const cleanedMessage = {
        channelId: message.channelId,
        content: message.content,
        attachment: message.attachment || undefined, // Convert null to undefined
      };

      this.socket?.emit('sendMessage', cleanedMessage, (response: any) => {
        console.log('Message send response:', response);
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  async emitTyping(channelId: string) {
    try {
      await this.connect();
      console.log('Emitting typing event for channel:', channelId);
      this.socket?.emit('typing', { channelId });
    } catch (error) {
      console.error('Failed to emit typing:', error);
    }
  }

  async emitStopTyping(channelId: string) {
    try {
      await this.connect();
      console.log('Emitting stop typing event for channel:', channelId);
      this.socket?.emit('stopTyping', { channelId });
    } catch (error) {
      console.error('Failed to emit stop typing:', error);
    }
  }

  // Listen for messages in a specific channel
  listenForChannelMessages(
    channelId: string,
    callback: (message: any) => void
  ) {
    if (!this.messageCallbacks.has(channelId)) {
      this.messageCallbacks.set(channelId, []);
    }
    this.messageCallbacks.get(channelId)?.push(callback);
  }

  // Stop listening for channel messages
  stopListeningForChannelMessages(channelId: string) {
    this.messageCallbacks.delete(channelId);
  }

  // Add reaction to a message
  async addReaction(messageId: string, channelId: string, emoji: string) {
    try {
      await this.connect();
      this.socket?.emit(
        'addReaction',
        { messageId, channelId, emoji },
        (response: any) => {
          console.log('Add reaction response:', response);
        }
      );
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }

  // Remove reaction from a message
  async removeReaction(messageId: string, channelId: string, emoji: string) {
    try {
      await this.connect();
      this.socket?.emit(
        'removeReaction',
        { messageId, channelId, emoji },
        (response: any) => {
          console.log('Remove reaction response:', response);
        }
      );
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  }

  // Delete a message
  async deleteMessage(messageId: string, channelId: string) {
    try {
      await this.connect();
      this.socket?.emit(
        'deleteMessage',
        { messageId, channelId },
        (response: any) => {
          console.log('Delete message response:', response);
        }
      );
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }

  // Get all channels
  async getChannels(page: number = 1, limit: number = 20) {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        this.socket?.emit('getChannels', { page, limit }, (response: any) => {
          console.log('Get channels response:', response);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Failed to get channels'));
          }
        });
      });
    } catch (error) {
      console.error('Failed to get channels:', error);
      throw error;
    }
  }

  // Trigger a system message (join/leave/etc)
  async triggerSystemMessage(
    action: 'join' | 'leave',
    channelId: string,
    user: { _id: string; name: string }
  ) {
    try {
      await this.connect();
      console.log(
        `Emitting system message (${action}) for channel:`,
        channelId
      );
      this.socket?.emit(
        'systemMessage',
        {
          action,
          channelId,
          user,
        },
        (response: any) => {
          console.log(`System message (${action}) response:`, response);
        }
      );
    } catch (error) {
      console.error(`Failed to emit system message (${action}):`, error);
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const socketService = new SocketService();
export default socketService;
