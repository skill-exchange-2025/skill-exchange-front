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

    // Use refs to track code state and prevent update loops
    const isUpdatingRef = useRef(false);
    const lastCodeRef = useRef(currentCode);

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

    // Connect to WebSocket only once
    useEffect(() => {
        if (!token || !roomId || !user?._id) return;

        socketService.connect(token);
        socketService.joinRoom(roomId, user._id);

        return () => {
            if (roomId) {
                socketService.leaveRoom();
            }
        };
    }, [token, roomId, user?._id]);

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

    // Join room function - doesn't cause loops
    const handleJoinRoom = useCallback(async () => {
        if (!roomId || !user || !room) return;

        const isParticipant = room.participants?.some(p => p.user === user._id);

        if (!isParticipant) {
            try {
                setLocalJoinError(null);
                await joinRoom(roomId).unwrap();
                refetch();
            } catch (error: any) {
                setLocalJoinError(error.message || 'Failed to join room');
                toast({
                    variant: "destructive",
                    title: "Failed to join room",
                    description: error.message || 'An error occurred while trying to join the room',
                });
            }
        }
    }, [roomId, user, room, joinRoom, refetch, toast]);

    // Try to join room once when data is available
    useEffect(() => {
        if (!room || !user) return;

        const isParticipant = room.participants?.some(p => p.user === user._id);
        if (!isParticipant) {
            handleJoinRoom();
        }
        // We need handleJoinRoom in deps to prevent eslint warnings, but we ensure
        // the effect only runs once by checking isParticipant
    }, [room, user, handleJoinRoom]);

    // Handle local code changes without causing loops
    const handleCodeChange = useCallback((code: string) => {
        // Skip if no change or we're already processing an update
        if (code === lastCodeRef.current || isUpdatingRef.current) return;

        // Update the ref immediately
        lastCodeRef.current = code;

        // Mark that we're updating to prevent loops
        isUpdatingRef.current = true;

        // Update Redux and notify others
        dispatch(updateCurrentCode(code));
        socketService.sendCodeChange(code, language);
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

    return {
        room: activeRoom,
        code: currentCode,
        language,
        theme,
        isLoading,
        error: fetchError || localJoinError || socketError,
        isConnected,
        connectedUsers,
        handleCodeChange,
        changeLanguage,
        changeTheme,
        joinRoom: handleJoinRoom,
        refetch,
    };
};

export default useCodeRoom;
