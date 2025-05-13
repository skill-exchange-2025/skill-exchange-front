import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Slider} from '@/components/ui/slider';
import {LayoutGrid, List, RotateCcw, Search, SlidersHorizontal, X,} from 'lucide-react';
import {MarketplaceFilters} from '@/types/marketplace';
import {ListingTypeFilter} from './ListingTypeFilter';

interface MarketplaceFilterBarProps {
  filters: MarketplaceFilters;
  onFilterChange: (filters: Partial<MarketplaceFilters>) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  categories: string[];
  skillOptions: string[];
  proficiencyLevels: string[];
}

export function MarketplaceFilterBar({
  filters,
  onFilterChange,
  onViewModeChange,
  viewMode,
  categories,
  skillOptions,
  proficiencyLevels,
}: MarketplaceFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000,
  ]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(
    filters.search || ''
  );

  // Update local state when filters prop changes
  useEffect(() => {
    setSearchValue(filters.search || '');
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 1000]);
  }, [filters]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Apply search filter when debounced value changes
  useEffect(() => {
    onFilterChange({ search: debouncedSearchValue });
  }, [debouncedSearchValue, onFilterChange]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    onFilterChange({
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  const handleCategoryChange = (value: string) => {
    // Convert "_all" special value back to undefined for the filter
    onFilterChange({ category: value === '_all' ? undefined : value });
  };

  const handleSkillChange = (value: string) => {
    // Convert "_all" special value back to undefined for the filter
    onFilterChange({ skillName: value === '_all' ? undefined : value });
  };

  const handleProficiencyChange = (value: string) => {
    // Convert "_all" special value back to undefined for the filter
    onFilterChange({ proficiencyLevel: value === '_all' ? undefined : value });
  };

  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    onFilterChange({ sortOrder: value });
  };

  const handleClearFilters = () => {
    // Reset all filters to their default values
    setSearchValue('');
    setPriceRange([0, 1000]);

    // Call onFilterChange with all filters reset
    onFilterChange({
      search: '',
      category: undefined,
      skillName: undefined,
      proficiencyLevel: undefined,
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      type: undefined,
    });

    // Log that filters were cleared
    console.log('All filters cleared');
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchValue('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary/10' : ''}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewModeChange('grid')}
            className={viewMode === 'grid' ? 'bg-primary/10' : ''}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewModeChange('list')}
            className={viewMode === 'list' ? 'bg-primary/10' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Filters</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Listing Type</h3>
            <ListingTypeFilter />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Category</h3>
            <Select
              value={filters.category || '_all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Skill</h3>
            <Select
              value={filters.skillName || '_all'}
              onValueChange={handleSkillChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Skills</SelectItem>
                {skillOptions.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Proficiency Level</h3>
            <Select
              value={filters.proficiencyLevel || '_all'}
              onValueChange={handleProficiencyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Levels</SelectItem>
                {proficiencyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium">Price Range</h3>
              <span className="text-sm text-muted-foreground">
                {priceRange[0]} - {priceRange[1]} credits
              </span>
            </div>
            <Slider
              defaultValue={[priceRange[0], priceRange[1]]}
              value={[priceRange[0], priceRange[1]]}
              max={1000}
              step={10}
              onValueChange={handlePriceChange}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sort Order</h3>
            <Select
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) =>
                handleSortOrderChange(value as 'asc' | 'desc')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
