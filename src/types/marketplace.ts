import { ListingType } from '@/redux/features/marketplace/marketplaceApi';

export interface MarketplaceItem {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  tags: string[];
  type: ListingType;

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

  // Course specific fields (static content)
  contentUrls?: string[];
  contentDescription?: string;

  // Online course specific fields (interactive/live sessions)
  location?: string;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
  materials?: string[];
  durationHours?: number;
}

export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  tags: string[];
  type: ListingType;
  imagesUrl?: string[];
}

export interface CreateCourseRequest extends CreateMarketplaceItemRequest {
  type: ListingType.COURSE;
  contentUrls?: string[];
  contentDescription?: string;
}

export interface CreateOnlineCourseRequest
  extends CreateMarketplaceItemRequest {
  type: ListingType.ONLINE_COURSE;
  location?: string;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
  materials?: string[];
  durationHours?: number;
}

export interface MarketplaceState {
  selectedItem: MarketplaceItem | null;
  filters: {
    search: string;
    category: string | null;
    skillName: string | null;
    proficiencyLevel: string | null;
    type: ListingType | null;
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
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
