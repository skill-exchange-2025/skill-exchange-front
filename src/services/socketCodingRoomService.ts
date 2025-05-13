// src/services/socketCodingRoomService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '@/redux/store';
import { 
    updateCurrentCode, 
    setLanguage, 
    setTheme, 
    setError, 
    setConnectionStatus, 
    addConnectedUser, 
    removeConnectedUser 
} from '@/redux/features/codingRoom/codingRoomsSlice';

class SocketCodingRoomService {
    private socket: Socket | null = null;
    private isConnecting: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 10;
    private reconnectInterval: number = 1000;
    private lastCodeUpdate: string | null = null;
    private codeUpdateTimeout: NodeJS.Timeout | null = null;
    private connectionTimeout: NodeJS.Timeout | null = null;
    private pingInterval: NodeJS.Timeout | null = null;
    private shouldReconnect = true;

    constructor() {
        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            store.dispatch(setConnectionStatus(true));
            this.clearConnectionTimeout();
            this.startPingInterval();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnecting = false;
            store.dispatch(setError(error.message));
            store.dispatch(setConnectionStatus(false));
            this.clearConnectionTimeout();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.clearPingInterval();
            store.dispatch(setConnectionStatus(false));
            
            if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                setTimeout(() => this.connect(), this.reconnectInterval);
            }
        });

        this.socket.on('initialCode', (data: { code: string }) => {
            console.log('Received initial code from server');
            store.dispatch(updateCurrentCode(data.code));
        });

        this.socket.on('codeUpdated', (data: { code: string }) => {
            console.log('Received code update from server');
            if (data.code !== this.lastCodeUpdate) {
                store.dispatch(updateCurrentCode(data.code));
            }
        });

        this.socket.on('languageChanged', (language: string) => {
            store.dispatch(setLanguage(language));
        });

        this.socket.on('themeChanged', (theme: string) => {
            store.dispatch(setTheme(theme));
        });

        this.socket.on('userJoined', (userId: string) => {
            store.dispatch(addConnectedUser(userId));
            console.log(`User joined: ${userId}`);
        });

        this.socket.on('userLeft', (userId: string) => {
            store.dispatch(removeConnectedUser(userId));
            console.log(`User left: ${userId}`);
        });
    }

    private startPingInterval() {
        this.clearPingInterval();
        this.pingInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.socket.emit('ping');
            }
        }, 20000);
    }

    private clearPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    private clearConnectionTimeout() {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
    }

    connect() {
        if (this.isConnecting || this.socket?.connected) return;

        this.isConnecting = true;
        this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectInterval,
            timeout: 10000,
            transports: ['websocket', 'polling'],
            closeOnBeforeunload: false
        });

        this.setupSocketListeners();

        this.connectionTimeout = setTimeout(() => {
            if (this.isConnecting) {
                this.isConnecting = false;
                store.dispatch(setError('Connection timeout'));
                store.dispatch(setConnectionStatus(false));
                this.clearConnectionTimeout();
            }
        }, 10000);
    }

    disconnect() {
        this.shouldReconnect = false;
        this.clearPingInterval();
        this.clearConnectionTimeout();
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        store.dispatch(setConnectionStatus(false));
    }

    joinRoom(roomId: string, token: string) {
        if (!this.socket) return;

        this.socket.auth = { token };
        this.socket.io.opts.extraHeaders = { Authorization: `Bearer ${token}` };
        this.socket.emit('joinRoom', roomId);
    }

    leaveRoom(roomId: string) {
        if (!this.socket) return;
        this.socket.emit('leaveRoom', roomId);
    }

    public sendCodeChange(code: string, language: string): void {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }

        this.lastCodeUpdate = code;

        if (this.codeUpdateTimeout) {
            clearTimeout(this.codeUpdateTimeout);
        }

        this.codeUpdateTimeout = setTimeout(() => {
            if (this.socket && this.lastCodeUpdate === code) {
                console.log('Sending code update to server:', code.substring(0, 50) + '...');
                this.socket.emit('codeChange', { code, language });
            }
        }, 300);
    }

    sendLanguageUpdate(language: string) {
        if (!this.socket) return;
        this.socket.emit('languageUpdate', language);
    }

    sendThemeUpdate(theme: string) {
        if (!this.socket) return;
        this.socket.emit('themeUpdate', theme);
    }
}

export const socketCodingRoomService = new SocketCodingRoomService();




