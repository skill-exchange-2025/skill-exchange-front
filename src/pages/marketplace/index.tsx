import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {
    ListingType,
    useGetCoursesQuery,
    useGetMarketplaceItemsQuery,
    useGetOnlineCoursesQuery,
} from '@/redux/features/marketplace/marketplaceApi';
import {
    clearAllFilters,
    selectFilters,
    selectPagination,
    selectUserPreferences,
    setCategoryFilter,
    setCurrentPage,
    setPriceRange,
    setProficiencyLevelFilter,
    setSearchTerm,
    setSkillNameFilter,
    setSortBy,
    setSortOrder,
    setTotalItems,
    setTypeFilter,
    setViewMode,
} from '@/redux/features/marketplace/marketplaceSlice';
import {useDispatch, useSelector} from 'react-redux';
import {ArrowLeft, Plus} from 'lucide-react';
import {MarketplaceItemCard} from '@/pages/marketplace/marketplace-item-card';
import {MarketplaceFilterBar} from '@/pages/marketplace/marketplace-filters';
import {MarketplaceFilters} from '@/types/marketplace';
import {Skeleton} from '@/components/ui/skeleton';
import {Card, CardContent, CardFooter, CardHeader,} from '@/components/ui/card';

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

interface MarketplacePageProps {
  type?: string;
}

export function MarketplacePage({ type }: MarketplacePageProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const userPreferences = useSelector(selectUserPreferences);

  // Set the type filter based on the prop or URL parameter
  useEffect(() => {
    // Check for type from props first
    if (type) {
      console.log('Setting type filter from props:', type);
      dispatch(setTypeFilter(type as ListingType));
    } else {
      // Then check URL parameters
      const typeParam = searchParams.get('type');
      if (typeParam) {
        console.log('Setting type filter from URL param:', typeParam);
        dispatch(setTypeFilter(typeParam as ListingType));
      } else {
        // Clear type filter if no type is specified
        dispatch(setTypeFilter(undefined));
      }
    }

    // Reset to first page when type changes
    dispatch(setCurrentPage(1));
  }, [type, searchParams, dispatch]);

  // Debug log to see what filters are being applied
  useEffect(() => {
    console.log('Current filters being applied:', filters);
  }, [filters]);

  // Use the appropriate query hook based on the type
  const coursesQuery = useGetCoursesQuery(
    {
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
    },
    { skip: filters.type !== ListingType.COURSE }
  );

  const onlineCoursesQuery = useGetOnlineCoursesQuery(
    {
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
    },
    { skip: filters.type !== ListingType.ONLINE_COURSE }
  );

  const allListingsQuery = useGetMarketplaceItemsQuery(
    {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      search: filters.search,
      category: filters.category || undefined,
      skillName: filters.skillName || undefined,
      proficiencyLevel: filters.proficiencyLevel || undefined,
      type: filters.type || undefined,
      minPrice: filters.priceRange.min || undefined,
      maxPrice: filters.priceRange.max || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    },
    {
      skip:
        filters.type === ListingType.COURSE ||
        filters.type === ListingType.ONLINE_COURSE,
    }
  );

  // Determine which query to use based on the type
  let data, error, isLoading;

  if (filters.type === ListingType.COURSE) {
    data = coursesQuery.data;
    error = coursesQuery.error;
    isLoading = coursesQuery.isLoading;
    console.log('Using courses query');
  } else if (filters.type === ListingType.ONLINE_COURSE) {
    data = onlineCoursesQuery.data;
    error = onlineCoursesQuery.error;
    isLoading = onlineCoursesQuery.isLoading;
    console.log('Using online courses query');
  } else {
    data = allListingsQuery.data;
    error = allListingsQuery.error;
    isLoading = allListingsQuery.isLoading;
    console.log('Using all listings query');
  }

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
    // Check if this is a clear all filters operation
    if (
      newFilters.search === '' &&
      newFilters.category === undefined &&
      newFilters.skillName === undefined &&
      newFilters.proficiencyLevel === undefined &&
      newFilters.type === undefined &&
      newFilters.minPrice === 0 &&
      newFilters.maxPrice === 1000 &&
      newFilters.sortBy === 'createdAt' &&
      newFilters.sortOrder === 'desc'
    ) {
      // This is a clear all filters operation
      console.log('Clearing all filters');
      dispatch(clearAllFilters());

      // Update URL to remove all filter parameters
      const currentPath = window.location.pathname;
      navigate(currentPath);
      return;
    }

    // Handle individual filter changes
    if ('search' in newFilters) {
      dispatch(setSearchTerm(newFilters.search || ''));
    }

    if ('category' in newFilters) {
      dispatch(setCategoryFilter(newFilters.category));
    }

    if ('skillName' in newFilters) {
      dispatch(setSkillNameFilter(newFilters.skillName));
    }

    if ('proficiencyLevel' in newFilters) {
      dispatch(setProficiencyLevelFilter(newFilters.proficiencyLevel));
    }

    if ('type' in newFilters) {
      dispatch(setTypeFilter(newFilters.type));
    }

    if ('minPrice' in newFilters || 'maxPrice' in newFilters) {
      dispatch(
        setPriceRange({
          min: newFilters.minPrice,
          max: newFilters.maxPrice,
        })
      );
    }

    if ('sortBy' in newFilters) {
      dispatch(setSortBy(newFilters.sortBy || 'createdAt'));
    }

    if ('sortOrder' in newFilters) {
      dispatch(setSortOrder(newFilters.sortOrder || 'desc'));
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
    navigate('/marketplace?action=create');
  };

  const getPageTitle = () => {
    if (filters.type === ListingType.COURSE) {
      return 'Static Courses';
    } else if (filters.type === ListingType.ONLINE_COURSE) {
      return 'Interactive Courses';
    } else {
      return 'All Listings';
    }
  };

  const handleBack = () => {
    navigate('/marketplace');
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
        <div>
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
          </Button>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
        </div>
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
          type: filters.type || undefined,
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
