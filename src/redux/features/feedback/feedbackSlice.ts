import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {feedbackApi} from './feedbackApi';

// Update the interface with all required fields
export interface IFeedback {
    _id: string
    title: string
    description: string
    type: "bug" | "improvement" | "feature"
    priority: "low" | "medium" | "high"
    attachments: string[]
    status: "pending" | "in_progress" | "resolved" | "rejected"
    userId: string
    createdAt: string
    updatedAt: string
}

// Export the FeedbackState interface
export interface FeedbackState {
    feedbacks: IFeedback[];
    selectedFeedback: IFeedback | null;
    loading: boolean;
    error: string | null;
}

const initialState: FeedbackState = {
    feedbacks: [],
    selectedFeedback: null,
    loading: false,
    error: null,
};

const feedbackSlice = createSlice({
    extraReducers: (builder) => {
        builder
            // Handle getAllFeedbacks
            .addMatcher(feedbackApi.endpoints.getAllFeedbacks.matchPending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addMatcher(feedbackApi.endpoints.getAllFeedbacks.matchRejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch feedbacks';
            })
            .addMatcher(feedbackApi.endpoints.deleteFeedback.matchRejected,(state , action )=> {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete feedbacks';
            })
            // Handle getSingleFeedback
            .addMatcher(feedbackApi.endpoints.getSingleFeedback.matchFulfilled, (state, action) => {
                state.selectedFeedback = action.payload;
            });
    },
    initialState,
    name: 'feedback',
    reducers: {
        setSelectedFeedback: (state, action: PayloadAction<IFeedback | null>) => {
            state.selectedFeedback = action.payload;
        },
        clearSelectedFeedback: (state) => {
            state.selectedFeedback = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

// Export actions
export const {
    setSelectedFeedback,
    clearSelectedFeedback,
    setError,
} = feedbackSlice.actions;

// Export selectors - using type alias instead of direct import
export const selectFeedbacks = (state: { feedback: FeedbackState }) => state.feedback.feedbacks;
export const selectSelectedFeedback = (state: { feedback: FeedbackState }) => state.feedback.selectedFeedback;
export const selectFeedbackLoading = (state: { feedback: FeedbackState }) => state.feedback.loading;
export const selectFeedbackError = (state: { feedback: FeedbackState }) => state.feedback.error;

export default feedbackSlice.reducer;