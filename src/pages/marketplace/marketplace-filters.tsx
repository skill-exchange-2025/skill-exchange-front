import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { MarketplaceFilters } from '@/types/marketplace';

interface MarketplaceFilterProps {
  filters: MarketplaceFilters;
  onFilterChange: (filters: MarketplaceFilters) => void;
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
}: MarketplaceFilterProps) {
  const [localFilters, setLocalFilters] = useState<MarketplaceFilters>({
    ...filters,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setLocalFilters((prev) => ({ ...prev, search }));
    onFilterChange({ ...filters, search });
  };

  const handleCategoryChange = (category: string | undefined) => {
    setLocalFilters((prev) => ({ ...prev, category }));
    onFilterChange({ ...filters, category });
  };

  const handleSkillNameChange = (skillName: string | undefined) => {
    setLocalFilters((prev) => ({ ...prev, skillName }));
    onFilterChange({ ...filters, skillName });
  };

  const handleProficiencyLevelChange = (
    proficiencyLevel: string | undefined
  ) => {
    setLocalFilters((prev) => ({ ...prev, proficiencyLevel }));
    onFilterChange({ ...filters, proficiencyLevel });
  };

  const handlePriceChange = (values: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      minPrice: values[0] || undefined,
      maxPrice: values[1] || undefined,
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setLocalFilters((prev) => ({ ...prev, sortBy }));
    onFilterChange({ ...filters, sortBy });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    setLocalFilters((prev) => ({ ...prev, sortOrder }));
    onFilterChange({ ...filters, sortOrder });
  };

  const applyPriceFilter = () => {
    onFilterChange({
      ...filters,
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
    });
  };

  const resetFilters = () => {
    const resetFilters: MarketplaceFilters = {
      search: '',
      category: undefined,
      skillName: undefined,
      proficiencyLevel: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Input
          placeholder="Search marketplace..."
          value={localFilters.search || ''}
          onChange={handleSearchChange}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            {localFilters.category || 'All Categories'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleCategoryChange(undefined)}>
            All Categories
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            {localFilters.skillName || 'All Skills'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleSkillNameChange(undefined)}>
            All Skills
          </DropdownMenuItem>
          {skillOptions.map((skill) => (
            <DropdownMenuItem
              key={skill}
              onClick={() => handleSkillNameChange(skill)}
            >
              {skill}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            {localFilters.proficiencyLevel || 'Any Level'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => handleProficiencyLevelChange(undefined)}
          >
            Any Level
          </DropdownMenuItem>
          {proficiencyLevels.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => handleProficiencyLevelChange(level)}
            >
              {level}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Adjust filters to find exactly what you're looking for.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="pt-4">
                <Slider
                  defaultValue={[
                    localFilters.minPrice || 0,
                    localFilters.maxPrice || 1000,
                  ]}
                  max={1000}
                  step={10}
                  onValueChange={handlePriceChange}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span>${localFilters.minPrice || 0}</span>
                <span>${localFilters.maxPrice || 1000}+</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {localFilters.sortBy === 'createdAt'
                      ? 'Date'
                      : localFilters.sortBy === 'price'
                      ? 'Price'
                      : localFilters.sortBy === 'title'
                      ? 'Title'
                      : 'Date'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleSortChange('createdAt')}
                  >
                    Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('price')}>
                    Price
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('title')}>
                    Title
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <div className="flex gap-2">
                <Button
                  variant={
                    localFilters.sortOrder === 'asc' ? 'default' : 'outline'
                  }
                  className="flex-1"
                  onClick={() => handleSortOrderChange('asc')}
                >
                  Ascending
                </Button>
                <Button
                  variant={
                    localFilters.sortOrder === 'desc' ? 'default' : 'outline'
                  }
                  className="flex-1"
                  onClick={() => handleSortOrderChange('desc')}
                >
                  Descending
                </Button>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <SheetClose asChild>
              <Button onClick={applyPriceFilter}>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="flex gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
