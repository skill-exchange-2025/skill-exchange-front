import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { lessonApi } from '@/redux/features/lessons/lessonApi';
import { Lesson } from '@/types/lessons';

interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

interface LessonsState {
    lessons: Lesson[];
    selectedLesson: Lesson | null;
    filters: {
        search: string;
        status: string;
        instructor: string;
    };
    pagination: PaginationState;
    error: string | null;
    loading: boolean;
}

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
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.filters.search = action.payload;
            state.pagination.currentPage = 1;
        },
        // ... other reducers ...
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
        // Updated to only accept non-null Lesson objects
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
            // Add matchers for getLessonById to update selectedLesson
            .addMatcher(lessonApi.endpoints.getLessonById?.matchFulfilled, (state, action) => {
                state.selectedLesson = action.payload;
            });
    },
});

export const {
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    setTotalItems,
    setSelectedLesson,
    clearSelectedLesson,
    setError,
} = lessonsSlice.actions;

export const selectLessons = (state: RootState) => state.lessons.lessons;
export const selectSelectedLesson = (state: RootState) => state.lessons.selectedLesson;
// Add a non-null selector for type safety
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

export default lessonsSlice.reducer;