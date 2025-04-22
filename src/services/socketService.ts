// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '@/redux/store';
import { setFriendRequests, setFriends } from '@/redux/features/friends/friendRequestsSlice';

class SocketService {
   socket: Socket | null = null;

   isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
  connect(token: string) {
    this.socket = io('http://localhost:5000', {
      auth: {
        token
      }
    });

    this.setupListeners();
  }

  listenForPrivateMessages(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('newPrivateMessage', callback);
    }
  }

  stopListeningForPrivateMessages() {
    if (this.socket) {
      this.socket.off('newPrivateMessage');
    }
  }

  sendPrivateMessage(recipientId: string, content: string) {
    if (this.socket) {
      this.socket.emit('privateMessage', {
        recipientId,
        content
      });
    }
  }

  setupListeners() {
    if (!this.socket) return;

    // Existing friend request events
this.socket.on('friendRequest:new', (request) => {
  const currentRequests = store.getState().friendRequests.friendRequests;
  store.dispatch(setFriendRequests([...currentRequests, request]));
});

this.socket.on('friendRequest:accepted', (data) => {
  const currentRequests = store.getState().friendRequests.friendRequests;
  const currentFriends = store.getState().friendRequests.friends;
  
  store.dispatch(setFriendRequests(
    currentRequests.filter(req => req._id !== data.requestId)
  ));
  // Make sure the new friend is properly added to the list
  if (data.newFriend && !currentFriends.find(f => f._id === data.newFriend._id)) {
    store.dispatch(setFriends([...currentFriends, data.newFriend]));
  }
});

    this.socket.on('friendRequest:rejected', (requestId) => {
      const currentRequests = store.getState().friendRequests.friendRequests;
      store.dispatch(setFriendRequests(
        currentRequests.filter(req => req._id !== requestId)
      ));
    });

    // Add private message listener to setupListeners if you want global handling
    this.socket.on('newPrivateMessage', (message) => {
      console.log('New private message received:', message);
      // Handle the message globally if needed
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  // In your socketService
// In your socketService
emitMessageDeleted(messageId: string) {
  if (this.socket) {
    this.socket.emit('messageDeleted', messageId);
  }
}

emitMessageEdited(message: any) {
  if (this.socket) {
    this.socket.emit('messageEdited', message);
  }
}

listenForMessageDeleted(callback: (messageId: string) => void) {
  if (this.socket) {
    this.socket.on('messageDeleted', callback);
  }
}

listenForMessageEdited(callback: (message: any) => void) {
  if (this.socket) {
    this.socket.on('messageEdited', callback);
  }
}

stopListeningForMessageDeleted() {
  if (this.socket) {
    this.socket.off('messageDeleted');
  }
}

stopListeningForMessageEdited() {
  if (this.socket) {
    this.socket.off('messageEdited');
  }
}

}

export const socketService = new SocketService();