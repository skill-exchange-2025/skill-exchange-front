// src/hooks/useCodeRoom.ts
import { useEffect, useCallback, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useGetRoomByIdQuery, useJoinRoomMutation, useUpdateRoomMutation } from '@/redux/features/codingRoom/codingRoomsApi';
import socketService from '@/services/websocketService';
import {
    setActiveRoom,
    clearActiveRoom,
    updateCurrentCode,
    setLanguage,
    setTheme
} from '@/redux/features/codingRoom/codingRoomsSlice';
import { useToast } from '@/hooks/use-toast';

// Add these constants at the top of the file
const RECONNECT_INTERVAL = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

export const useCodeRoom = (roomId: string | undefined) => {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { user, token } = useAppSelector((state) => state.auth);
    const {
        activeRoom,
        currentCode,
        language,
        theme,
        isConnected,
        connectedUsers,
        error: socketError
    } = useAppSelector((state) => state.codingRooms);

    const [joinRoom] = useJoinRoomMutation();
    const [updateRoom] = useUpdateRoomMutation();
    const [localJoinError, setLocalJoinError] = useState<string | null>(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const connectionAttemptRef = useRef<number>(0);
    const tokenRef = useRef<string | null>(null);
    const isConnectingRef = useRef<boolean>(false);
    const isUnmountingRef = useRef<boolean>(false);
    const socketInitializedRef = useRef<boolean>(false);
    const pingIntervalRef = useRef<NodeJS.Timeout>();
    const [userLeftRoom, setUserLeftRoom] = useState(false);
    const previousConnectedUsersRef = useRef<string[]>([]);

    // Use refs to track code state and prevent update loops
    const isUpdatingRef = useRef(false);
    const lastCodeRef = useRef(currentCode);
    const lastSentCodeRef = useRef(currentCode);
    const codeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Store initial room data to prevent unnecessary refetches
    const initialRoomLoadedRef = useRef(false);

    const {
        data: room,
        isLoading,
        error: fetchError,
        refetch
    } = useGetRoomByIdQuery(
        roomId || '',
        { skip: !roomId }
    );

    // Effect to show socket connection errors - this won't cause loops
    useEffect(() => {
        if (socketError) {
            toast({
                variant: "destructive",
                title: "Connection error",
                description: socketError,
            });
        }
    }, [socketError, toast]);

    // Set active room once when data is loaded
    useEffect(() => {
        if (!room || initialRoomLoadedRef.current) return;

        dispatch(setActiveRoom(room));
        initialRoomLoadedRef.current = true;

        // Also update the lastCodeRef to match initial state
        lastCodeRef.current = room.currentCode || '';

        return () => {
            if (roomId) {
                dispatch(clearActiveRoom());
                initialRoomLoadedRef.current = false;
            }
        };
    }, [room, dispatch, roomId]);

    // Add connection management function
    const establishConnection = useCallback(() => {
        if (!token || !roomId || !user?._id || isConnectingRef.current) return;
        
        try {
            isConnectingRef.current = true;
            
            // Store token in ref for later use
            tokenRef.current = token;
            
            // Connect with token
            socketService.connect(token);
            
            // Join room after a short delay to ensure connection is established
            setTimeout(() => {
                if (socketService.isConnected()) {
                    socketService.joinRoom(roomId, user._id);
                    setWsConnected(true);
                    connectionAttemptRef.current = 0;
                } else {
                    console.error('Socket not connected after timeout');
                    handleReconnect();
                }
                isConnectingRef.current = false;
            }, 2000); // Increased timeout to 2 seconds
            
            setReconnectAttempts(0); // Reset attempts on successful connection
        } catch (error) {
            console.error('Connection error:', error);
            isConnectingRef.current = false;
            handleReconnect();
        }
    }, [token, roomId, user?._id]);

    // Add reconnection logic
    const handleReconnect = useCallback(() => {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS || isConnectingRef.current || isUnmountingRef.current) {
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                toast({
                    variant: "destructive",
                    title: "Connection Failed",
                    description: "Unable to reconnect after multiple attempts. Please refresh the page.",
                });
            }
            return;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectionAttemptRef.current += 1;
            console.log(`Reconnection attempt ${connectionAttemptRef.current}`);
            establishConnection();
        }, RECONNECT_INTERVAL);
    }, [reconnectAttempts, establishConnection, toast]);

    // Join room function - doesn't cause loops
    const handleJoinRoom = useCallback(async () => {
        if (!roomId || !user || !room || hasAttemptedJoin) return;

        const isParticipant = room.participants?.some(p => p.user === user._id);

        if (!isParticipant) {
            try {
                setLocalJoinError(null);
                setHasAttemptedJoin(true);
                await joinRoom(roomId).unwrap();
                refetch();
                
                // After successful HTTP join, establish WebSocket connection
                if (token && user._id) {
                    establishConnection();
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
                setLocalJoinError(errorMessage);
                toast({
                    variant: "destructive",
                    title: "Failed to join room",
                    description: errorMessage || 'An error occurred while trying to join the room',
                });
            }
        } else {
            // If already a participant, just establish WebSocket connection
            setHasAttemptedJoin(true);
            if (token && user._id) {
                establishConnection();
            }
        }
    }, [roomId, user, room, joinRoom, refetch, toast, token, hasAttemptedJoin, establishConnection]);

    // Try to join room once when data is available
    useEffect(() => {
        if (!room || !user || hasAttemptedJoin) return;
        handleJoinRoom();
    }, [room, user, handleJoinRoom, hasAttemptedJoin]);

    // Initialize socket connection once
    useEffect(() => {
        if (!socketInitializedRef.current && token && roomId && user?._id) {
            socketInitializedRef.current = true;
            establishConnection();
        }
    }, [token, roomId, user?._id, establishConnection]);

    // Update the connection effect to avoid duplicate connections
    useEffect(() => {
        // Only establish connection if we've already attempted to join and not connected
        if (hasAttemptedJoin && !wsConnected && !isConnectingRef.current && !isUnmountingRef.current) {
            establishConnection();
        }

        // Setup ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
            if (socketService.isConnected()) {
                socketService.ping();
            } else if (hasAttemptedJoin && !isConnectingRef.current && !isUnmountingRef.current) {
                setWsConnected(false);
                handleReconnect();
            }
        }, 15000); // Send ping every 15 seconds

        return () => {
            isUnmountingRef.current = true;
            
            // Properly disconnect the socket when unmounting
            socketService.disconnect();
            
            // Update local state
            setWsConnected(false);
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
        };
    }, [roomId, establishConnection, handleReconnect, hasAttemptedJoin, wsConnected]);

    // Sync currentCode from Redux to lastCodeRef only when needed
    useEffect(() => {
        // Only update the ref if we're not in the middle of an update process
        if (!isUpdatingRef.current && currentCode !== lastCodeRef.current) {
            lastCodeRef.current = currentCode;
        } else {
            // Reset the flag after the update has been processed
            isUpdatingRef.current = false;
        }
    }, [currentCode]);

    // Handle local code changes without causing loops
    const handleCodeChange = useCallback((code: string) => {
        // Skip if we're already processing an update
        if (isUpdatingRef.current) return;
        
        // Skip if the code is the same as what we last sent
        if (code === lastSentCodeRef.current) return;

        // Mark that we're updating to prevent loops
        isUpdatingRef.current = true;

        // Update the ref immediately
        lastCodeRef.current = code;
        lastSentCodeRef.current = code;

        // Clear any existing timeout
        if (codeUpdateTimeoutRef.current) {
            clearTimeout(codeUpdateTimeoutRef.current);
        }

        // Update Redux and notify others
        dispatch(updateCurrentCode(code));
        
        // Send code change to server
        socketService.sendCodeChange(code, language);
        
        // Reset the flag after a short delay to allow for state updates
        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 100);
    }, [dispatch, language]);

    // Language change handler - won't cause loops
    const changeLanguage = useCallback((newLanguage: string) => {
        if (newLanguage === language) return;

        dispatch(setLanguage(newLanguage));
        socketService.changeLanguage(newLanguage);

        if (roomId) {
            updateRoom({
                id: roomId,
                data: { language: newLanguage }
            }).catch(error => {
                console.error('Failed to update language:', error);
            });
        }
    }, [dispatch, roomId, updateRoom, language]);

    // Theme change handler - won't cause loops
    const changeTheme = useCallback((newTheme: string) => {
        if (newTheme === theme) return;

        dispatch(setTheme(newTheme));
        socketService.changeTheme(newTheme);

        if (roomId) {
            updateRoom({
                id: roomId,
                data: { theme: newTheme }
            }).catch(error => {
                console.error('Failed to update theme:', error);
            });
        }
    }, [dispatch, roomId, updateRoom, theme]);

    // Track when users leave the room
    useEffect(() => {
        // If we previously had connected users and now we don't, a user has left
        if (previousConnectedUsersRef.current.length > 0 && connectedUsers.length === 0) {
            setUserLeftRoom(true);
        } else if (connectedUsers.length > 0) {
            setUserLeftRoom(false);
        }
        
        // Update the previous connected users ref
        previousConnectedUsersRef.current = [...connectedUsers];
    }, [connectedUsers]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isUnmountingRef.current = true;
            
            // Clear any pending timeouts
            if (codeUpdateTimeoutRef.current) {
                clearTimeout(codeUpdateTimeoutRef.current);
            }
            
            // Don't leave the room when unmounting to maintain the connection
            // This prevents the socket from disconnecting
        };
    }, []);

    return {
        room: activeRoom,
        code: currentCode,
        language,
        theme,
        isLoading,
        error: fetchError || localJoinError || socketError,
        isConnected,
        connectedUsers,
        userLeftRoom,
        handleCodeChange,
        changeLanguage,
        changeTheme,
        joinRoom: handleJoinRoom,
        refetch,
    };
};

export default useCodeRoom;
