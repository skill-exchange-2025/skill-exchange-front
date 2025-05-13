import { baseApi } from '@/redux/api/baseApi';

interface WheelSpinResponse {
    prize: string;
    credits: number;
    message: string;
}

export const wheelSpinApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        spinWheel: builder.mutation<WheelSpinResponse, void>({
            query: () => ({
                url: '/wheel-spin',
                method: 'POST',
            }),
            invalidatesTags: ['WheelSpin', 'Credits'],
        }),

        getLastSpinTime: builder.query<{ lastSpinTime: string | null }, void>({
            query: () => '/wheel-spin/last-spin',
            providesTags: ['WheelSpin'],
        }),
    }),
});

export const {
    useSpinWheelMutation,
    useGetLastSpinTimeQuery,
} = wheelSpinApi;