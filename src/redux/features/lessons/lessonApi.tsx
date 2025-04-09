import { baseApi } from '@/redux/api/baseApi';

export interface Lesson {
    _id: string;
    title: string;
    description: string;
    duration: number;
    content: string;
    order: number;
    instructor?: {
        _id: string;
        name: string;
        email: string;
    };
    listing: string;
    status: 'draft' | 'published' | 'archived';
    materials: string[];
    imageUrls: string[];
    videoUrl?: string;
    isPreview: boolean;
    startDate?: string;
    endDate?: string;
    maxParticipants?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateLessonDto {
    title: string;
    description: string;
    duration: number;
    content: string;

    materials?: string[];
    videoUrl?: string;
}

export interface LessonsPaginatedResponse {
    totalItems: number;
    data: Lesson[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

interface GetLessonsByListingQuery {
    listingId: string;
    page?: number;
    limit?: number;
}

export const lessonApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createLesson: builder.mutation<Lesson, { listingId: string; data: CreateLessonDto }>({
            query: ({ listingId, data }) => ({
                url: `/lessons/listing/${listingId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, { listingId }) => [
                { type: 'Lessons', id: `LIST-${listingId}` },
            ],
        }),

        getLessonsByListing: builder.query<LessonsPaginatedResponse, GetLessonsByListingQuery>({
            query: ({ listingId, page = 1, limit = 10 }) => ({
                url: `/lessons/listing/${listingId}`,
                method: 'GET',
                params: { page, limit },
            }),
            providesTags: (result, _error, { listingId }) =>
                result
                    ? [
                        ...result.data.map((lesson) => ({ type: 'Lessons' as const, id: lesson._id })),
                        { type: 'Lessons', id: `LIST-${listingId}` },
                    ]
                    : [{ type: 'Lessons', id: `LIST-${listingId}` }],
        }),

        getLessonById: builder.query<Lesson, string>({
            query: (id) => ({
                url: `/lessons/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Lessons', id }],
        }),

        updateLesson: builder.mutation<Lesson, { id: string; data: CreateLessonDto }>({
            query: ({ id, data }) => ({
                url: `/lessons/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Lessons', id }],
        }),

        deleteLesson: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `/lessons/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Lessons', id }],
        }),

        updateLessonOrder: builder.mutation<Lesson, { id: string; order: number }>({
            query: ({ id, order }) => ({
                url: `/lessons/${id}/order`,
                method: 'PUT',
                body: { order },
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Lessons', id }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateLessonMutation,
    useGetLessonsByListingQuery,
    useGetLessonByIdQuery,
    useUpdateLessonMutation,
    useDeleteLessonMutation,
    useUpdateLessonOrderMutation,
} = lessonApi;