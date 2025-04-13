// src/services/websocketService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
    updateCurrentCode,
    setLanguage,
    setTheme,
    addConnectedUser,
    removeConnectedUser,
    setConnectionStatus,
    setError,
} from '../redux/features/codingRoom/codingRoomsSlice';

class WebSocketService {
    private socket: Socket | null = null;
    private roomId: string | null = null;

    connect(token: string) {
        if (this.socket) {
            return;
        }

        this.socket = io('http://localhost:5000', {
            extraHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        this.socket.on('connect', () => {
            store.dispatch(setConnectionStatus(true));
            store.dispatch(setError(null));
        });

        this.socket.on('disconnect', () => {
            store.dispatch(setConnectionStatus(false));
        });

        this.socket.on('error', ({ message }) => {
            store.dispatch(setError(message));
        });

        this.setupSocketListeners();
    }

    disconnect() {
        if (this.socket) {
            if (this.roomId) {
                this.leaveRoom();
            }
            this.socket.disconnect();
            this.socket = null;
            store.dispatch(setConnectionStatus(false));
        }
    }

    joinRoom(roomId: string, userId: string) {
        if (!this.socket) {
            store.dispatch(setError('Socket not connected'));
            return;
        }

        this.roomId = roomId;
        this.socket.emit('joinRoom', { roomId, userId });
    }

    leaveRoom() {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            this.socket.emit('leaveRoom', { roomId: this.roomId, userId });
        }
        this.roomId = null;
    }

    sendCodeChange(code: string, language?: string) {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            this.socket.emit('codeChange', {
                roomId: this.roomId,
                userId,
                code,
                language
            });
        }
    }

    changeLanguage(language: string) {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            this.socket.emit('changeLanguage', {
                roomId: this.roomId,
                userId,
                language
            });
        }
    }

    changeTheme(theme: string) {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            this.socket.emit('changeTheme', {
                roomId: this.roomId,
                userId,
                theme
            });
        }
    }

    private setupSocketListeners() {
        if (!this.socket) {
            return;
        }

        this.socket.on('initialCode', ({ code, language, theme }) => {
            store.dispatch(updateCurrentCode(code || ''));

            if (language) {
                store.dispatch(setLanguage(language));
            }

            if (theme) {
                store.dispatch(setTheme(theme));
            }
        });

        this.socket.on('codeUpdated', ({ code, userId }) => {
            const currentUserId = store.getState().auth.user?._id;
            // Only update if the change came from someone else
            if (userId !== currentUserId) {
                store.dispatch(updateCurrentCode(code));
            }
        });

        this.socket.on('languageChanged', ({ language }) => {
            store.dispatch(setLanguage(language));
        });

        this.socket.on('themeChanged', ({ theme }) => {
            store.dispatch(setTheme(theme));
        });

        this.socket.on('userJoined', ({ userId }) => {
            store.dispatch(addConnectedUser(userId));
        });

        this.socket.on('userLeft', ({ userId }) => {
            store.dispatch(removeConnectedUser(userId));
        });
    }
}

export const socketService = new WebSocketService();

export default socketService;
