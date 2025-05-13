// src/hooks/useCodeRoom.test.ts
import { useState } from 'react';

/**
 * A static version of useCodeRoom for testing purposes
 * Returns mock data and behavior without actual Redux or WebSocket connections
 */
export const useCodeRoomTest = (roomId: string | undefined) => {
  const [mockCode, setMockCode] = useState('// This is a test coding room');
  const [mockLanguage, setMockLanguage] = useState('javascript');
  const [mockTheme, setMockTheme] = useState('vs-dark');

  // Static mock data
  const mockRoom = {
    _id: roomId || 'test-room-id',
    name: 'Test Coding Room',
    description: 'A static room for testing',
    language: mockLanguage,
    theme: mockTheme,
    currentCode: mockCode,
    isPrivate: false,
    tags: ['test', 'mock'],
    createdBy: 'test-user-id',
    participants: [
      { user: 'test-user-id', username: 'TestUser', role: 'owner' },
      { user: 'test-user-2', username: 'User2', role: 'participant' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockConnectedUsers = ['test-user-id', 'test-user-2'];

  // Mock functions with basic behavior
  const handleCodeChange = (code: string) => {
    setMockCode(code);
  };

  const changeLanguage = (language: string) => {
    setMockLanguage(language);
  };

  const changeTheme = (theme: string) => {
    setMockTheme(theme);
  };

  const joinRoom = async () => {
    return Promise.resolve();
  };

  const refetch = () => {
    return Promise.resolve({ data: mockRoom });
  };

  return {
    room: mockRoom,
    code: mockCode,
    language: mockLanguage,
    theme: mockTheme,
    isLoading: false,
    error: null,
    isConnected: true,
    connectedUsers: mockConnectedUsers,
    handleCodeChange,
    changeLanguage,
    changeTheme,
    joinRoom,
    refetch,
  };
};

export default useCodeRoomTest;
