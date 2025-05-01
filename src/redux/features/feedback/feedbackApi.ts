import {baseApi} from '@/redux/api/baseApi';
import {IFeedback} from '@/types/feedback.types';

export const feedbackApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all feedbacks (admin)
        getAllFeedbacks: builder.query<IFeedback[], void>({
            query: () => ({
                url: '/feedback',
                method: 'GET',
            }),
            providesTags: ['Feedback'],
        }),

        // Get user's feedbacks
        getUserFeedbacks: builder.query({
            query: (params) => ({
                url: '/feedback/user',
                method: 'GET',
                params: {
                    page: params.page,
                    limit: params.limit
                },
            }),
            providesTags: ['Feedback'],
        }),

        // Get single feedback
        getSingleFeedback: builder.query<IFeedback, string>({
            query: (id) => ({
                url: `/feedback/${id}`,
                method: 'GET',
            }),
            providesTags: ['Feedback'],
        }),

        // Create feedback
        createFeedback: builder.mutation<IFeedback, Partial<IFeedback>>({
            query: (data) => ({
                url: '/feedback/create', // Changed from '/feedback/create' to '/feedback'
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Feedback'],
        }),

        updateFeedback: builder.mutation<IFeedback, { id: string; data: Partial<IFeedback> }>({
            query: ({ id, data }) => ({
                url: `/feedback/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Feedback'],
        }),

        deleteFeedback: builder.mutation<void, string>({
            query: (id) => ({
                url: `/feedback/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Feedback'],
        }),


        // Update feedback status (admin only)
        updateFeedbackStatus: builder.mutation<
            IFeedback,
            { id: string; status: IFeedback['status'] }
        >({
            query: ({ id, status }) => ({
                url: `/feedback/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['Feedback'],
        }),
    }),
});

export const {
    useGetAllFeedbacksQuery,
    useGetUserFeedbacksQuery,
    useGetSingleFeedbackQuery,
    useCreateFeedbackMutation,
    useUpdateFeedbackMutation,
    useDeleteFeedbackMutation,
    useUpdateFeedbackStatusMutation,
} = feedbackApi;