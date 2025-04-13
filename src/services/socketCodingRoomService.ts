// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private url = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    public connect(token: string): void {
        this.socket = io(this.url, {
            extraHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public emit(event: string, data: any): void {
        if (this.socket) {
            this.socket.emit(event, data);
        } else {
            console.error('Socket not connected');
        }
    }

    public on(event: string, callback: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    public off(event: string): void {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
