// src/redux/features/lessons/lessonsSlice.tsx
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {lessonApi} from './lessonApi';
import type {Lesson, LessonsState} from '@/types/lessons';
import type {RootState} from '@/redux/store';

// Remove the interface definitions since they're now in types/lessons.ts

const initialState: LessonsState = {
    lessons: [],
    selectedLesson: null,
    filters: {
        search: '',
        status: 'all',
        instructor: '',
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
    },
    error: null,
    loading: false,
};

const lessonsSlice = createSlice({
    name: 'lessons',
    initialState,
    reducers: {
        // Your existing reducers remain the same
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.filters.search = action.payload;
            state.pagination.currentPage = 1;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.pagination.currentPage = action.payload;
        },
        setItemsPerPage: (state, action: PayloadAction<number>) => {
            state.pagination.itemsPerPage = action.payload;
            state.pagination.currentPage = 1;
        },
        setTotalItems: (state, action: PayloadAction<number>) => {
            state.pagination.totalItems = action.payload;
        },
        setSelectedLesson: (state, action: PayloadAction<Lesson>) => {
            state.selectedLesson = action.payload;
        },
        clearSelectedLesson: (state) => {
            state.selectedLesson = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(lessonApi.endpoints.getLessonsByListing.matchPending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addMatcher(lessonApi.endpoints.getLessonsByListing.matchFulfilled, (state, action) => {
                state.loading = false;
                state.lessons = action.payload.data;
                state.pagination.totalItems = action.payload.meta?.total || 0;
            })
            .addMatcher(lessonApi.endpoints.getLessonsByListing.matchRejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch lessons';
            })
            .addMatcher(lessonApi.endpoints.getLessonById?.matchFulfilled, (state, action) => {
                state.selectedLesson = action.payload;
            });
    },
});

// Export actions
export const {
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    setTotalItems,
    setSelectedLesson,
    clearSelectedLesson,
    setError,
} = lessonsSlice.actions;

// Export selectors
export const selectLessons = (state: RootState) => state.lessons.lessons;
export const selectSelectedLesson = (state: RootState) => state.lessons.selectedLesson;
export const selectNonNullSelectedLesson = (state: RootState): Lesson => {
    if (!state.lessons.selectedLesson) {
        throw new Error("Selected lesson is null but was expected to be non-null");
    }
    return state.lessons.selectedLesson;
};
export const selectFilters = (state: RootState) => state.lessons.filters;
export const selectPagination = (state: RootState) => state.lessons.pagination;
export const selectLoading = (state: RootState) => state.lessons.loading;
export const selectError = (state: RootState) => state.lessons.error;

// Export reducer
export default lessonsSlice.reducer;