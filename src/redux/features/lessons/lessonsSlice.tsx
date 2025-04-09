import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { lessonApi } from '@/redux/features/lessons/lessonApi.tsx';
import { Lessons } from '@/types/lessons';

interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

interface LessonsState {
    lessons: Lessons[];
    selectedLesson: Lessons | null;
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
            state.pagination.currentPage = 1; // Reset to first page when search changes
        },
        setStatusFilter: (state, action: PayloadAction<string>) => {
            state.filters.status = action.payload;
            state.pagination.currentPage = 1; // Reset to first page when filter changes
        },
        setInstructorFilter: (state, action: PayloadAction<string>) => {
            state.filters.instructor = action.payload;
            state.pagination.currentPage = 1; // Reset to first page when filter changes
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.pagination.currentPage = action.payload;
        },
        setItemsPerPage: (state, action: PayloadAction<number>) => {
            state.pagination.itemsPerPage = action.payload;
            state.pagination.currentPage = 1; // Reset to first page when items per page changes
        },
        setTotalItems: (state, action: PayloadAction<number>) => {
            state.pagination.totalItems = action.payload;
        },
        setSelectedLesson: (state, action: PayloadAction<LessonType | null>) => {
            state.selectedLesson = action.payload;
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
                state.pagination.totalItems = action.payload.totalItems;
            })
            .addMatcher(lessonApi.endpoints.getLessonsByListing.matchRejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch lessons';
            });
    },
});

export const {
    setSearchTerm,
    setStatusFilter,
    setInstructorFilter,
    setCurrentPage,
    setItemsPerPage,
    setTotalItems,
    setSelectedLesson,
    setError,
} = lessonsSlice.actions;

// Selectors
export const selectLessons = (state: RootState) => state.lessons.lessons;
export const selectSelectedLesson = (state: RootState) => state.lessons.selectedLesson;
export const selectFilters = (state: RootState) => state.lessons.filters;
export const selectPagination = (state: RootState) => state.lessons.pagination;
export const selectLoading = (state: RootState) => state.lessons.loading;
export const selectError = (state: RootState) => state.lessons.error;

export default lessonsSlice.reducer;
