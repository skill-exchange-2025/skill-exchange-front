import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User, UsersState} from '@/types/user';

const initialState: UsersState = {
    selectedUser: null,
    filters: {
        search: '',
        role: null,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
    },
    userPreferences: {
        viewMode: 'list',
        showDeactivatedUsers: false,
    },
    metrics: {
        totalUsers: 0,
        activeUsers: 0,
        lastUpdated: null,
    },
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        // User selection
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },

        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.filters.search = action.payload;
            state.pagination.currentPage = 1; // Reset to first page when search changes
        },

        setRoleFilter: (state, action: PayloadAction<string | null>) => {
            state.filters.role = action.payload;
            state.pagination.currentPage = 1;
        },

        setSortBy: (state, action: PayloadAction<string>) => {
            state.filters.sortBy = action.payload;
        },

        setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
            state.filters.sortOrder = action.payload;
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

        setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
            state.userPreferences.viewMode = action.payload;
        },

        setShowDeactivatedUsers: (state, action: PayloadAction<boolean>) => {
            state.userPreferences.showDeactivatedUsers = action.payload;
            state.pagination.currentPage = 1;
        },

        updateMetrics: (state, action: PayloadAction<{ totalUsers: number; activeUsers: number }>) => {
            state.metrics = {
                ...action.payload,
                lastUpdated: new Date().toISOString(),
            };
        },

        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.currentPage = 1;
        },

        resetAll: () => initialState,
    },
});

// Export actions
export const {
    setSelectedUser,
    setSearchTerm,
    setRoleFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setItemsPerPage,
    setTotalItems,
    setViewMode,
    setShowDeactivatedUsers,
    updateMetrics,
    resetFilters,
    resetAll,
} = usersSlice.actions;

export const selectSelectedUser = (state: { users: UsersState }) => state.users.selectedUser;
export const selectFilters = (state: { users: UsersState }) => state.users.filters;
export const selectPagination = (state: { users: UsersState }) => state.users.pagination;
export const selectUserPreferences = (state: { users: UsersState }) => state.users.userPreferences;
export const selectMetrics = (state: { users: UsersState }) => state.users.metrics;

export default usersSlice.reducer;