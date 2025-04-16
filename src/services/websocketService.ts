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
    private authToken: string | null = null;
    private isConnecting: boolean = false;
    private isDisconnecting: boolean = false;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private pingInterval: NodeJS.Timeout | null = null;
    private url = 'http://localhost:5000';
    private shouldReconnect: boolean = true;
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 10;
    private connectionTimeout: NodeJS.Timeout | null = null;

    connect(token: string) {
        // Prevent multiple simultaneous connection attempts
        if (this.isConnecting) {
            console.log('Connection already in progress, skipping');
            return;
        }
        
        this.isConnecting = true;
        this.shouldReconnect = true;
        
        // Clear any existing connection timeout
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
        
        if (this.socket) {
            // Don't disconnect, just reuse the socket
            console.log('Reusing existing socket');
            
            // Update auth token
            this.authToken = token;
            const bearerToken = `Bearer ${token}`;
            
            // Update auth token safely
            if (this.socket.auth && typeof this.socket.auth === 'object') {
                (this.socket.auth as Record<string, string>).token = bearerToken;
            }
            
            if (this.socket.io.opts.extraHeaders) {
                this.socket.io.opts.extraHeaders.Authorization = bearerToken;
            }
            
            // Connect the socket if it's not already connected
            if (!this.socket.connected) {
                this.socket.connect();
            }
        } else {
            console.log('Creating new socket connection');
            this.authToken = token;

            // Format token as Bearer token
            const bearerToken = `Bearer ${token}`;

            // Create socket with proper configuration
            this.socket = io(this.url, {
                auth: {
                    token: bearerToken
                },
                extraHeaders: {
                    Authorization: bearerToken
                },
                // Add reconnection options
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                autoConnect: true,
                // Add transport configuration to match backend
                transports: ['websocket', 'polling'],
                // Prevent disconnection on page unload
                closeOnBeforeunload: false
            });

            this.setupSocketListeners();
            
            // Connect the socket
            this.socket.connect();
        }
        
        // Set a connection timeout to detect if connection fails
        this.connectionTimeout = setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                console.error('Socket connection timed out');
                this.isConnecting = false;
                store.dispatch(setConnectionStatus(false));
                store.dispatch(setError('Connection timed out'));
                
                // Set up a reconnect timer
                this.setupReconnectTimer();
            }
        }, 5000);
    }

    private setupSocketListeners() {
        if (!this.socket) {
            return;
        }

        this.socket.on('connect', () => {
            console.log('Socket connected successfully');
            this.isConnecting = false;
            this.isDisconnecting = false;
            this.connectionAttempts = 0;
            store.dispatch(setConnectionStatus(true));
            store.dispatch(setError(null));
            
            // Clear any connection timeout
            if (this.connectionTimeout) {
                clearTimeout(this.connectionTimeout);
                this.connectionTimeout = null;
            }
            
            // Clear any reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            
            // Set up ping interval to keep connection alive
            this.setupPingInterval();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnecting = false;
            store.dispatch(setConnectionStatus(false));
            store.dispatch(setError('Connection error: ' + error.message));
            
            // Clear any connection timeout
            if (this.connectionTimeout) {
                clearTimeout(this.connectionTimeout);
                this.connectionTimeout = null;
            }
            
            // Set up a reconnect timer
            this.setupReconnectTimer();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnecting = false;
            
            // Clear ping interval
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
            
            // Clear any connection timeout
            if (this.connectionTimeout) {
                clearTimeout(this.connectionTimeout);
                this.connectionTimeout = null;
            }
            
            // Only update connection status if we're not in the process of disconnecting
            if (!this.isDisconnecting) {
                store.dispatch(setConnectionStatus(false));
                
                // Set up a reconnect timer
                this.setupReconnectTimer();
            }
        });

        this.socket.on('error', ({ message }) => {
            console.error('Socket error:', message);
            this.isConnecting = false;
            store.dispatch(setError(message));
        });

        this.socket.on('exception', (error) => {
            console.error('Socket exception:', error);
            this.isConnecting = false;
            store.dispatch(setError(error.message || 'Connection error'));
        });

        this.socket.on('initialCode', ({ code, language, theme }) => {
            store.dispatch(updateCurrentCode(code || ''));

            if (language) {
                store.dispatch(setLanguage(language));
            }

            if (theme) {
                store.dispatch(setTheme(theme));
            }
        });

        this.socket.on('codeUpdated', ({ code }) => {
            // Always update the code, regardless of who made the change
            // This ensures that your own changes are reflected in your editor
            console.log('Received code update from server:', code.substring(0, 50) + (code.length > 50 ? '...' : ''));
            store.dispatch(updateCurrentCode(code));
        });

        this.socket.on('languageChanged', ({ language }) => {
            store.dispatch(setLanguage(language));
        });

        this.socket.on('themeChanged', ({ theme }) => {
            store.dispatch(setTheme(theme));
        });

        this.socket.on('userJoined', (data: { userId: string }) => {
            console.log(`User joined: ${data.userId}`);
            store.dispatch(addConnectedUser(data.userId));
        });

        this.socket.on('userLeft', (data: { userId: string }) => {
            console.log(`User left: ${data.userId}`);
            store.dispatch(removeConnectedUser(data.userId));
        });
    }

    private setupPingInterval() {
        // Clear any existing ping interval
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        
        // Set up a new ping interval
        this.pingInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.socket.emit('ping');
            }
        }, 20000); // Send ping every 20 seconds
    }

    private setupReconnectTimer() {
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        // Check if we should reconnect
        if (!this.shouldReconnect || this.connectionAttempts >= this.maxConnectionAttempts) {
            console.log('Max reconnection attempts reached or reconnection disabled');
            return;
        }
        
        // Set up a new reconnect timer
        this.reconnectTimer = setTimeout(() => {
            if (!this.isConnected() && !this.isConnecting && !this.isDisconnecting && this.shouldReconnect) {
                this.connectionAttempts++;
                console.log(`Attempting to reconnect (${this.connectionAttempts}/${this.maxConnectionAttempts})...`);
                if (this.authToken) {
                    this.connect(this.authToken);
                }
            }
        }, 3000);
    }

    disconnect() {
        if (this.socket) {
            this.isDisconnecting = true;
            this.shouldReconnect = false;
            
            if (this.roomId) {
                this.leaveRoom();
            }
            
            // Clear ping interval
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
            
            // Clear connection timeout
            if (this.connectionTimeout) {
                clearTimeout(this.connectionTimeout);
                this.connectionTimeout = null;
            }
            
            this.socket.disconnect();
            this.socket = null;
            this.authToken = null;
            this.isConnecting = false;
            this.isDisconnecting = false;
            store.dispatch(setConnectionStatus(false));
            
            // Clear any reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        }
    }

    joinRoom(roomId: string, userId: string) {
        if (!this.socket) {
            store.dispatch(setError('Socket not connected'));
            return;
        }

        this.roomId = roomId;
        
        // Include auth token in the join room request
        this.socket.emit('joinRoom', { 
            roomId, 
            userId,
            token: this.authToken
        });
    }

    leaveRoom() {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            // Only leave the room if we're actually disconnecting
            // This prevents the room from being left when the component unmounts
            // but we want to keep the socket connection alive
            if (this.isDisconnecting) {
                console.log('Leaving room:', this.roomId);
                this.socket.emit('leaveRoom', { 
                    roomId: this.roomId, 
                    userId,
                    token: this.authToken
                });
            } else {
                console.log('Skipping leaveRoom to maintain connection');
            }
        }
        this.roomId = null;
    }

    sendCodeChange(code: string, language?: string) {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            // Include auth token in the code change request
            this.socket.emit('codeChange', {
                roomId: this.roomId,
                userId,
                code,
                language,
                token: this.authToken
            });
        }
    }

    changeLanguage(language: string) {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            // Include auth token in the language change request
            this.socket.emit('changeLanguage', {
                roomId: this.roomId,
                userId,
                language,
                token: this.authToken
            });
        }
    }

    changeTheme(theme: string) {
        if (!this.socket || !this.roomId) {
            return;
        }

        const userId = store.getState().auth.user?._id;
        if (userId) {
            // Include auth token in the theme change request
            this.socket.emit('changeTheme', {
                roomId: this.roomId,
                userId,
                theme,
                token: this.authToken
            });
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    ping() {
        if (this.socket?.connected) {
            this.socket.emit('ping');
        }
    }
}

export const socketService = new WebSocketService();

export default socketService;
