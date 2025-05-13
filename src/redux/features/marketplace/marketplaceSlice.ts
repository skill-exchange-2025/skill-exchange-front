import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '@/redux/store';
import {ListingType, MarketplaceItem} from './marketplaceApi';

interface PriceRange {
  min: number | undefined;
  max: number | undefined;
}

interface MarketplaceFilters {
  search: string;
  category?: string;
  skillName?: string;
  proficiencyLevel?: string;
  type?: ListingType;
  priceRange: PriceRange;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

interface UserPreferences {
  viewMode: 'grid' | 'list';
}

export interface MarketplaceState {
  filters: MarketplaceFilters;
  pagination: PaginationState;
  userPreferences: UserPreferences;
  selectedItem: MarketplaceItem | null;
}

const initialState: MarketplaceState = {
  filters: {
    search: '',
    category: undefined,
    skillName: undefined,
    proficiencyLevel: undefined,
    type: undefined,
    priceRange: {
      min: undefined,
      max: undefined,
    },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 9,
    totalItems: 0,
  },
  userPreferences: {
    viewMode: 'grid',
  },
  selectedItem: null,
};

export const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when search changes
    },
    setCategoryFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.category = action.payload;
      state.pagination.currentPage = 1;
    },
    setSkillNameFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.skillName = action.payload;
      state.pagination.currentPage = 1;
    },
    setProficiencyLevelFilter: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.filters.proficiencyLevel = action.payload;
      state.pagination.currentPage = 1;
    },
    setTypeFilter: (state, action: PayloadAction<ListingType | undefined>) => {
      state.filters.type = action.payload;
      state.pagination.currentPage = 1;
    },
    setPriceRange: (state, action: PayloadAction<PriceRange>) => {
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
      state.pagination.currentPage = 1; // Reset to first page when items per page changes
    },
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.pagination.totalItems = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.userPreferences.viewMode = action.payload;
    },
    setSelectedItem: (state, action: PayloadAction<MarketplaceItem | null>) => {
      state.selectedItem = action.payload;
    },
    clearAllFilters: (state) => {
      // Reset all filters to their initial values
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
  },
});

export const {
  setSearchTerm,
  setCategoryFilter,
  setSkillNameFilter,
  setProficiencyLevelFilter,
  setTypeFilter,
  setPriceRange,
  setSortBy,
  setSortOrder,
  setCurrentPage,
  setItemsPerPage,
  setTotalItems,
  setViewMode,
  setSelectedItem,
  clearAllFilters,
} = marketplaceSlice.actions;

// Selectors
export const selectFilters = (state: RootState) => state.marketplace.filters;
export const selectPagination = (state: RootState) =>
  state.marketplace.pagination;
export const selectUserPreferences = (state: RootState) =>
  state.marketplace.userPreferences;
export const selectSelectedItem = (state: RootState) =>
  state.marketplace.selectedItem;

export default marketplaceSlice.reducer;
