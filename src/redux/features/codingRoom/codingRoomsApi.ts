// src/redux/features/codingRoom/codingRoomsApi.ts
import { baseApi } from '../../api/baseApi'; // Adjust this path based on your actual file structure
import { ParticipantRole, CodingRoom } from '@/types/codingRoom.ts'; // Adjust this path based on your actual file structure

export interface CreateRoomDto {
    name: string;
    description?: string;
    isPrivate?: boolean;
    language?: string;
    theme?: string;
    tags?: string[];
    currentCode?: string;
}

export interface UpdateRoomDto {
    name?: string;
    description?: string;
    isPrivate?: boolean;
    language?: string;
    theme?: string;
    tags?: string[];
    status?: 'active' | 'inactive' | 'archived';
}

export const codingRoomsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Room management
        createRoom: builder.mutation<CodingRoom, CreateRoomDto>({
            query: (data: CreateRoomDto) => ({
                url: '/coding-rooms',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        getRooms: builder.query<CodingRoom[], { public?: boolean }>({
            query: (params: { public?: boolean }) => ({
                url: '/coding-rooms',
                params: { public: params.public },
            }),
        }),

        searchRooms: builder.query<CodingRoom[], string>({
            query: (term: string) => ({
                url: '/coding-rooms/search',
                params: { q: term },
            }),
        }),

        getRoomById: builder.query<CodingRoom, string>({
            query: (id: string) => ({
                url: `/coding-rooms/${id}`,
            }),
            providesTags: (result: CodingRoom | undefined) =>
                result ? [{ type: 'User', id: result._id }] : [],
        }),

        updateRoom: builder.mutation<CodingRoom, { id: string; data: UpdateRoomDto }>({
            query: ({ id, data }: { id: string; data: UpdateRoomDto }) => ({
                url: `/coding-rooms/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result: CodingRoom | undefined) =>
                result ? [{ type: 'User', id: result._id }] : [],
        }),

        deleteRoom: builder.mutation<void, string>({
            query: (id: string) => ({
                url: `/coding-rooms/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),

        // Participant management
        joinRoom: builder.mutation<CodingRoom, string>({
            query: (id: string) => ({
                url: `/coding-rooms/${id}/join`,
                method: 'POST',
            }),
            invalidatesTags: (result: CodingRoom | undefined) =>
                result ? [{ type: 'User', id: result._id }] : [],
        }),

        updateParticipantRole: builder.mutation<
            CodingRoom,
            { roomId: string; userId: string; role: ParticipantRole }
        >({
            query: ({ roomId, userId, role }: { roomId: string; userId: string; role: ParticipantRole }) => ({
                url: `/coding-rooms/${roomId}/participants/${userId}/role`,
                method: 'PUT',
                body: { role },
            }),
            invalidatesTags: (result: CodingRoom | undefined) =>
                result ? [{ type: 'User', id: result._id }] : [],
        }),

        removeParticipant: builder.mutation<
            void,
            { roomId: string; participantId: string }
        >({
            query: ({ roomId, participantId }: { roomId: string; participantId: string }) => ({
                url: `/coding-rooms/${roomId}/participants/${participantId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),

        // Room settings
        updateTheme: builder.mutation<
            CodingRoom,
            { roomId: string; theme: string }
        >({
            query: ({ roomId, theme }: { roomId: string; theme: string }) => ({
                url: `/coding-rooms/${roomId}/theme`,
                method: 'POST',
                body: { theme },
            }),
            invalidatesTags: (result: CodingRoom | undefined) =>
                result ? [{ type: 'User', id: result._id }] : [],
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateRoomMutation,
    useGetRoomsQuery,
    useSearchRoomsQuery,
    useGetRoomByIdQuery,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useJoinRoomMutation,
    useUpdateParticipantRoleMutation,
    useRemoveParticipantMutation,
    useUpdateThemeMutation,
} = codingRoomsApi;
