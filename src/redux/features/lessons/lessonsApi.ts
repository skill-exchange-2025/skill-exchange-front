import { baseApi } from '@/redux/api/baseApi';
import { Lesson, CreateLessonDto, UpdateLessonDto } from '@/types/lesson';

export const lessonsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLessons: builder.query<Lesson[], string>({
            query: (listingId) => `/listings/${listingId}/lessons`,
            providesTags: ['Lesson'],
        }),
        getLesson: builder.query<Lesson, string>({
            query: (lessonId) => `/lessons/${lessonId}`,
            providesTags: ['Lesson'],
        }),
        createLesson: builder.mutation<Lesson, CreateLessonDto>({
            query: (data) => ({
                url: '/lessons',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Lesson'],
        }),
        updateLesson: builder.mutation<Lesson, { id: string; data: UpdateLessonDto }>({
            query: ({ id, data }) => ({
                url: `/lessons/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Lesson'],
        }),
        deleteLesson: builder.mutation<void, string>({
            query: (id) => ({
                url: `/lessons/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Lesson'],
        }),
    }),
});

export const {
    useGetLessonsQuery,
    useGetLessonQuery,
    useCreateLessonMutation,
    useUpdateLessonMutation,
    useDeleteLessonMutation,
} = lessonsApi;