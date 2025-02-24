// features/profile/profileSlice.ts
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { Profile } from "@/types/profile";
import {profileApi} from "@/redux/features/profile/profileApi.ts";
import { CompletionStatus } from "@/types/status";

export type ProfileState = {
    profile: Profile | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    completionStatus: CompletionStatus | null;
};

const initialState: ProfileState = {
    profile: null,
    status: "idle",
    error: null,
    completionStatus: null,
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
        setCompletionStatus: (state, action: PayloadAction<CompletionStatus>) => {
            state.completionStatus = action.payload;
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
                if (!action.payload.profileExists) {
                    state.error = null;
                }
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
            })
            .addMatcher(
                profileApi.endpoints.getProfileCompletionStatus.matchPending,
                (state) => {
                    state.status = "loading";
                }
            )
            .addMatcher(
                profileApi.endpoints.getProfileCompletionStatus.matchFulfilled,
                (state, action) => {
                    state.status = "succeeded";
                    state.completionStatus = action.payload;
                }
            )
            .addMatcher(
                profileApi.endpoints.getProfileCompletionStatus.matchRejected,
                (state, action) => {
                    state.status = "failed";
                    state.error = action.error?.message ?? "Failed to fetch completion status";
                }
            )   ;

    },
});

export const useCurrentProfile = (state: RootState) => state.profile.profile;
export const useProfileStatus = (state: RootState) => state.profile.status;
export const useProfileError = (state: RootState) => state.profile.error;
export const selectCompletionStatus = (state: RootState) => state.profile.completionStatus;

export const { setProfile, resetStatus,setCompletionStatus  } = profileSlice.actions;
export default profileSlice.reducer;
