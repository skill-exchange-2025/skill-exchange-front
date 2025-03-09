export interface MarketplaceItem {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  tags: string[];

  seller?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  status: 'active' | 'sold' | 'inactive';
  imagesUrl?: string[];
  views?: number;
  __v?: number;
}

export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  tags: string[];
  imagesUrl?: string[];
}

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

export interface MarketplaceFilters {
  search?: string;
  category?: string;
  skillName?: string;
  proficiencyLevel?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalItems: number;
  items: T[];
}
