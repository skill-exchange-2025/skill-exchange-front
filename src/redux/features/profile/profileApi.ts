// features/profile/profileApi.ts
import { baseApi } from "@/redux/api/baseApi";
import { Profile } from "@/types/profile";
import {CompletionStatus} from "@/types/status.ts";

export const profileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchProfile: builder.query<Profile,  string | undefined>({
            query: () => ({
                url:  `/profile}`,
                method: "GET",
            }),
        }),
        getProfileByUserId: builder.query<Profile,  string>({
            query: (userId) => ({
                url:  `/profile/${userId}`,
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
        getProfileCompletionStatus: builder.query<CompletionStatus, void>({
            query: () => ({
                url: "/profile/completion-status",
                method: "GET",
            }),
        }),

        uploadAvatar: builder.mutation<{ avatarUrl: string }, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('avatar', file);

                return {
                    url: "/profile/avatar",
                    method: "POST",
                    body: formData,
                    // Don't set Content-Type header - axios will set it with boundary
                    formData: true,
                };
            },
        }),
    }),
        
});

export const {
    useFetchProfileQuery,
    useCreateProfileMutation,
    useGetProfileCompletionStatusQuery,
    useUploadAvatarMutation,
    useUpdateProfileMutation,
    useGetProfileByUserIdQuery,
} = profileApi;
