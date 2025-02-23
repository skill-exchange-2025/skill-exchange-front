// features/profile/profileSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { Profile } from "@/types/profile";
import {profileApi} from "@/redux/features/profile/profileApi.ts";

export type ProfileState = {
    profile: Profile | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
};

const initialState: ProfileState = {
    profile: null,
    status: "idle",
    error: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        resetStatus: (state) => {
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addMatcher(profileApi.endpoints.fetchProfile.matchPending, (state) => {
                state.status = "loading";
            })
            .addMatcher(profileApi.endpoints.fetchProfile.matchFulfilled, (state, action) => {
                state.status = "succeeded";
                state.profile = action.payload;
            })
            .addMatcher(profileApi.endpoints.fetchProfile.matchRejected, (state, action) => {
                state.status = "failed";
                state.error = action.error?.message ?? "Failed to fetch profile";
            })

            // Create Profile
            .addMatcher(profileApi.endpoints.createProfile.matchPending, (state) => {
                state.status = "loading";
            })
            .addMatcher(profileApi.endpoints.createProfile.matchFulfilled, (state, action) => {
                state.status = "succeeded";
                state.profile = action.payload;
            })
            .addMatcher(profileApi.endpoints.createProfile.matchRejected, (state, action) => {
                state.status = "failed";
                state.error = action.error?.message ?? "Failed to create profile";
            })

            // Update Profile
            .addMatcher(profileApi.endpoints.updateProfile.matchPending, (state) => {
                state.status = "loading";
            })
            .addMatcher(profileApi.endpoints.updateProfile.matchFulfilled, (state, action) => {
                state.status = "succeeded";
                state.profile = action.payload;
            })
            .addMatcher(profileApi.endpoints.updateProfile.matchRejected, (state, action) => {
                state.status = "failed";
                state.error = action.error?.message ?? "Failed to update profile";
            });
    },
});

export const useCurrentProfile = (state: RootState) => state.profile.profile;
export const useProfileStatus = (state: RootState) => state.profile.status;
export const useProfileError = (state: RootState) => state.profile.error;

export const { setProfile, resetStatus } = profileSlice.actions;
export default profileSlice.reducer;
