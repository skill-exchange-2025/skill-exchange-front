// src/hooks/useCodeRoom.test.tsx
import { useEffect, useState } from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { jest } from "globals";

// Mock of redux store and services
const createMockStore = (initialState: any = {}) => {
    // Track dispatched actions
    const actions: any[] = [];

    const store = {
        getState: () => initialState,
        dispatch: (action: any) => {
            console.log('Action dispatched:', action);
            actions.push(action);

            // Simulate state updates based on actions
            if (action.type === 'codingRooms/updateCurrentCode') {
                initialState.codingRooms.currentCode = action.payload;
            }
            // Add more action handlers as needed

            return action;
        },
        subscribe: jest.fn(),
        replaceReducer: jest.fn(),
        actions, // Expose actions for inspection
    };

    return store;
};

// Mock socket service
const mockSocketService = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    sendCodeChange: jest.fn(),
    changeLanguage: jest.fn(),
    changeTheme: jest.fn(),
    calls: [] as {method: string, args: any[]}[], // Track calls
};

// Mock RTK Query hooks
const mockQueryResponse = {
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
};

const mockMutation = [jest.fn().mockResolvedValue({ data: {} }), { isLoading: false }];

// Create a test component that uses our hook
function TestComponent({
                           userId,
                           roomId,
                           initialCode = '',
                           trackUpdates = true
                       }: {
    userId: string;
    roomId: string;
    initialCode?: string;
    trackUpdates?: boolean;
}) {
    // Import the actual hook
    const { useCodeRoom } = require('./useCodeRoom');

    // Use the hook with the provided roomId
    const hookResult = useCodeRoom(roomId);

    // Track rerenders and state changes
    const [renderCount, setRenderCount] = useState(0);

    useEffect(() => {
        if (trackUpdates) {
            setRenderCount(prev => prev + 1);
            console.log(`Render #${renderCount + 1}`, {
                code: hookResult.code,
                isLocalUpdateRef: require('./useCodeRoom').isLocalUpdateRef?.current,
                lastCodeRef: require('./useCodeRoom').lastCodeRef?.current
            });
        }
    });

    // Simulate changing code after mounting
    useEffect(() => {
        if (initialCode && initialCode !== hookResult.code) {
            console.log('Simulating code change:', initialCode);
            hookResult.handleCodeChange(initialCode);
        }
    }, [initialCode, hookResult]);

    return (
        <div>
            <div data-testid="render-count">{renderCount}</div>
            <div data-testid="current-code">{hookResult.code}</div>
        </div>
    );
}

/**
 * Test hook function that diagnoses potential infinite loop issues
 */
export const testUseCodeRoom = (
    userId: string,
    roomId: string,
    {
        initialCode = '// Initial test code',
        maxRenders = 10,
        debugMode = true
    } = {}
) => {
    // Set up mocks
    jest.mock('@/redux/hooks', () => ({
        useAppSelector: (selector: any) => selector({
            auth: { user: { _id: userId }, token: 'fake-token' },
            codingRooms: {
                activeRoom: {
                    _id: roomId,
                    name: 'Test Room',
                    participants: [{ user: userId, username: 'TestUser' }]
                },
                currentCode: initialCode,
                language: 'javascript',
                theme: 'vs-dark',
                isConnected: true,
                connectedUsers: [userId],
                error: null
            }
        }),
        useAppDispatch: () => (action: any) => {
            console.log('Action dispatched:', action);
            return action;
        }
    }));

    jest.mock('@/redux/features/codingRoom/codingRoomsApi', () => ({
        useGetRoomByIdQuery: () => mockQueryResponse,
        useJoinRoomMutation: () => mockMutation,
        useUpdateRoomMutation: () => mockMutation,
    }));

    jest.mock('@/services/websocketService', () => mockSocketService);

    jest.mock('@/redux/features/codingRoom/codingRoomsSlice', () => ({
        setActiveRoom: (room: any) => ({ type: 'codingRooms/setActiveRoom', payload: room }),
        clearActiveRoom: () => ({ type: 'codingRooms/clearActiveRoom' }),
        updateCurrentCode: (code: string) => ({ type: 'codingRooms/updateCurrentCode', payload: code }),
        setLanguage: (lang: string) => ({ type: 'codingRooms/setLanguage', payload: lang }),
        setTheme: (theme: string) => ({ type: 'codingRooms/setTheme', payload: theme }),
    }));

    jest.mock('@/hooks/use-toast', () => ({
        useToast: () => ({ toast: jest.fn() })
    }));

    // Track renders to detect infinite loops
    let renders = 0;
    const originalConsoleLog = console.log;

    if (debugMode) {
        console.log = (...args) => {
            originalConsoleLog(...args);
            if (args[0]?.startsWith('Render #')) {
                renders++;
                if (renders > maxRenders) {
                    originalConsoleLog('\n\n🔥 INFINITE LOOP DETECTED! 🔥');
                    originalConsoleLog('Last state:', args[1]);
                    originalConsoleLog('\nPossible causes:');
                    originalConsoleLog('1. Circular dependency between state updates');
                    originalConsoleLog('2. Missing dependencies in useEffect/useCallback arrays');
                    originalConsoleLog('3. State updates triggering additional renders');
                    originalConsoleLog('\nCheck the following areas in useCodeRoom.ts:');
                    originalConsoleLog('- The handleCodeChange function');
                    originalConsoleLog('- useEffect hooks that update lastCodeRef or isLocalUpdateRef');
                    originalConsoleLog('- Redux state update patterns');
                    throw new Error('Maximum render count exceeded - infinite loop detected');
                }
            }
        };
    }

    // Run the test
    try {
        const store = createMockStore();

        render(
            <Provider store={store as any}>
                <TestComponent
                    userId={userId}
                    roomId={roomId}
                    initialCode={initialCode}
                />
            </Provider>
        );

        // Simulate editor changes
        act(() => {
            // Change code after a small delay
            setTimeout(() => {
                console.log('\nSimulating external code change');
                store.dispatch({
                    type: 'codingRooms/updateCurrentCode',
                    payload: initialCode + '\n// Added line'
                });
            }, 100);
        });

        return {
            success: true,
            dispatches: store.actions,
            socketCalls: mockSocketService.calls,
            renderCount: renders
        };
    } catch (error) {
        return {
            success: false,
            error,
            renderCount: renders
        };
    } finally {
        if (debugMode) {
            console.log = originalConsoleLog;
        }
        jest.resetModules();
    }
};

// Example usage:
// testUseCodeRoom('test-user-123', 'test-room-456', { initialCode: '// Test code', maxRenders: 15 });
