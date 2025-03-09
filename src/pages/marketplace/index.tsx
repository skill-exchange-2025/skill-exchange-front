import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGetMarketplaceItemsQuery } from '@/redux/features/marketplace/marketplaceApi';
import {
  selectFilters,
  selectPagination,
  selectUserPreferences,
  setSearchTerm,
  setCategoryFilter,
  setSkillNameFilter,
  setProficiencyLevelFilter,
  setSortBy,
  setSortOrder,
  setCurrentPage,
  setTotalItems,
  setPriceRange,
  setViewMode,
} from '@/redux/features/marketplace/marketplaceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import { MarketplaceItemCard } from '@/pages/marketplace/marketplace-item-card';
import { MarketplaceFilterBar } from '@/pages/marketplace/marketplace-filters';
import { MarketplaceFilters } from '@/types/marketplace';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

// Skeleton component for marketplace items
const MarketplaceItemSkeleton = ({
  viewMode,
}: {
  viewMode: 'grid' | 'list';
}) => {
  if (viewMode === 'list') {
    return (
      <Card className="w-full overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4">
            <Skeleton className="h-[200px] w-full md:h-full rounded-l-md" />
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-[200px] w-full" />
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </CardFooter>
    </Card>
  );
};

export function MarketplacePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const userPreferences = useSelector(selectUserPreferences);

  const { data, isLoading, error } = useGetMarketplaceItemsQuery({
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    search: filters.search,
    category: filters.category || undefined,
    skillName: filters.skillName || undefined,
    proficiencyLevel: filters.proficiencyLevel || undefined,
    minPrice: filters.priceRange.min || undefined,
    maxPrice: filters.priceRange.max || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  // Debug log to see the API response structure
  useEffect(() => {
    if (data) {
      console.log('API Response Data:', data);
      console.log('First item structure:', data.data?.[0]);
    }
  }, [data]);

  useEffect(() => {
    if (data?.total) {
      dispatch(setTotalItems(data.total));
    }
  }, [data, dispatch]);

  const handleFilterChange = (newFilters: MarketplaceFilters) => {
    if (newFilters.search !== undefined) {
      dispatch(setSearchTerm(newFilters.search));
    }

    if (newFilters.category !== undefined) {
      dispatch(setCategoryFilter(newFilters.category || null));
    }

    if (newFilters.skillName !== undefined) {
      dispatch(setSkillNameFilter(newFilters.skillName || null));
    }

    if (newFilters.proficiencyLevel !== undefined) {
      dispatch(setProficiencyLevelFilter(newFilters.proficiencyLevel || null));
    }

    if (
      newFilters.minPrice !== undefined ||
      newFilters.maxPrice !== undefined
    ) {
      dispatch(
        setPriceRange({
          min: newFilters.minPrice || null,
          max: newFilters.maxPrice || null,
        })
      );
    }

    if (newFilters.sortBy) {
      dispatch(setSortBy(newFilters.sortBy));
    }

    if (newFilters.sortOrder) {
      dispatch(setSortOrder(newFilters.sortOrder));
    }

    // Reset to first page when filters change
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    dispatch(setViewMode(mode));
  };

  const handleCreateItem = () => {
    navigate('/marketplace/create');
  };

  const categories = [
    'Technology',
    'Design',
    'Marketing',
    'Business',
    'Education',
    'Health',
    'Other',
  ];

  const skillOptions = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'Design',
    'Marketing',
    'Business',
    'Education',
    'Health',
    'Other',
  ];

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Skill Exchange Marketplace</h1>
        <Button onClick={handleCreateItem}>
          <Plus className="mr-2 h-4 w-4" /> List New Item
        </Button>
      </div>

      <MarketplaceFilterBar
        filters={{
          search: filters.search,
          category: filters.category || undefined,
          skillName: filters.skillName || undefined,
          proficiencyLevel: filters.proficiencyLevel || undefined,
          minPrice: filters.priceRange.min || undefined,
          maxPrice: filters.priceRange.max || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }}
        onFilterChange={handleFilterChange}
        onViewModeChange={handleViewModeChange}
        viewMode={userPreferences.viewMode}
        categories={categories}
        skillOptions={skillOptions}
        proficiencyLevels={proficiencyLevels}
      />

      {isLoading ? (
        <div
          className={
            userPreferences.viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <MarketplaceItemSkeleton
              key={index}
              viewMode={userPreferences.viewMode}
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex justify-center py-12">
          <p className="text-red-500">Error loading marketplace items</p>
        </div>
      ) : (
        <>
          {data?.data && data.data.length > 0 ? (
            <div
              className={
                userPreferences.viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {data.data.map((item) => (
                <MarketplaceItemCard
                  key={item._id}
                  item={item}
                  viewMode={userPreferences.viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No items found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or create a new listing.
              </p>
              <Button onClick={handleCreateItem} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Create Listing
              </Button>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                {Array.from({
                  length: Math.ceil(
                    (data?.total || 0) / pagination.itemsPerPage
                  ),
                }).map((_, index) => (
                  <Button
                    key={index}
                    variant={
                      pagination.currentPage === index + 1
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
