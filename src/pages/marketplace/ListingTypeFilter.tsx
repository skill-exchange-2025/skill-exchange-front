import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ListingType } from '@/redux/features/marketplace/marketplaceApi';
import {
  selectFilters,
  setTypeFilter,
} from '@/redux/features/marketplace/marketplaceSlice';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, FileText } from 'lucide-react';

export function ListingTypeFilter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { type: selectedType } = useSelector(selectFilters);

  // Check URL parameters for type on component mount
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && typeParam !== selectedType) {
      console.log(
        'Setting type filter from URL in ListingTypeFilter:',
        typeParam
      );
      dispatch(setTypeFilter(typeParam as ListingType));
    }
  }, [searchParams, dispatch, selectedType]);

  // Listen for changes to filters from outside this component
  useEffect(() => {
    // If selectedType is null but URL has type parameter, update URL
    const typeParam = searchParams.get('type');
    if (!selectedType && typeParam) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('type');
      setSearchParams(newSearchParams);
    }
  }, [selectedType, searchParams, setSearchParams]);

  const handleTypeChange = (type: ListingType | '_all') => {
    console.log('Type filter changed to:', type);
    // Convert "_all" special value back to undefined for the filter
    const actualType = type === '_all' ? undefined : type;
    dispatch(setTypeFilter(actualType));

    // Update URL to reflect the type filter
    const newSearchParams = new URLSearchParams(searchParams);

    if (actualType) {
      newSearchParams.set('type', actualType);
    } else {
      newSearchParams.delete('type');
    }

    // Update the search params
    setSearchParams(newSearchParams);

    // If we're on a specific type page, navigate to the appropriate page
    const currentPath = location.pathname;
    if (
      actualType === ListingType.COURSE &&
      !currentPath.includes('/marketplace/courses')
    ) {
      navigate(`/marketplace/courses?type=${actualType}`);
    } else if (
      actualType === ListingType.ONLINE_COURSE &&
      !currentPath.includes('/marketplace/online-courses')
    ) {
      navigate(`/marketplace/online-courses?type=${actualType}`);
    } else if (!actualType && !currentPath.includes('/marketplace/all')) {
      navigate('/marketplace/all');
    }
  };

  const listingTypes = [
    {
      value: '_all' as const,
      label: 'All Types',
      icon: FileText,
    },
    {
      value: ListingType.COURSE,
      label: 'Static Courses',
      icon: BookOpen,
    },
    {
      value: ListingType.ONLINE_COURSE,
      label: 'Interactive Courses',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {listingTypes.map((type) => (
        <Button
          key={type.label}
          variant={
            (selectedType === undefined && type.value === '_all') ||
            selectedType === type.value
              ? 'default'
              : 'outline'
          }
          size="sm"
          onClick={() => handleTypeChange(type.value)}
          className="flex items-center gap-1"
        >
          <type.icon className="h-4 w-4" />
          {type.label}
        </Button>
      ))}
    </div>
  );
}
