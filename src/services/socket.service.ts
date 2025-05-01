import {io, Socket} from 'socket.io-client';
import {store} from '../redux/store';
import {
    addMessage,
    removeMessage,
    setChannels,
    updateChannel,
    updateMessage,
} from '../redux/features/messaging/channelsSlice';
import {Message} from '../types/channel';

class SocketService {
  private socket: Socket | null = null;
  private connected = false;

  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.connected) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.socket = io(`${baseUrl}/api/messaging`, {
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to messaging socket server');

      // Fetch channels via socket
      this.getChannels();

      // Get current channel from store and rejoin if needed
      const state = store.getState();
      const currentChannel = state.channels.currentChannel;
      if (currentChannel) {
        this.joinChannel(currentChannel._id);
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from messaging socket server');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    this.socket.on('reconnect', (attempt: number) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
      this.connected = true;

      // Get current channel from store and rejoin if needed
      const state = store.getState();
      const currentChannel = state.channels.currentChannel;
      if (currentChannel) {
        this.joinChannel(currentChannel._id);
      }
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('Socket reconnection error:', error);
    });

    // Listen for new messages
    this.socket.on('newMessage', (message: Message) => {
      store.dispatch(addMessage(message));
    });

    // Listen for updated messages (reactions, etc.)
    this.socket.on('messageUpdate', (message: Message) => {
      store.dispatch(updateMessage(message));
    });

    // Listen for deleted messages
    this.socket.on('messageDeleted', (data: { messageId: string }) => {
      store.dispatch(removeMessage(data.messageId));
    });

    // Listen for reaction events
    this.socket.on(
      'reactionAdded',
      (data: { messageId: string; emoji: string; userId: string }) => {
        // Update the message with the new reaction if it's in the store
        const state = store.getState();
        const message = state.channels.messages.find(
          (msg) => msg._id === data.messageId
        );

        if (message) {
          const updatedMessage = { ...message };

          // Initialize reactions if needed
          if (!updatedMessage.reactions) {
            updatedMessage.reactions = {};
          }

          // Initialize emoji array if needed
          if (!updatedMessage.reactions[data.emoji]) {
            updatedMessage.reactions[data.emoji] = [];
          }

          // Add user to the reaction if not already present
          if (!updatedMessage.reactions[data.emoji].includes(data.userId)) {
            updatedMessage.reactions[data.emoji] = [
              ...updatedMessage.reactions[data.emoji],
              data.userId,
            ];
          }

          store.dispatch(updateMessage(updatedMessage));
        }
      }
    );

    this.socket.on(
      'reactionRemoved',
      (data: { messageId: string; emoji: string; userId: string }) => {
        // Update the message with the removed reaction if it's in the store
        const state = store.getState();
        const message = state.channels.messages.find(
          (msg) => msg._id === data.messageId
        );

        if (message) {
          const updatedMessage = { ...message };

          // Skip if there are no reactions or the emoji doesn't exist
          if (
            !updatedMessage.reactions ||
            !updatedMessage.reactions[data.emoji]
          ) {
            return;
          }

          // Remove user from the reaction list
          updatedMessage.reactions[data.emoji] = updatedMessage.reactions[
            data.emoji
          ].filter((userId) => userId !== data.userId);

          // Remove the emoji entry if no users left
          if (updatedMessage.reactions[data.emoji].length === 0) {
            delete updatedMessage.reactions[data.emoji];
          }

          store.dispatch(updateMessage(updatedMessage));
        }
      }
    );

    // Listen for user joining/leaving channels
    this.socket.on(
      'userJoinedChannel',
      (data: {
        channelId: string;
        user: { _id: string; name: string; email?: string };
      }) => {
        // Update channel members if needed
        console.log('User joined channel:', data);
        // Update channel with new member in store if needed
        const state = store.getState();
        const channel = state.channels.channels.find(
          (c) => c._id === data.channelId
        );
        if (channel) {
          // Dispatch a channel update with the new member
          const updatedChannel = { ...channel };
          // Add user to members if not already there
          if (
            !updatedChannel.members.some((m) =>
              typeof m === 'string'
                ? m === data.user._id
                : m._id === data.user._id
            )
          ) {
            // Determine if we're using string[] or ChannelMember[]
            if (
              updatedChannel.members.length > 0 &&
              typeof updatedChannel.members[0] === 'string'
            ) {
              // If using string[], just add the ID
              (updatedChannel.members as string[]).push(data.user._id);
            } else {
              // If using ChannelMember[], add as ChannelMember
              (updatedChannel.members as any[]).push(data.user);
            }
            store.dispatch(updateChannel(updatedChannel));
          }
        }

        // Also trigger the DOM event for system message
        this.triggerSystemMessage('join', data.channelId, data.user);
      }
    );

    this.socket.on(
      'userLeftChannel',
      (data: {
        channelId: string;
        user: { _id: string; name: string; email?: string };
      }) => {
        // Update channel members if needed
        console.log('User left channel:', data);
        // Update channel members in store
        const state = store.getState();
        const channel = state.channels.channels.find(
          (c) => c._id === data.channelId
        );
        if (channel) {
          // Dispatch a channel update with the member removed
          const updatedChannel = { ...channel };
          updatedChannel.members = updatedChannel.members.filter((m) =>
            typeof m === 'string'
              ? m !== data.user._id
              : m._id !== data.user._id
          ) as any;
          store.dispatch(updateChannel(updatedChannel));
        }

        // Also trigger the DOM event for system message
        this.triggerSystemMessage('leave', data.channelId, data.user);
      }
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  joinChannel(channelId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('joinChannel', { channelId });
    }
  }

  leaveChannel(channelId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('leaveChannel', { channelId });
    }
  }

  sendMessage(message: {
    channelId: string;
    content: string;
    attachment?: File;
  }) {
    if (this.socket && this.connected) {
      this.socket.emit('sendMessage', message);
    }
  }

  addReaction(messageId: string, channelId: string, emoji: string) {
    if (this.socket && this.connected) {
      this.socket.emit('addReaction', { messageId, channelId, emoji });
    }
  }

  removeReaction(messageId: string, channelId: string, emoji: string) {
    if (this.socket && this.connected) {
      this.socket.emit('removeReaction', { messageId, channelId, emoji });
    }
  }

  deleteMessage(messageId: string, channelId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('deleteMessage', { messageId, channelId });
    }
  }

  typing(channelId: string, isTyping: boolean) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { channelId, isTyping });
    }
  }

  getChannels(page: number = 1, limit: number = 20) {
    if (this.socket && this.connected) {
      this.socket.emit('getChannels', { page, limit }, (response: any) => {
        if (response.success) {
          store.dispatch(setChannels(response.channels));
        }
      });
    }
  }

  isConnected() {
    return this.connected;
  }

  // Add event handlers for user joining/leaving the channel
  onUserJoinedChannel(
    callback: (data: { channelId: string; user: any }) => void
  ) {
    this.socket?.on('userJoinedChannel', callback);
    return () => {
      this.socket?.off('userJoinedChannel', callback);
    };
  }

  onUserLeftChannel(
    callback: (data: { channelId: string; user: any }) => void
  ) {
    this.socket?.on('userLeftChannel', callback);
    return () => {
      this.socket?.off('userLeftChannel', callback);
    };
  }

  // Directly trigger system messages (for testing)
  triggerSystemMessage(
    type: 'join' | 'leave',
    channelId: string,
    user: { _id: string; name: string }
  ) {
    const eventName = type === 'join' ? 'userJoinedChannel' : 'userLeftChannel';
    const event = new CustomEvent(eventName, {
      detail: {
        channelId,
        user,
      },
    });
    document.dispatchEvent(event);
    console.log(
      `Triggered ${type} system message for ${user.name} in channel ${channelId}`
    );
  }

  // Listen for messages in a specific channel
  listenForChannelMessages(
    channelId: string,
    callback: (message: any) => void
  ) {
    if (this.socket) {
      this.socket.on('newMessage', (message: any) => {
        if (message.channel === channelId) {
          callback(message);
        }
      });
    }
  }

  // Stop listening for channel messages
  stopListeningForChannelMessages() {
    if (this.socket) {
      this.socket.off('newMessage');
    }
  }
}

export const socketService = new SocketService();
export default socketService;
