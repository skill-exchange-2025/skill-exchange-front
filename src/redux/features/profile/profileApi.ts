// features/profile/profileApi.ts
import { baseApi } from "@/redux/api/baseApi";
import { Profile } from "@/types/profile";

export const profileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchProfile: builder.query<Profile, void>({
            query: () => ({
                url: "/profile",
                method: "GET",
            }),
        }),

        createProfile: builder.mutation<Profile, Profile>({
            query: (profileData) => ({
                url: "/profile",
                method: "POST",
                body: profileData,
            }),
        }),

        updateProfile: builder.mutation<Profile, Partial<Profile>>({
            query: (profileData) => ({
                url: "/profile",
                method: "PUT",
                body: profileData,
            }),
        }),
    }),
});

export const {
    useFetchProfileQuery,
    useCreateProfileMutation,
    useUpdateProfileMutation,
} = profileApi;
