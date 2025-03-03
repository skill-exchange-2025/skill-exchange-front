import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceItem } from './marketplaceApi';

export interface MarketplaceState {
  selectedItem: MarketplaceItem | null;
  filters: {
    search: string;
    category: string | null;
    skillName: string | null;
    proficiencyLevel: string | null;
    priceRange: {
      min: number | null;
      max: number | null;
    };
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
  userPreferences: {
    viewMode: 'grid' | 'list';
  };
}

const initialState: MarketplaceState = {
  selectedItem: null,
  filters: {
    search: '',
    category: null,
    skillName: null,
    proficiencyLevel: null,
    priceRange: {
      min: null,
      max: null,
    },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
  },
  userPreferences: {
    viewMode: 'grid',
  },
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<MarketplaceItem | null>) => {
      state.selectedItem = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
      state.pagination.currentPage = 1;
    },
    setSkillNameFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.skillName = action.payload;
      state.pagination.currentPage = 1;
    },
    setProficiencyLevelFilter: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.filters.proficiencyLevel = action.payload;
      state.pagination.currentPage = 1;
    },
    setPriceRange: (
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>
    ) => {
      state.filters.priceRange = action.payload;
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
      state.pagination.currentPage = 1;
    },
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.pagination.totalItems = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.userPreferences.viewMode = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
  },
});

export const {
  setSelectedItem,
  setSearchTerm,
  setCategoryFilter,
  setSkillNameFilter,
  setProficiencyLevelFilter,
  setPriceRange,
  setSortBy,
  setSortOrder,
  setCurrentPage,
  setItemsPerPage,
  setTotalItems,
  setViewMode,
  resetFilters,
} = marketplaceSlice.actions;

// Selectors
export const selectSelectedItem = (state: { marketplace: MarketplaceState }) =>
  state.marketplace.selectedItem;
export const selectFilters = (state: { marketplace: MarketplaceState }) =>
  state.marketplace.filters;
export const selectPagination = (state: { marketplace: MarketplaceState }) =>
  state.marketplace.pagination;
export const selectUserPreferences = (state: {
  marketplace: MarketplaceState;
}) => state.marketplace.userPreferences;

export default marketplaceSlice.reducer;
