import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  addMessage,
  updateMessage,
  removeMessage,
} from '../redux/features/messaging/channelsSlice';
import { Message } from '../types/channel';

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

    // Re-connect event when socket reconnects
    this.socket.on('connect', () => {
      console.log('Socket reconnected, rejoining channels...');
      this.rejoinChannels();
    });

    this.socket.on('newMessage', (message: any) => {
      console.log('🟢 New message received via socket:', message);

      // Additional logging for attachments
      if (message.attachment) {
        console.log('📎 Message contains attachment:', {
          isPending: message.attachment.isPending,
          filename: message.attachment.filename,
          originalname: message.attachment.originalname,
          channelId:
            typeof message.channel === 'string'
              ? message.channel
              : message.channel?._id,
        });
      }

      // Normalize message structure if needed
      if (!message._id && message.id) {
        message._id = message.id;
      }

      // For messages with pendingAttachment flag, we need special handling
      if (message.pendingAttachment) {
        console.log('📎 Message with pending attachment received:', message);

        // This will add it to the store with the isPending=true flag in the attachment
        store.dispatch(addMessage(message));
        return;
      }

      // Check for duplicate messages
      // If this is a clientMessageId we've seen before, it might be an update to a pending attachment
      if (message.clientMessageId) {
        // Get existing messages from store to check
        const state = store.getState();
        const existingMessages = state.channels.messages;

        // Look for a message with matching clientMessageId
        const pendingMessage = existingMessages.find(
          (msg) => msg.clientMessageId === message.clientMessageId
        );

        if (pendingMessage?.attachment?.isPending) {
          console.log('📎 Updating pending attachment with real one:', message);
          store.dispatch(updateMessage(message));
          return;
        }
      }

      // Check if this message has already been processed by ID
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

    this.socket.on(
      'messageDeleted',
      (data: { messageId: string; channelId: string; userId: string }) => {
        console.log('🗑️ Message deleted event received:', data);

        // Force removal from Redux store to ensure real-time updates
        const state = store.getState();
        const messageExists = state.channels.messages.some(
          (msg) => msg._id === data.messageId
        );

        if (messageExists) {
          console.log(
            `Removing message ${data.messageId} from store (deleted by user ${data.userId})`
          );
          store.dispatch(removeMessage(data.messageId));

          // Show a toast notification for better UX if someone else deleted the message
          const currentUserId = state.auth?.user?._id;
          if (data.userId !== currentUserId) {
            // Optional: Show notification when someone else deletes a message
            const event = new CustomEvent('messageDeletedByOther', {
              detail: { messageId: data.messageId },
            });
            document.dispatchEvent(event);
          }
        } else {
          console.warn(
            `Message ${data.messageId} not found in store for deletion`
          );
        }

        // Remove from processed IDs set in case it's resent later
        if (this.processedMessageIds.has(data.messageId)) {
          this.processedMessageIds.delete(data.messageId);
        }
      }
    );

    this.socket.on(
      'reactionAdded',
      (data: {
        messageId: string;
        emoji: string;
        userId: string;
        reactions: Record<string, string[]>;
      }) => {
        console.log('📢 Reaction added:', data);

        // Update the message in the store with the new reactions
        const state = store.getState();
        const messageIndex = state.channels.messages.findIndex(
          (msg) => msg._id === data.messageId
        );

        if (messageIndex !== -1) {
          const message = state.channels.messages[messageIndex];

          // Create a new message object with the updated reactions
          const updatedMessage = {
            ...message,
            reactions: data.reactions,
          };

          console.log('Updating message with new reactions:', {
            messageId: data.messageId,
            emoji: data.emoji,
            userId: data.userId,
            reactionCount: Object.keys(data.reactions || {}).length,
          });

          // Update the message in the store
          store.dispatch(updateMessage(updatedMessage));
        } else {
          console.log(
            'Message not found in store for reaction update:',
            data.messageId
          );
        }
      }
    );

    this.socket.on(
      'reactionRemoved',
      (data: {
        messageId: string;
        emoji: string;
        userId: string;
        reactions: Record<string, string[]>;
      }) => {
        console.log('🗑️ Reaction removed:', data);

        // Update the message in the store with the updated reactions
        const state = store.getState();
        const messageIndex = state.channels.messages.findIndex(
          (msg) => msg._id === data.messageId
        );

        if (messageIndex !== -1) {
          const message = state.channels.messages[messageIndex];

          // Create a new message object with the updated reactions
          const updatedMessage = {
            ...message,
            reactions: data.reactions || {},
          };

          console.log('Updating message after reaction removal:', {
            messageId: data.messageId,
            emoji: data.emoji,
            userId: data.userId,
            reactionCount: Object.keys(data.reactions || {}).length,
          });

          // Update the message in the store
          store.dispatch(updateMessage(updatedMessage));
        } else {
          console.log(
            'Message not found in store for reaction removal:',
            data.messageId
          );
        }
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
      (data: {
        channelId: string;
        userId: string;
        user?: { _id: string; name: string };
      }) => {
        console.log('User joined channel:', data);
        const event = new CustomEvent('userJoinedChannel', {
          detail: {
            channelId: data.channelId,
            user: data.user || { _id: data.userId, name: data.userId }, // Use the user object if available
          },
        });
        document.dispatchEvent(event);
      }
    );

    this.socket.on(
      'userLeftChannel',
      (data: {
        channelId: string;
        userId: string;
        user?: { _id: string; name: string };
      }) => {
        console.log('User left channel:', data);
        const event = new CustomEvent('userLeftChannel', {
          detail: {
            channelId: data.channelId,
            user: data.user || { _id: data.userId, name: data.userId }, // Use the user object if available
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

    // Listen for errors and connection issues
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Keep socket connection alive with ping/pong
    setInterval(() => {
      if (this.socket && this.connected) {
        this.socket.emit('ping', null, (response: any) => {
          if (response) {
            console.log('Socket connection is still alive');
          }
        });
      }
    }, 30000); // Every 30 seconds

    // Add messageReplied event handler
    this.socket.on(
      'messageReplied',
      (data: { parentMessageId: string; reply: any; replyCount: number }) => {
        console.log('💬 Message replied event received:', data);

        // First, make sure the reply message is in the store
        if (data.reply && data.reply._id) {
          // Check if we already have this reply
          const state = store.getState();
          const replyExists = state.channels.messages.some(
            (msg) => msg._id === data.reply._id
          );

          if (!replyExists) {
            // Add the reply to the store if it's not already there
            store.dispatch(addMessage(data.reply));
          }
        }

        // Update the parent message with new reply count
        const state = store.getState();
        const parentMessage = state.channels.messages.find(
          (msg) => msg._id === data.parentMessageId
        );

        if (parentMessage) {
          // Update the reply count on the parent message
          const updatedParentMessage = {
            ...parentMessage,
            replyCount: data.replyCount,
          };

          store.dispatch(updateMessage(updatedParentMessage));

          // Dispatch custom event for UI components to react to
          const event = new CustomEvent('messageReplied', {
            detail: {
              parentMessageId: data.parentMessageId,
              reply: data.reply,
              replyCount: data.replyCount,
            },
          });
          document.dispatchEvent(event);
        }
      }
    );
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
    clientMessageId?: string;
  }) {
    try {
      // Generate a client message ID if not provided
      const clientMessageId =
        message.clientMessageId ||
        `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Clone and clean up the message object to prevent issues with null values
      const cleanedMessage: {
        channelId: string;
        content: string;
        clientMessageId: string;
        attachment?: {
          originalname: string;
          mimetype: string;
          size: number;
          isPending: boolean;
        };
        pendingAttachment?: boolean;
      } = {
        channelId: message.channelId,
        content: message.content,
        clientMessageId, // Include the client message ID
      };

      // For attachments, we only send metadata over socket to avoid binary data transfer problems
      if (message.attachment) {
        console.log(
          'Preparing attachment metadata for',
          message.attachment.name
        );

        // Send attachment metadata via socket for real-time awareness
        cleanedMessage.attachment = {
          originalname: message.attachment.name,
          mimetype: message.attachment.type,
          size: message.attachment.size,
          isPending: true, // Mark as pending since we'll upload separately via API
        };

        // Tell the server this has a pending attachment
        cleanedMessage.pendingAttachment = true;
      }

      console.log(
        'Sending message via socket with clientMessageId:',
        clientMessageId,
        cleanedMessage
      );
      this.socket?.emit('sendMessage', cleanedMessage, (response: any) => {
        console.log('Message send response:', response);
      });

      return clientMessageId; // Return the clientMessageId for reference
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
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
      console.log(
        `Adding reaction ${emoji} to message ${messageId} in channel ${channelId}`
      );

      // Optimistically update UI for better user experience
      const state = store.getState();
      const message = state.channels.messages.find(
        (msg) => msg._id === messageId
      );

      if (message) {
        // Create a copy of the current reactions or an empty object
        const currentReactions = message.reactions || {};
        const userId = state.auth.user?._id;

        if (userId) {
          // Clone and update the reactions for this emoji
          const updatedReactions = { ...currentReactions };
          const users = updatedReactions[emoji] || [];

          // Only add if not already present
          if (!users.includes(userId)) {
            updatedReactions[emoji] = [...users, userId];

            // Update the message in the store
            store.dispatch(
              updateMessage({
                ...message,
                reactions: updatedReactions,
              })
            );
          }
        }
      }

      // Send to server
      this.socket?.emit(
        'addReaction',
        { messageId, channelId, emoji },
        (response: any) => {
          console.log('Add reaction response:', response);

          // If server returned updated reactions, update again with authoritative data
          if (response?.success && response?.reactions) {
            const state = store.getState();
            const message = state.channels.messages.find(
              (msg) => msg._id === messageId
            );

            if (message) {
              store.dispatch(
                updateMessage({
                  ...message,
                  reactions: response.reactions,
                })
              );
            }
          }
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
      console.log(
        `Removing reaction ${emoji} from message ${messageId} in channel ${channelId}`
      );

      // Optimistically update UI for better user experience
      const state = store.getState();
      const message = state.channels.messages.find(
        (msg) => msg._id === messageId
      );
      const userId = state.auth.user?._id;

      if (message && userId && message.reactions) {
        // Clone and update the reactions
        const updatedReactions = { ...message.reactions };

        if (updatedReactions[emoji]) {
          // Remove the user from this emoji's reactions
          updatedReactions[emoji] = updatedReactions[emoji].filter(
            (id) => id !== userId
          );

          // If no users left for this emoji, remove the emoji entry
          if (updatedReactions[emoji].length === 0) {
            delete updatedReactions[emoji];
          }

          // Update the message in the store
          store.dispatch(
            updateMessage({
              ...message,
              reactions: updatedReactions,
            })
          );
        }
      }

      // Send to server
      this.socket?.emit(
        'removeReaction',
        { messageId, channelId, emoji },
        (response: any) => {
          console.log('Remove reaction response:', response);

          // If server returned updated reactions, update again with authoritative data
          if (response?.success && response?.reactions) {
            const state = store.getState();
            const message = state.channels.messages.find(
              (msg) => msg._id === messageId
            );

            if (message) {
              store.dispatch(
                updateMessage({
                  ...message,
                  reactions: response.reactions,
                })
              );
            }
          }
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
      console.log(`🗑️ Deleting message ${messageId} from channel ${channelId}`);

      // Optimistically remove from local store immediately for better UX
      const state = store.getState();
      const messageExists = state.channels.messages.some(
        (msg) => msg._id === messageId
      );

      if (messageExists) {
        console.log(
          `Optimistically removing message ${messageId} from local store`
        );
        store.dispatch(removeMessage(messageId));
      }

      // Send deletion request via socket with fallback to REST API
      this.socket?.emit(
        'deleteMessage',
        { messageId, channelId, channel: channelId }, // Include both channelId and channel for compatibility
        async (response: any) => {
          if (response?.success) {
            console.log('Delete message response:', response);
          } else {
            console.log(
              'Socket deletion failed, falling back to REST API:',
              response?.error || 'Unknown error'
            );

            try {
              // Get base URL from environment or use default
              const baseUrl =
                import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const token = localStorage.getItem('token') || state.auth.token;

              // Make REST API call as fallback
              const restResponse = await fetch(
                `${baseUrl}/messaging/messages/${messageId}/delete`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (restResponse.ok) {
                console.log(
                  'Message successfully deleted via REST API fallback'
                );
              } else {
                console.error(
                  'REST API fallback also failed:',
                  await restResponse.text()
                );
                // Could potentially restore the message in the UI here
              }
            } catch (error) {
              console.error('Error in REST API fallback:', error);
            }
          }
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

  // Send a reply to a message
  async sendReply(reply: {
    channelId: string;
    content: string;
    parentMessageId: string;
    parentMessagePreview?: {
      content: string;
      sender: string;
      senderName: string;
    };
    attachment?: File | null;
    clientMessageId?: string;
  }) {
    try {
      // Generate a client message ID if not provided
      const clientMessageId =
        reply.clientMessageId ||
        `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Clone and clean up the message object
      const cleanedReply: any = {
        channelId: reply.channelId,
        content: reply.content,
        clientMessageId,
        isReply: true,
        parentMessageId: reply.parentMessageId,
      };

      // Add parent message preview if provided
      if (reply.parentMessagePreview) {
        cleanedReply.replyPreview = reply.parentMessagePreview;
      }

      // Handle attachment like normal message
      if (reply.attachment) {
        console.log(
          'Preparing attachment metadata for reply',
          reply.attachment.name
        );

        // Send attachment metadata via socket for real-time awareness
        cleanedReply.attachment = {
          originalname: reply.attachment.name,
          mimetype: reply.attachment.type,
          size: reply.attachment.size,
          isPending: true,
        };

        // Tell the server this has a pending attachment
        cleanedReply.pendingAttachment = true;
      }

      console.log(
        'Sending reply via socket with clientMessageId:',
        clientMessageId,
        cleanedReply
      );

      this.socket?.emit('sendMessage', cleanedReply, (response: any) => {
        console.log('Reply send response:', response);
      });

      return clientMessageId;
    } catch (error) {
      console.error('Failed to send reply:', error);
      throw error;
    }
  }

  // Get replies for a message
  async getMessageReplies(
    messageId: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        this.socket?.emit(
          'getMessageReplies',
          { messageId, page, limit },
          (response: any) => {
            console.log('Get message replies response:', response);
            if (response.success) {
              resolve(response);
            } else {
              reject(
                new Error(response.error || 'Failed to get message replies')
              );
            }
          }
        );
      });
    } catch (error) {
      console.error('Failed to get message replies:', error);
      throw error;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
